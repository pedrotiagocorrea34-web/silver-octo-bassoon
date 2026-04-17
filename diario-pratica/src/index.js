/**
 * Escrituras Sagradas - Diário de Prática
 * Cloudflare Worker com D1, OpenAI e SPA integrada
 */

import { handleApiRequest } from './api.js';
import { getHtml } from './frontend.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
};

let tablesCreated = false;

async function ensureTables(db) {
  if (tablesCreated) return;
  try {
    const statements = [
      `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT 'Anônimo', created_at TEXT, updated_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS practice_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, category_id TEXT NOT NULL, book_id TEXT NOT NULL, book_name TEXT NOT NULL DEFAULT '', chapter INTEGER NOT NULL, chapter_title TEXT NOT NULL DEFAULT '', chapter_content TEXT NOT NULL DEFAULT '', started_at TEXT, status TEXT NOT NULL DEFAULT 'active')`,
      `CREATE TABLE IF NOT EXISTS diary_entries (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id INTEGER NOT NULL, user_id TEXT NOT NULL, entry_text TEXT NOT NULL, created_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS ai_feedbacks (id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, session_id INTEGER NOT NULL, user_id TEXT NOT NULL, feedback_text TEXT NOT NULL, consonance_score REAL DEFAULT 0, strengths_json TEXT NOT NULL DEFAULT '[]', improvements_json TEXT NOT NULL DEFAULT '[]', created_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS user_profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL UNIQUE, total_sessions INTEGER NOT NULL DEFAULT 0, total_entries INTEGER NOT NULL DEFAULT 0, avg_consonance REAL NOT NULL DEFAULT 0, strengths TEXT NOT NULL DEFAULT '[]', areas_to_improve TEXT NOT NULL DEFAULT '[]', spiritual_journey TEXT NOT NULL DEFAULT '[]', virtues_radar TEXT NOT NULL DEFAULT '{}', last_updated TEXT)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_user ON practice_sessions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_status ON practice_sessions(status)`,
      `CREATE INDEX IF NOT EXISTS idx_entries_session ON diary_entries(session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_entries_user ON diary_entries(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_feedbacks_entry ON ai_feedbacks(entry_id)`,
      `CREATE INDEX IF NOT EXISTS idx_feedbacks_user ON ai_feedbacks(user_id)`,
    ];

    const batch = statements.map(sql => db.prepare(sql));
    await db.batch(batch);
    tablesCreated = true;
  } catch (err) {
    console.error('Table creation error:', err);
    // Tables might already exist, that's ok
    tablesCreated = true;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Ensure tables exist
    await ensureTables(env.DB);

    // API routes
    if (url.pathname.startsWith('/api/')) {
      try {
        const response = await handleApiRequest(request, env, url);
        const newHeaders = new Headers(response.headers);
        Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));
        return new Response(response.body, {
          status: response.status,
          headers: newHeaders,
        });
      } catch (err) {
        console.error('API Error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }
    }

    // Serve SPA for all other routes
    return new Response(getHtml(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};
