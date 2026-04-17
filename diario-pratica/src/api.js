/**
 * API Routes Handler
 */

import { getAiFeedback, getProfileAnalysis } from './openai.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getUserId(request) {
  return request.headers.get('X-User-Id') || 'anonymous';
}

export async function handleApiRequest(request, env, url) {
  const path = url.pathname.replace('/api/', '');
  const method = request.method;
  const userId = getUserId(request);

  // Ensure user exists
  if (userId !== 'anonymous') {
    await ensureUser(env.DB, userId);
  }

  // Route matching
  if (path === 'health') {
    return json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  if (path === 'user' && method === 'POST') {
    const body = await request.json();
    return await createOrUpdateUser(env.DB, userId, body);
  }

  if (path === 'sessions' && method === 'GET') {
    return await getSessions(env.DB, userId);
  }

  if (path === 'sessions' && method === 'POST') {
    const body = await request.json();
    return await createSession(env.DB, userId, body);
  }

  if (path === 'sessions/active' && method === 'GET') {
    return await getActiveSession(env.DB, userId);
  }

  const sessionMatch = path.match(/^sessions\/(\d+)\/complete$/);
  if (sessionMatch && method === 'POST') {
    return await completeSession(env.DB, userId, parseInt(sessionMatch[1]));
  }

  if (path === 'entries' && method === 'POST') {
    const body = await request.json();
    return await createEntry(env.DB, userId, body);
  }

  if (path === 'entries' && method === 'GET') {
    return await getEntries(env.DB, userId, url);
  }

  if (path === 'feedback' && method === 'POST') {
    const body = await request.json();
    return await generateFeedback(env, userId, body);
  }

  if (path === 'profile' && method === 'GET') {
    return await getProfile(env.DB, userId);
  }

  if (path === 'profile/refresh' && method === 'POST') {
    return await refreshProfile(env, userId);
  }

  if (path === 'history' && method === 'GET') {
    return await getHistory(env.DB, userId, url);
  }

  return json({ error: 'Not found' }, 404);
}

async function ensureUser(db, userId) {
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT OR IGNORE INTO users (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`
  ).bind(userId, 'Usuário', now, now).run();
}

async function createOrUpdateUser(db, userId, body) {
  const { name } = body;
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO users (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = ?, updated_at = ?`
  ).bind(userId, name || 'Usuário', now, now, name || 'Usuário', now).run();
  return json({ success: true });
}

async function getSessions(db, userId) {
  const { results } = await db.prepare(
    `SELECT ps.*, 
            COUNT(de.id) as entry_count,
            AVG(af.consonance_score) as avg_score
     FROM practice_sessions ps
     LEFT JOIN diary_entries de ON de.session_id = ps.id
     LEFT JOIN ai_feedbacks af ON af.session_id = ps.id
     WHERE ps.user_id = ?
     GROUP BY ps.id
     ORDER BY ps.started_at DESC
     LIMIT 50`
  ).bind(userId).all();
  return json({ sessions: results });
}

async function createSession(db, userId, body) {
  const { categoryId, bookId, bookName, chapter, chapterTitle, chapterContent } = body;
  
  if (!categoryId || !bookId || !chapter) {
    return json({ error: 'categoryId, bookId e chapter são obrigatórios' }, 400);
  }

  // Deactivate any existing active session
  await db.prepare(
    `UPDATE practice_sessions SET status = 'completed' WHERE user_id = ? AND status = 'active'`
  ).bind(userId).run();

  const now = new Date().toISOString();
  const result = await db.prepare(
    `INSERT INTO practice_sessions (user_id, category_id, book_id, book_name, chapter, chapter_title, chapter_content, started_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(userId, categoryId, bookId, bookName || '', chapter, chapterTitle || '', chapterContent || '', now).run();

  return json({ success: true, sessionId: result.meta.last_row_id });
}

async function getActiveSession(db, userId) {
  const session = await db.prepare(
    `SELECT * FROM practice_sessions WHERE user_id = ? AND status = 'active' ORDER BY started_at DESC LIMIT 1`
  ).bind(userId).first();
  return json({ session });
}

async function completeSession(db, userId, sessionId) {
  await db.prepare(
    `UPDATE practice_sessions SET status = 'completed' WHERE id = ? AND user_id = ?`
  ).bind(sessionId, userId).run();
  return json({ success: true });
}

async function createEntry(db, userId, body) {
  const { sessionId, entryText } = body;
  
  if (!sessionId || !entryText) {
    return json({ error: 'sessionId e entryText são obrigatórios' }, 400);
  }

  // Verify session belongs to user
  const session = await db.prepare(
    `SELECT * FROM practice_sessions WHERE id = ? AND user_id = ?`
  ).bind(sessionId, userId).first();

  if (!session) {
    return json({ error: 'Sessão não encontrada' }, 404);
  }

  const now = new Date().toISOString();
  const result = await db.prepare(
    `INSERT INTO diary_entries (session_id, user_id, entry_text, created_at) VALUES (?, ?, ?, ?)`
  ).bind(sessionId, userId, entryText, now).run();

  return json({ success: true, entryId: result.meta.last_row_id });
}

async function getEntries(db, userId, url) {
  const sessionId = url.searchParams.get('sessionId');
  let query = `SELECT de.*, ps.book_name, ps.chapter, ps.chapter_title
               FROM diary_entries de
               JOIN practice_sessions ps ON ps.id = de.session_id
               WHERE de.user_id = ?`;
  const params = [userId];

  if (sessionId) {
    query += ` AND de.session_id = ?`;
    params.push(sessionId);
  }

  query += ` ORDER BY de.created_at DESC LIMIT 50`;

  const { results } = await db.prepare(query).bind(...params).all();
  return json({ entries: results });
}

async function generateFeedback(env, userId, body) {
  const { entryId, sessionId } = body;

  if (!entryId || !sessionId) {
    return json({ error: 'entryId e sessionId são obrigatórios' }, 400);
  }

  // Get the diary entry
  const entry = await env.DB.prepare(
    `SELECT * FROM diary_entries WHERE id = ? AND user_id = ?`
  ).bind(entryId, userId).first();

  if (!entry) {
    return json({ error: 'Entrada não encontrada' }, 404);
  }

  // Get the session with chapter content
  const session = await env.DB.prepare(
    `SELECT * FROM practice_sessions WHERE id = ? AND user_id = ?`
  ).bind(sessionId, userId).first();

  if (!session) {
    return json({ error: 'Sessão não encontrada' }, 404);
  }

  // Check if feedback already exists
  const existing = await env.DB.prepare(
    `SELECT * FROM ai_feedbacks WHERE entry_id = ?`
  ).bind(entryId).first();

  if (existing) {
    return json({
      feedback: existing,
      cached: true
    });
  }

  // Generate AI feedback
  const aiResult = await getAiFeedback(env, session, entry);

  // Save feedback
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    `INSERT INTO ai_feedbacks (entry_id, session_id, user_id, feedback_text, consonance_score, strengths_json, improvements_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    entryId, sessionId, userId,
    aiResult.feedback,
    aiResult.consonanceScore,
    JSON.stringify(aiResult.strengths),
    JSON.stringify(aiResult.improvements),
    now
  ).run();

  // Update user profile
  await updateProfile(env, userId);

  return json({
    feedback: {
      id: result.meta.last_row_id,
      feedback_text: aiResult.feedback,
      consonance_score: aiResult.consonanceScore,
      strengths_json: JSON.stringify(aiResult.strengths),
      improvements_json: JSON.stringify(aiResult.improvements),
    },
    cached: false
  });
}

async function getProfile(db, userId) {
  let profile = await db.prepare(
    `SELECT * FROM user_profiles WHERE user_id = ?`
  ).bind(userId).first();

  if (!profile) {
    // Create default profile
    const now = new Date().toISOString();
    await db.prepare(
      `INSERT INTO user_profiles (user_id, last_updated) VALUES (?, ?)`
    ).bind(userId, now).run();
    profile = await db.prepare(
      `SELECT * FROM user_profiles WHERE user_id = ?`
    ).bind(userId).first();
  }

  // Get recent feedbacks for journey timeline
  const { results: recentFeedbacks } = await db.prepare(
    `SELECT af.consonance_score, af.strengths_json, af.improvements_json, af.created_at,
            ps.book_name, ps.chapter, ps.chapter_title
     FROM ai_feedbacks af
     JOIN practice_sessions ps ON ps.id = af.session_id
     WHERE af.user_id = ?
     ORDER BY af.created_at DESC
     LIMIT 30`
  ).bind(userId).all();

  return json({ profile, recentFeedbacks });
}

async function refreshProfile(env, userId) {
  await updateProfile(env, userId);
  return await getProfile(env.DB, userId);
}

async function updateProfile(env, userId) {
  // Get all feedbacks for this user
  const { results: feedbacks } = await env.DB.prepare(
    `SELECT af.*, ps.book_name, ps.chapter_title
     FROM ai_feedbacks af
     JOIN practice_sessions ps ON ps.id = af.session_id
     WHERE af.user_id = ?
     ORDER BY af.created_at DESC`
  ).bind(userId).all();

  if (feedbacks.length === 0) return;

  const totalEntries = feedbacks.length;
  const avgConsonance = feedbacks.reduce((sum, f) => sum + (f.consonance_score || 0), 0) / totalEntries;

  // Aggregate strengths and improvements
  const strengthsMap = {};
  const improvementsMap = {};

  for (const f of feedbacks) {
    try {
      const strengths = JSON.parse(f.strengths_json || '[]');
      const improvements = JSON.parse(f.improvements_json || '[]');
      strengths.forEach(s => { strengthsMap[s] = (strengthsMap[s] || 0) + 1; });
      improvements.forEach(i => { improvementsMap[i] = (improvementsMap[i] || 0) + 1; });
    } catch (e) { /* ignore parse errors */ }
  }

  const topStrengths = Object.entries(strengthsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const topImprovements = Object.entries(improvementsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Build spiritual journey timeline
  const journey = feedbacks.slice(0, 20).map(f => ({
    date: f.created_at,
    score: f.consonance_score,
    book: f.book_name,
    chapter: f.chapter_title,
  }));

  // Build virtues radar
  const virtues = {
    'Compaixão': 0, 'Paciência': 0, 'Sabedoria': 0,
    'Humildade': 0, 'Gratidão': 0, 'Coragem': 0,
    'Disciplina': 0, 'Generosidade': 0
  };

  // If we have enough data, try to get AI analysis
  let profileAnalysis = null;
  if (feedbacks.length >= 3 && env.OPENAI_API_KEY) {
    try {
      profileAnalysis = await getProfileAnalysis(env, feedbacks.slice(0, 15));
      if (profileAnalysis && profileAnalysis.virtues) {
        Object.assign(virtues, profileAnalysis.virtues);
      }
    } catch (e) {
      console.error('Profile analysis error:', e);
    }
  }

  const { results: sessionCount } = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM practice_sessions WHERE user_id = ?`
  ).bind(userId).all();

  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO user_profiles (user_id, total_sessions, total_entries, avg_consonance, strengths, areas_to_improve, spiritual_journey, virtues_radar, last_updated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       total_sessions = ?, total_entries = ?, avg_consonance = ?,
       strengths = ?, areas_to_improve = ?, spiritual_journey = ?,
       virtues_radar = ?, last_updated = ?`
  ).bind(
    userId,
    sessionCount[0]?.count || 0, totalEntries, avgConsonance,
    JSON.stringify(topStrengths), JSON.stringify(topImprovements),
    JSON.stringify(journey), JSON.stringify(virtues), now,
    sessionCount[0]?.count || 0, totalEntries, avgConsonance,
    JSON.stringify(topStrengths), JSON.stringify(topImprovements),
    JSON.stringify(journey), JSON.stringify(virtues), now
  ).run();
}

async function getHistory(db, userId, url) {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;

  const { results } = await db.prepare(
    `SELECT ps.id as session_id, ps.book_name, ps.chapter, ps.chapter_title, ps.started_at, ps.status,
            de.id as entry_id, de.entry_text, de.created_at as entry_date,
            af.feedback_text, af.consonance_score, af.strengths_json, af.improvements_json
     FROM practice_sessions ps
     LEFT JOIN diary_entries de ON de.session_id = ps.id
     LEFT JOIN ai_feedbacks af ON af.entry_id = de.id
     WHERE ps.user_id = ?
     ORDER BY ps.started_at DESC
     LIMIT ? OFFSET ?`
  ).bind(userId, limit, offset).all();

  const { results: countResult } = await db.prepare(
    `SELECT COUNT(*) as total FROM practice_sessions WHERE user_id = ?`
  ).bind(userId).all();

  return json({
    history: results,
    total: countResult[0]?.total || 0,
    page,
    totalPages: Math.ceil((countResult[0]?.total || 0) / limit)
  });
}
