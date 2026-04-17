-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Anônimo',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sessões de prática (capítulo escolhido para treinar)
CREATE TABLE IF NOT EXISTS practice_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    book_name TEXT NOT NULL DEFAULT '',
    chapter INTEGER NOT NULL,
    chapter_title TEXT NOT NULL DEFAULT '',
    chapter_content TEXT NOT NULL DEFAULT '',
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Entradas do diário
CREATE TABLE IF NOT EXISTS diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    entry_text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES practice_sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Feedbacks da IA
CREATE TABLE IF NOT EXISTS ai_feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    feedback_text TEXT NOT NULL,
    consonance_score REAL DEFAULT 0,
    strengths_json TEXT NOT NULL DEFAULT '[]',
    improvements_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (entry_id) REFERENCES diary_entries(id),
    FOREIGN KEY (session_id) REFERENCES practice_sessions(id)
);

-- Perfil espiritual do usuário
CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_entries INTEGER NOT NULL DEFAULT 0,
    avg_consonance REAL NOT NULL DEFAULT 0,
    strengths TEXT NOT NULL DEFAULT '[]',
    areas_to_improve TEXT NOT NULL DEFAULT '[]',
    spiritual_journey TEXT NOT NULL DEFAULT '[]',
    virtues_radar TEXT NOT NULL DEFAULT '{}',
    last_updated TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON practice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_entries_session ON diary_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_entries_user ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_entry ON ai_feedbacks(entry_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user ON ai_feedbacks(user_id);
