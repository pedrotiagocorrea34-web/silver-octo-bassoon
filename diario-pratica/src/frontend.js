/**
 * Frontend SPA - Diário de Prática
 * Single HTML file served by the Worker
 */

export function getHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Diário de Prática - Escrituras Sagradas</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📖</text></svg>">
  <style>
    :root {
      --bg-primary: #1a1a2e;
      --bg-secondary: #16213e;
      --bg-card: #1f2b47;
      --bg-input: #0f1729;
      --accent: #e94560;
      --accent-light: #ff6b81;
      --accent-glow: rgba(233, 69, 96, 0.3);
      --text-primary: #eee;
      --text-secondary: #a0aec0;
      --text-muted: #718096;
      --success: #48bb78;
      --warning: #ecc94b;
      --border: rgba(255,255,255,0.08);
      --radius: 16px;
      --radius-sm: 10px;
      --shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      overflow-x: hidden;
    }

    .app-container {
      max-width: 480px;
      margin: 0 auto;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
    }

    .header-icon { font-size: 28px; }

    .header-title {
      font-size: 18px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent-light), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-subtitle {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .header-back {
      background: none;
      border: none;
      color: var(--text-primary);
      font-size: 24px;
      cursor: pointer;
      padding: 4px 8px;
      display: none;
    }

    /* Main content */
    .main-content {
      flex: 1;
      padding: 16px;
      padding-bottom: 80px;
      overflow-y: auto;
    }

    /* Tab bar */
    .tab-bar {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 480px;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border);
      display: flex;
      padding: 8px 0;
      padding-bottom: calc(8px + env(safe-area-inset-bottom));
      z-index: 100;
    }

    .tab-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 6px;
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
      font-size: 10px;
      font-weight: 600;
    }

    .tab-item.active {
      color: var(--accent);
    }

    .tab-item .tab-icon { font-size: 22px; }

    /* Cards */
    .card {
      background: var(--bg-card);
      border-radius: var(--radius);
      padding: 20px;
      margin-bottom: 16px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      transition: transform 0.2s;
    }

    .card:active { transform: scale(0.98); }

    .card-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 24px;
      border-radius: var(--radius-sm);
      border: none;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      color: white;
      box-shadow: 0 4px 15px var(--accent-glow);
    }

    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px var(--accent-glow); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .btn-secondary {
      background: var(--bg-input);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .btn-small {
      padding: 8px 16px;
      font-size: 13px;
      width: auto;
    }

    /* Inputs */
    .input-group { margin-bottom: 16px; }

    .input-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    textarea, input[type="text"] {
      width: 100%;
      padding: 14px 16px;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 15px;
      font-family: inherit;
      resize: vertical;
      transition: border-color 0.2s;
    }

    textarea:focus, input[type="text"]:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    textarea { min-height: 150px; line-height: 1.6; }

    /* Score circle */
    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      position: relative;
    }

    .score-circle::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      padding: 4px;
      background: conic-gradient(var(--accent) calc(var(--score) * 3.6deg), var(--bg-input) 0);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }

    .score-value {
      font-size: 36px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--accent-light), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .score-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Tags */
    .tag {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin: 3px;
    }

    .tag-green { background: rgba(72, 187, 120, 0.15); color: var(--success); }
    .tag-yellow { background: rgba(236, 201, 75, 0.15); color: var(--warning); }
    .tag-red { background: rgba(233, 69, 96, 0.15); color: var(--accent-light); }

    /* Loading */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .loading-text {
      font-size: 14px;
      color: var(--text-secondary);
      text-align: center;
    }

    /* Feedback markdown */
    .feedback-content {
      line-height: 1.7;
      font-size: 14px;
    }

    .feedback-content h2 {
      font-size: 16px;
      margin: 16px 0 8px;
      color: var(--accent-light);
    }

    .feedback-content h3 {
      font-size: 14px;
      margin: 12px 0 6px;
      color: var(--text-primary);
    }

    .feedback-content p { margin-bottom: 10px; }

    .feedback-content blockquote {
      border-left: 3px solid var(--accent);
      padding: 8px 16px;
      margin: 12px 0;
      background: rgba(233, 69, 96, 0.05);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      font-style: italic;
      color: var(--text-secondary);
    }

    .feedback-content strong { color: var(--accent-light); }

    .feedback-content ul, .feedback-content ol {
      padding-left: 20px;
      margin-bottom: 10px;
    }

    .feedback-content li { margin-bottom: 4px; }

    /* Book selector */
    .book-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .book-item {
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .book-item:hover, .book-item.selected {
      border-color: var(--accent);
      background: rgba(233, 69, 96, 0.08);
    }

    .book-item .book-icon { font-size: 24px; }
    .book-item .book-name { font-size: 14px; font-weight: 600; }
    .book-item .book-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

    /* Chapter list */
    .chapter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 8px;
    }

    .chapter-btn {
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 12px;
      text-align: center;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      transition: all 0.2s;
    }

    .chapter-btn:hover {
      border-color: var(--accent);
      background: rgba(233, 69, 96, 0.1);
    }

    /* History timeline */
    .timeline-item {
      position: relative;
      padding-left: 24px;
      padding-bottom: 20px;
      border-left: 2px solid var(--border);
      margin-left: 8px;
    }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: -6px;
      top: 4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent);
    }

    .timeline-date {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .timeline-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .timeline-score {
      font-size: 12px;
      color: var(--accent-light);
    }

    /* Radar chart (CSS-based) */
    .virtues-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 12px;
    }

    .virtue-item {
      background: var(--bg-input);
      border-radius: var(--radius-sm);
      padding: 12px;
    }

    .virtue-name {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }

    .virtue-bar {
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      overflow: hidden;
    }

    .virtue-fill {
      height: 100%;
      border-radius: 3px;
      background: linear-gradient(90deg, var(--accent), var(--accent-light));
      transition: width 0.5s ease;
    }

    .virtue-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--accent-light);
      margin-top: 4px;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .empty-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px; }

    /* Section title */
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
      margin-top: 8px;
    }

    /* Active session banner */
    .active-banner {
      background: linear-gradient(135deg, rgba(233, 69, 96, 0.15), rgba(233, 69, 96, 0.05));
      border: 1px solid rgba(233, 69, 96, 0.3);
      border-radius: var(--radius);
      padding: 16px;
      margin-bottom: 16px;
    }

    .active-banner-title {
      font-size: 12px;
      color: var(--accent-light);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }

    .active-banner-book {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .active-banner-chapter {
      font-size: 13px;
      color: var(--text-secondary);
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

    /* Animations */
    .fade-in {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* User setup modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
      padding: 20px;
    }

    .modal {
      background: var(--bg-card);
      border-radius: var(--radius);
      padding: 24px;
      width: 100%;
      max-width: 400px;
      border: 1px solid var(--border);
    }

    .modal-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
      text-align: center;
    }

    .modal-desc {
      font-size: 14px;
      color: var(--text-secondary);
      text-align: center;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    /* Search */
    .search-input {
      width: 100%;
      padding: 12px 16px;
      padding-left: 40px;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
      margin-bottom: 12px;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent);
    }

    /* Link back to main app */
    .back-to-app {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 12px;
      padding: 8px 0;
    }

    .back-to-app:hover { color: var(--accent-light); }
  </style>
</head>
<body>
  <div class="app-container" id="app">
    <!-- App renders here via JavaScript -->
  </div>

  <script>
${getAppScript()}
  </script>
</body>
</html>`;
}

function getAppScript() {
  return `
// ============================================
// ESCRITURAS SAGRADAS - DIÁRIO DE PRÁTICA
// App State & Logic
// ============================================

const API_BASE = '/api';
let state = {
  currentTab: 'home',
  currentView: 'main', // main, select-book, select-chapter, write-diary, feedback, session-detail
  userId: localStorage.getItem('diario_user_id') || '',
  userName: localStorage.getItem('diario_user_name') || '',
  activeSession: null,
  sessions: [],
  selectedCategory: null,
  selectedBook: null,
  selectedChapter: null,
  history: [],
  profile: null,
  loading: false,
  feedbackResult: null,
};

// Book data (embedded from the main app)
const BOOKS_DATA = ${JSON.stringify(getBooksData())};

// ============================================
// API CALLS
// ============================================

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': state.userId,
    ...options.headers,
  };
  const res = await fetch(API_BASE + '/' + path, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(err.error || 'Erro na requisição');
  }
  return res.json();
}

// ============================================
// RENDER ENGINE
// ============================================

function render() {
  const app = document.getElementById('app');
  
  // Check if user needs setup
  if (!state.userId) {
    app.innerHTML = renderSetup();
    return;
  }

  let content = '';
  
  // Header
  content += renderHeader();
  
  // Main content based on current view/tab
  content += '<div class="main-content fade-in">';
  
  if (state.currentTab === 'home') {
    content += renderHome();
  } else if (state.currentTab === 'diary') {
    content += renderDiary();
  } else if (state.currentTab === 'profile') {
    content += renderProfile();
  } else if (state.currentTab === 'history') {
    content += renderHistory();
  }
  
  content += '</div>';
  
  // Tab bar
  content += renderTabBar();
  
  app.innerHTML = content;
  attachEventListeners();
}

function renderSetup() {
  return \`
    <div class="modal-overlay">
      <div class="modal">
        <div style="font-size:48px;text-align:center;margin-bottom:16px">📖</div>
        <div class="modal-title">Diário de Prática</div>
        <div class="modal-desc">Bem-vindo ao seu diário de prática espiritual! Como você gostaria de ser chamado(a)?</div>
        <div class="input-group">
          <input type="text" id="setup-name" placeholder="Seu nome" style="text-align:center" />
        </div>
        <button class="btn btn-primary" onclick="setupUser()">Começar Jornada</button>
      </div>
    </div>
  \`;
}

function renderHeader() {
  const showBack = state.currentView !== 'main';
  const titles = {
    'main': 'Diário de Prática',
    'select-book': 'Escolher Livro',
    'select-chapter': 'Escolher Capítulo',
    'write-diary': 'Escrever Diário',
    'feedback': 'Feedback Espiritual',
    'session-detail': 'Detalhes da Sessão',
  };
  
  return \`
    <div class="header">
      \${showBack ? '<button class="header-back" style="display:block" onclick="goBack()">←</button>' : '<div class="header-icon">📖</div>'}
      <div>
        <div class="header-title">\${titles[state.currentView] || 'Diário de Prática'}</div>
        <div class="header-subtitle">Escrituras Sagradas</div>
      </div>
    </div>
  \`;
}

function renderTabBar() {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Início' },
    { id: 'diary', icon: '✍️', label: 'Diário' },
    { id: 'profile', icon: '📊', label: 'Perfil' },
    { id: 'history', icon: '📜', label: 'Histórico' },
  ];
  
  return \`
    <div class="tab-bar">
      \${tabs.map(t => \`
        <button class="tab-item \${state.currentTab === t.id ? 'active' : ''}" onclick="switchTab('\${t.id}')">
          <span class="tab-icon">\${t.icon}</span>
          \${t.label}
        </button>
      \`).join('')}
    </div>
  \`;
}

// ============================================
// HOME TAB
// ============================================

function renderHome() {
  let html = '';
  
  // Active session banner
  if (state.activeSession) {
    html += \`
      <div class="active-banner">
        <div class="active-banner-title">Praticando Hoje</div>
        <div class="active-banner-book">\${state.activeSession.book_name}</div>
        <div class="active-banner-chapter">Capítulo \${state.activeSession.chapter}\${state.activeSession.chapter_title ? ' - ' + state.activeSession.chapter_title : ''}</div>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn btn-primary btn-small" onclick="switchTab('diary')" style="flex:1">✍️ Escrever Diário</button>
          <button class="btn btn-secondary btn-small" onclick="completeSession(\${state.activeSession.id})" style="flex:1">✓ Concluir</button>
        </div>
      </div>
    \`;
  }
  
  // Welcome
  html += \`
    <div class="card">
      <div class="card-title">👋 Olá, \${state.userName}!</div>
      <div class="card-subtitle">
        \${state.activeSession 
          ? 'Você está praticando os ensinamentos hoje. Quando estiver pronto, escreva no diário como foi seu dia.'
          : 'Escolha um capítulo para praticar hoje e comece sua jornada de autoconhecimento.'}
      </div>
    </div>
  \`;
  
  // Quick actions
  if (!state.activeSession) {
    html += \`
      <div class="section-title">Começar Prática</div>
      <div class="card" onclick="startSelectBook()" style="cursor:pointer">
        <div class="card-title">📚 Escolher Capítulo para Treinar</div>
        <div class="card-subtitle">Selecione um capítulo de qualquer autor ou livro sagrado para praticar hoje.</div>
      </div>
    \`;
  }
  
  // How it works
  html += \`
    <div class="section-title">Como Funciona</div>
    <div class="card">
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div style="font-size:24px;min-width:32px;text-align:center">1️⃣</div>
          <div>
            <div style="font-weight:700;font-size:14px">Escolha um Capítulo</div>
            <div style="font-size:12px;color:var(--text-secondary)">Selecione os ensinamentos que deseja praticar hoje</div>
          </div>
        </div>
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div style="font-size:24px;min-width:32px;text-align:center">2️⃣</div>
          <div>
            <div style="font-weight:700;font-size:14px">Pratique no Dia</div>
            <div style="font-size:12px;color:var(--text-secondary)">Aplique os ensinamentos nas suas ações, palavras e atitudes</div>
          </div>
        </div>
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div style="font-size:24px;min-width:32px;text-align:center">3️⃣</div>
          <div>
            <div style="font-weight:700;font-size:14px">Escreva o Diário</div>
            <div style="font-size:12px;color:var(--text-secondary)">Relate como foi seu dia, o que fez, como agiu</div>
          </div>
        </div>
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div style="font-size:24px;min-width:32px;text-align:center">4️⃣</div>
          <div>
            <div style="font-weight:700;font-size:14px">Receba Feedback da IA</div>
            <div style="font-size:12px;color:var(--text-secondary)">A IA compara suas ações com os ensinamentos e dá feedback construtivo</div>
          </div>
        </div>
      </div>
    </div>
  \`;
  
  // Link back to main app
  html += \`
    <a href="https://escrituras-sagradas.pages.dev" class="back-to-app" style="margin-top:8px">
      ← Voltar para Escrituras Sagradas
    </a>
  \`;
  
  return html;
}

// ============================================
// DIARY TAB
// ============================================

function renderDiary() {
  if (state.currentView === 'select-book') return renderSelectBook();
  if (state.currentView === 'select-chapter') return renderSelectChapter();
  if (state.currentView === 'write-diary') return renderWriteDiary();
  if (state.currentView === 'feedback') return renderFeedback();
  
  if (!state.activeSession) {
    return \`
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-title">Nenhuma Prática Ativa</div>
        <div class="empty-desc">Escolha um capítulo para praticar primeiro, depois volte aqui para escrever seu diário.</div>
        <button class="btn btn-primary" onclick="startSelectBook()" style="max-width:280px;margin:0 auto">📚 Escolher Capítulo</button>
      </div>
    \`;
  }
  
  return \`
    <div class="active-banner">
      <div class="active-banner-title">Praticando</div>
      <div class="active-banner-book">\${state.activeSession.book_name}</div>
      <div class="active-banner-chapter">Capítulo \${state.activeSession.chapter}\${state.activeSession.chapter_title ? ' - ' + state.activeSession.chapter_title : ''}</div>
    </div>
    
    <div class="section-title">Seu Diário</div>
    <div class="card">
      <div class="card-title">✍️ Como foi seu dia?</div>
      <div class="card-subtitle" style="margin-bottom:16px">
        Escreva sobre suas ações, atitudes, palavras e experiências de hoje. Seja honesto(a) consigo.
      </div>
      <button class="btn btn-primary" onclick="startWriteDiary()">Escrever no Diário</button>
    </div>
  \`;
}

function renderSelectBook() {
  const categories = Object.keys(BOOKS_DATA);
  
  let html = '<input type="text" class="search-input" id="book-search" placeholder="🔍 Buscar livro ou autor..." oninput="filterBooks()" />';
  
  html += '<div class="book-grid" id="book-list">';
  
  for (const cat of categories) {
    const books = BOOKS_DATA[cat];
    for (const book of books) {
      html += \`
        <div class="book-item" data-search="\${(cat + ' ' + book.name).toLowerCase()}" onclick="selectBook('\${cat}', '\${book.id}')">
          <div class="book-icon">📖</div>
          <div>
            <div class="book-name">\${book.name}</div>
            <div class="book-desc">\${cat} · \${book.chapters} capítulos</div>
          </div>
        </div>
      \`;
    }
  }
  
  html += '</div>';
  return html;
}

function renderSelectChapter() {
  if (!state.selectedBook) return '<p>Selecione um livro primeiro.</p>';
  
  const book = findBook(state.selectedCategory, state.selectedBook);
  if (!book) return '<p>Livro não encontrado.</p>';
  
  let html = \`
    <div class="card">
      <div class="card-title">📖 \${book.name}</div>
      <div class="card-subtitle">\${state.selectedCategory} · \${book.chapters} capítulos</div>
    </div>
    <div class="section-title">Escolha o Capítulo</div>
    <div class="chapter-grid">
  \`;
  
  for (let i = 1; i <= book.chapters; i++) {
    html += \`<div class="chapter-btn" onclick="selectChapter(\${i})">\${i}</div>\`;
  }
  
  html += '</div>';
  return html;
}

function renderWriteDiary() {
  if (state.loading) {
    return \`
      <div class="loading">
        <div class="spinner"></div>
        <div class="loading-text">Salvando sua entrada...</div>
      </div>
    \`;
  }
  
  return \`
    <div class="active-banner">
      <div class="active-banner-title">Praticando</div>
      <div class="active-banner-book">\${state.activeSession.book_name}</div>
      <div class="active-banner-chapter">Capítulo \${state.activeSession.chapter}</div>
    </div>
    
    <div class="input-group">
      <label class="input-label">Como foi seu dia?</label>
      <textarea id="diary-text" placeholder="Escreva aqui sobre seu dia... O que fez, como agiu, quais atitudes tomou, quais palavras falou. Seja sincero(a) consigo mesmo(a)."></textarea>
    </div>
    
    <button class="btn btn-primary" onclick="submitDiary()" id="submit-btn">
      📤 Enviar e Receber Feedback
    </button>
    
    <p style="font-size:12px;color:var(--text-muted);text-align:center;margin-top:12px">
      A IA vai comparar seu relato com os ensinamentos do capítulo escolhido
    </p>
  \`;
}

function renderFeedback() {
  if (state.loading) {
    return \`
      <div class="loading">
        <div class="spinner"></div>
        <div class="loading-text">A IA está analisando seu dia à luz dos ensinamentos sagrados...</div>
      </div>
    \`;
  }
  
  if (!state.feedbackResult) {
    return '<p>Nenhum feedback disponível.</p>';
  }
  
  const fb = state.feedbackResult;
  const score = fb.consonance_score || 0;
  const strengths = JSON.parse(fb.strengths_json || '[]');
  const improvements = JSON.parse(fb.improvements_json || '[]');
  
  let html = \`
    <div class="score-circle" style="--score: \${score}">
      <div class="score-value">\${Math.round(score)}</div>
      <div class="score-label">Consonância</div>
    </div>
  \`;
  
  if (strengths.length > 0) {
    html += '<div class="section-title">Pontos Fortes</div><div style="margin-bottom:16px">';
    strengths.forEach(s => { html += \`<span class="tag tag-green">\${s}</span>\`; });
    html += '</div>';
  }
  
  if (improvements.length > 0) {
    html += '<div class="section-title">Áreas para Desenvolver</div><div style="margin-bottom:16px">';
    improvements.forEach(i => { html += \`<span class="tag tag-yellow">\${i}</span>\`; });
    html += '</div>';
  }
  
  html += \`
    <div class="card">
      <div class="feedback-content">\${markdownToHtml(fb.feedback_text || '')}</div>
    </div>
    
    <button class="btn btn-secondary" onclick="switchTab('home'); state.currentView='main'; render();" style="margin-top:8px">
      🏠 Voltar ao Início
    </button>
  \`;
  
  return html;
}

// ============================================
// PROFILE TAB
// ============================================

function renderProfile() {
  if (state.loading) {
    return \`<div class="loading"><div class="spinner"></div><div class="loading-text">Carregando perfil...</div></div>\`;
  }
  
  if (!state.profile) {
    return \`
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <div class="empty-title">Perfil em Construção</div>
        <div class="empty-desc">Complete pelo menos uma sessão de prática com feedback para começar a construir seu perfil espiritual.</div>
      </div>
    \`;
  }
  
  const p = state.profile;
  const avgScore = Math.round(p.avg_consonance || 0);
  
  let html = \`
    <div class="card" style="text-align:center">
      <div style="font-size:48px;margin-bottom:8px">🧘</div>
      <div style="font-size:20px;font-weight:700;margin-bottom:4px">\${state.userName}</div>
      <div style="font-size:13px;color:var(--text-secondary)">Jornada Espiritual</div>
    </div>
    
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
      <div class="card" style="text-align:center;padding:14px">
        <div style="font-size:24px;font-weight:800;color:var(--accent-light)">\${p.total_sessions || 0}</div>
        <div style="font-size:11px;color:var(--text-muted)">Sessões</div>
      </div>
      <div class="card" style="text-align:center;padding:14px">
        <div style="font-size:24px;font-weight:800;color:var(--accent-light)">\${p.total_entries || 0}</div>
        <div style="font-size:11px;color:var(--text-muted)">Entradas</div>
      </div>
      <div class="card" style="text-align:center;padding:14px">
        <div style="font-size:24px;font-weight:800;color:var(--accent-light)">\${avgScore}%</div>
        <div style="font-size:11px;color:var(--text-muted)">Consonância</div>
      </div>
    </div>
  \`;
  
  // Virtues radar
  const virtues = JSON.parse(p.virtues_radar || '{}');
  if (Object.keys(virtues).length > 0) {
    html += '<div class="section-title">Virtudes Espirituais</div>';
    html += '<div class="virtues-grid">';
    for (const [name, value] of Object.entries(virtues)) {
      html += \`
        <div class="virtue-item">
          <div class="virtue-name">\${name}</div>
          <div class="virtue-bar"><div class="virtue-fill" style="width:\${value}%"></div></div>
          <div class="virtue-value">\${Math.round(value)}</div>
        </div>
      \`;
    }
    html += '</div>';
  }
  
  // Strengths
  const strengths = JSON.parse(p.strengths || '[]');
  if (strengths.length > 0) {
    html += '<div class="section-title" style="margin-top:20px">Seus Pontos Fortes</div><div style="margin-bottom:16px">';
    strengths.forEach(s => { html += \`<span class="tag tag-green">\${s.name} (\${s.count}x)</span>\`; });
    html += '</div>';
  }
  
  // Areas to improve
  const areas = JSON.parse(p.areas_to_improve || '[]');
  if (areas.length > 0) {
    html += '<div class="section-title">Áreas para Desenvolver</div><div style="margin-bottom:16px">';
    areas.forEach(a => { html += \`<span class="tag tag-yellow">\${a.name} (\${a.count}x)</span>\`; });
    html += '</div>';
  }
  
  // Journey timeline
  const journey = JSON.parse(p.spiritual_journey || '[]');
  if (journey.length > 0) {
    html += '<div class="section-title" style="margin-top:20px">Jornada Recente</div>';
    journey.forEach(j => {
      html += \`
        <div class="timeline-item">
          <div class="timeline-date">\${formatDate(j.date)}</div>
          <div class="timeline-title">\${j.book || ''} - Cap. \${j.chapter || ''}</div>
          <div class="timeline-score">Consonância: \${Math.round(j.score || 0)}%</div>
        </div>
      \`;
    });
  }
  
  html += \`
    <button class="btn btn-secondary" onclick="refreshProfile()" style="margin-top:16px">
      🔄 Atualizar Perfil
    </button>
  \`;
  
  return html;
}

// ============================================
// HISTORY TAB
// ============================================

function renderHistory() {
  if (state.loading) {
    return \`<div class="loading"><div class="spinner"></div><div class="loading-text">Carregando histórico...</div></div>\`;
  }
  
  if (!state.history || state.history.length === 0) {
    return \`
      <div class="empty-state">
        <div class="empty-icon">📜</div>
        <div class="empty-title">Sem Histórico</div>
        <div class="empty-desc">Suas sessões de prática e entradas do diário aparecerão aqui.</div>
      </div>
    \`;
  }
  
  let html = '<div class="section-title">Suas Práticas</div>';
  
  state.history.forEach(h => {
    const score = h.consonance_score ? Math.round(h.consonance_score) : null;
    html += \`
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div class="card-title" style="font-size:14px">📖 \${h.book_name || 'Livro'}</div>
            <div style="font-size:12px;color:var(--text-secondary)">Capítulo \${h.chapter}\${h.chapter_title ? ' - ' + h.chapter_title : ''}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px">\${formatDate(h.started_at)}</div>
          </div>
          \${score !== null ? \`
            <div style="text-align:center">
              <div style="font-size:20px;font-weight:800;color:var(--accent-light)">\${score}%</div>
              <div style="font-size:10px;color:var(--text-muted)">Consonância</div>
            </div>
          \` : '<span class="tag tag-red">\${h.status === "active" ? "Ativa" : "Sem feedback"}</span>'}
        </div>
        \${h.entry_text ? \`
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
            <div style="font-size:12px;color:var(--text-secondary);line-height:1.5">\${h.entry_text.substring(0, 200)}\${h.entry_text.length > 200 ? '...' : ''}</div>
          </div>
        \` : ''}
      </div>
    \`;
  });
  
  return html;
}

// ============================================
// ACTIONS
// ============================================

async function setupUser() {
  const name = document.getElementById('setup-name')?.value?.trim() || 'Anônimo';
  state.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  state.userName = name;
  localStorage.setItem('diario_user_id', state.userId);
  localStorage.setItem('diario_user_name', state.userName);
  
  try {
    await api('user', { method: 'POST', body: JSON.stringify({ name }) });
  } catch (e) { console.error('Setup error:', e); }
  
  render();
  loadActiveSession();
}

function switchTab(tab) {
  state.currentTab = tab;
  state.currentView = 'main';
  
  if (tab === 'profile') loadProfile();
  if (tab === 'history') loadHistory();
  
  render();
}

function goBack() {
  const backMap = {
    'select-book': 'main',
    'select-chapter': 'select-book',
    'write-diary': 'main',
    'feedback': 'main',
    'session-detail': 'main',
  };
  state.currentView = backMap[state.currentView] || 'main';
  if (state.currentView === 'main' && state.currentTab === 'diary') {
    // stay on diary tab
  }
  render();
}

function startSelectBook() {
  state.currentTab = 'diary';
  state.currentView = 'select-book';
  render();
}

function filterBooks() {
  const search = document.getElementById('book-search')?.value?.toLowerCase() || '';
  document.querySelectorAll('.book-item').forEach(el => {
    const text = el.getAttribute('data-search') || '';
    el.style.display = text.includes(search) ? 'flex' : 'none';
  });
}

function selectBook(categoryId, bookId) {
  state.selectedCategory = categoryId;
  state.selectedBook = bookId;
  state.currentView = 'select-chapter';
  render();
}

function findBook(categoryId, bookId) {
  const books = BOOKS_DATA[categoryId];
  if (!books) return null;
  return books.find(b => b.id === bookId);
}

async function selectChapter(chapter) {
  const book = findBook(state.selectedCategory, state.selectedBook);
  if (!book) return;
  
  // Get chapter content
  const content = book.content?.[chapter] || [];
  const contentText = Array.isArray(content) ? content.join('\\n\\n') : String(content);
  
  state.loading = true;
  render();
  
  try {
    const result = await api('sessions', {
      method: 'POST',
      body: JSON.stringify({
        categoryId: state.selectedCategory,
        bookId: state.selectedBook,
        bookName: book.name,
        chapter: chapter,
        chapterTitle: book.name + ' - Capítulo ' + chapter,
        chapterContent: contentText,
      })
    });
    
    state.activeSession = {
      id: result.sessionId,
      book_name: book.name,
      chapter: chapter,
      chapter_title: book.name + ' - Capítulo ' + chapter,
    };
    
    state.currentTab = 'home';
    state.currentView = 'main';
  } catch (e) {
    alert('Erro ao criar sessão: ' + e.message);
  }
  
  state.loading = false;
  render();
}

function startWriteDiary() {
  state.currentView = 'write-diary';
  render();
}

async function submitDiary() {
  const text = document.getElementById('diary-text')?.value?.trim();
  if (!text || text.length < 20) {
    alert('Por favor, escreva pelo menos algumas frases sobre seu dia.');
    return;
  }
  
  state.loading = true;
  state.currentView = 'feedback';
  render();
  
  try {
    // Create diary entry
    const entryResult = await api('entries', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: state.activeSession.id,
        entryText: text,
      })
    });
    
    // Generate AI feedback
    const feedbackResult = await api('feedback', {
      method: 'POST',
      body: JSON.stringify({
        entryId: entryResult.entryId,
        sessionId: state.activeSession.id,
      })
    });
    
    state.feedbackResult = feedbackResult.feedback;
  } catch (e) {
    console.error('Feedback error:', e);
    state.feedbackResult = {
      feedback_text: '## Erro\\n\\nNão foi possível gerar o feedback. Tente novamente mais tarde.',
      consonance_score: 0,
      strengths_json: '[]',
      improvements_json: '[]',
    };
  }
  
  state.loading = false;
  render();
}

async function completeSession(sessionId) {
  try {
    await api('sessions/' + sessionId + '/complete', { method: 'POST' });
    state.activeSession = null;
    render();
  } catch (e) {
    alert('Erro: ' + e.message);
  }
}

async function loadActiveSession() {
  try {
    const result = await api('sessions/active');
    state.activeSession = result.session;
    render();
  } catch (e) { console.error('Load session error:', e); }
}

async function loadProfile() {
  state.loading = true;
  render();
  try {
    const result = await api('profile');
    state.profile = result.profile;
  } catch (e) { console.error('Profile error:', e); }
  state.loading = false;
  render();
}

async function refreshProfile() {
  state.loading = true;
  render();
  try {
    const result = await api('profile/refresh', { method: 'POST' });
    state.profile = result.profile;
  } catch (e) { console.error('Refresh error:', e); }
  state.loading = false;
  render();
}

async function loadHistory() {
  state.loading = true;
  render();
  try {
    const result = await api('history');
    state.history = result.history;
  } catch (e) { console.error('History error:', e); }
  state.loading = false;
  render();
}

// ============================================
// UTILITIES
// ============================================

function markdownToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h2>$1</h2>')
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\\/li>)/s, '<ul>$1</ul>')
    .replace(/\\n\\n/g, '</p><p>')
    .replace(/\\n/g, '<br>')
    .replace(/^(.+)$/gm, function(match) {
      if (match.startsWith('<')) return match;
      return match;
    });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'Z');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function attachEventListeners() {
  // Auto-resize textarea
  const textarea = document.getElementById('diary-text');
  if (textarea) {
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.max(150, this.scrollHeight) + 'px';
    });
  }
}

// ============================================
// INIT
// ============================================

render();
if (state.userId) {
  loadActiveSession();
}
`;
}

function getBooksData() {
  // Comprehensive book data matching the main app
  return {
    "Bíblia Sagrada": [
      { id: "genesis", name: "Gênesis", chapters: 50, abbr: "Gn", content: {} },
      { id: "exodo", name: "Êxodo", chapters: 40, abbr: "Ex", content: {} },
      { id: "levitico", name: "Levítico", chapters: 27, abbr: "Lv", content: {} },
      { id: "numeros", name: "Números", chapters: 36, abbr: "Nm", content: {} },
      { id: "deuteronomio", name: "Deuteronômio", chapters: 34, abbr: "Dt", content: {} },
      { id: "josue", name: "Josué", chapters: 24, abbr: "Js", content: {} },
      { id: "juizes", name: "Juízes", chapters: 21, abbr: "Jz", content: {} },
      { id: "rute", name: "Rute", chapters: 4, abbr: "Rt", content: {} },
      { id: "1samuel", name: "1 Samuel", chapters: 31, abbr: "1Sm", content: {} },
      { id: "2samuel", name: "2 Samuel", chapters: 24, abbr: "2Sm", content: {} },
      { id: "1reis", name: "1 Reis", chapters: 22, abbr: "1Rs", content: {} },
      { id: "2reis", name: "2 Reis", chapters: 25, abbr: "2Rs", content: {} },
      { id: "1cronicas", name: "1 Crônicas", chapters: 29, abbr: "1Cr", content: {} },
      { id: "2cronicas", name: "2 Crônicas", chapters: 36, abbr: "2Cr", content: {} },
      { id: "esdras", name: "Esdras", chapters: 10, abbr: "Ed", content: {} },
      { id: "neemias", name: "Neemias", chapters: 13, abbr: "Ne", content: {} },
      { id: "tobias", name: "Tobias", chapters: 14, abbr: "Tb", content: {} },
      { id: "judite", name: "Judite", chapters: 16, abbr: "Jdt", content: {} },
      { id: "ester", name: "Ester", chapters: 10, abbr: "Et", content: {} },
      { id: "1macabeus", name: "1 Macabeus", chapters: 16, abbr: "1Mc", content: {} },
      { id: "2macabeus", name: "2 Macabeus", chapters: 15, abbr: "2Mc", content: {} },
      { id: "jo", name: "Jó", chapters: 42, abbr: "Jó", content: {} },
      { id: "salmos", name: "Salmos", chapters: 150, abbr: "Sl", content: {} },
      { id: "proverbios", name: "Provérbios", chapters: 31, abbr: "Pr", content: {} },
      { id: "eclesiastes", name: "Eclesiastes", chapters: 12, abbr: "Ecl", content: {} },
      { id: "canticos", name: "Cântico dos Cânticos", chapters: 8, abbr: "Ct", content: {} },
      { id: "sabedoria", name: "Sabedoria", chapters: 19, abbr: "Sb", content: {} },
      { id: "eclesiastico", name: "Eclesiástico", chapters: 51, abbr: "Eclo", content: {} },
      { id: "isaias", name: "Isaías", chapters: 66, abbr: "Is", content: {} },
      { id: "jeremias", name: "Jeremias", chapters: 52, abbr: "Jr", content: {} },
      { id: "lamentacoes", name: "Lamentações", chapters: 5, abbr: "Lm", content: {} },
      { id: "baruc", name: "Baruc", chapters: 6, abbr: "Br", content: {} },
      { id: "ezequiel", name: "Ezequiel", chapters: 48, abbr: "Ez", content: {} },
      { id: "daniel", name: "Daniel", chapters: 14, abbr: "Dn", content: {} },
      { id: "oseias", name: "Oséias", chapters: 14, abbr: "Os", content: {} },
      { id: "joel", name: "Joel", chapters: 4, abbr: "Jl", content: {} },
      { id: "amos", name: "Amós", chapters: 9, abbr: "Am", content: {} },
      { id: "abdias", name: "Abdias", chapters: 1, abbr: "Ab", content: {} },
      { id: "jonas", name: "Jonas", chapters: 4, abbr: "Jn", content: {} },
      { id: "miqueias", name: "Miquéias", chapters: 7, abbr: "Mq", content: {} },
      { id: "naum", name: "Naum", chapters: 3, abbr: "Na", content: {} },
      { id: "habacuc", name: "Habacuc", chapters: 3, abbr: "Hab", content: {} },
      { id: "sofonias", name: "Sofonias", chapters: 3, abbr: "Sf", content: {} },
      { id: "ageu", name: "Ageu", chapters: 2, abbr: "Ag", content: {} },
      { id: "zacarias", name: "Zacarias", chapters: 14, abbr: "Zc", content: {} },
      { id: "malaquias", name: "Malaquias", chapters: 3, abbr: "Ml", content: {} },
      { id: "mateus", name: "Mateus", chapters: 28, abbr: "Mt", content: {} },
      { id: "marcos", name: "Marcos", chapters: 16, abbr: "Mc", content: {} },
      { id: "lucas", name: "Lucas", chapters: 24, abbr: "Lc", content: {} },
      { id: "joao", name: "João", chapters: 21, abbr: "Jo", content: {} },
      { id: "atos", name: "Atos dos Apóstolos", chapters: 28, abbr: "At", content: {} },
      { id: "romanos", name: "Romanos", chapters: 16, abbr: "Rm", content: {} },
      { id: "1corintios", name: "1 Coríntios", chapters: 16, abbr: "1Cor", content: {} },
      { id: "2corintios", name: "2 Coríntios", chapters: 13, abbr: "2Cor", content: {} },
      { id: "galatas", name: "Gálatas", chapters: 6, abbr: "Gl", content: {} },
      { id: "efesios", name: "Efésios", chapters: 6, abbr: "Ef", content: {} },
      { id: "filipenses", name: "Filipenses", chapters: 4, abbr: "Fl", content: {} },
      { id: "colossenses", name: "Colossenses", chapters: 4, abbr: "Cl", content: {} },
      { id: "1tessalonicenses", name: "1 Tessalonicenses", chapters: 5, abbr: "1Ts", content: {} },
      { id: "2tessalonicenses", name: "2 Tessalonicenses", chapters: 3, abbr: "2Ts", content: {} },
      { id: "1timoteo", name: "1 Timóteo", chapters: 6, abbr: "1Tm", content: {} },
      { id: "2timoteo", name: "2 Timóteo", chapters: 4, abbr: "2Tm", content: {} },
      { id: "tito", name: "Tito", chapters: 3, abbr: "Tt", content: {} },
      { id: "filemon", name: "Filemon", chapters: 1, abbr: "Fm", content: {} },
      { id: "hebreus", name: "Hebreus", chapters: 13, abbr: "Hb", content: {} },
      { id: "tiago", name: "Tiago", chapters: 5, abbr: "Tg", content: {} },
      { id: "1pedro", name: "1 Pedro", chapters: 5, abbr: "1Pd", content: {} },
      { id: "2pedro", name: "2 Pedro", chapters: 3, abbr: "2Pd", content: {} },
      { id: "1joao", name: "1 João", chapters: 5, abbr: "1Jo", content: {} },
      { id: "2joao", name: "2 João", chapters: 1, abbr: "2Jo", content: {} },
      { id: "3joao", name: "3 João", chapters: 1, abbr: "3Jo", content: {} },
      { id: "judas", name: "Judas", chapters: 1, abbr: "Jd", content: {} },
      { id: "apocalipse", name: "Apocalipse", chapters: 22, abbr: "Ap", content: {} },
    ],
    "Hermes Trismegisto": [
      { id: "corpus_hermeticum_poimandres", name: "Corpus Hermeticum - Poimandres", chapters: 2, content: {
        1: ["Quando eu havia começado a meditar sobre os seres, e meu pensamento havia se elevado a uma grande altura, enquanto meu corpo estava adormecido, pareceu-me que um ser de uma estatura gigantesca e de uma forma indeterminada se aproximava de mim.", "Este ser me chamou pelo meu nome e disse: 'O que desejas ouvir e ver? Que instrução desejas receber?'", "Eu respondi: 'Quem és tu?' Ele disse: 'Sou Poimandres, o Nous do Poder Supremo. Sei o que desejas e estou contigo em toda parte.'", "Então eu disse: 'Desejo aprender sobre as coisas que são, compreender a natureza delas e conhecer a Deus.'", "Ele respondeu: 'Guarda na tua mente o que desejo te ensinar, e o compreenderás.'"],
        2: ["Então Poimandres disse: 'No princípio, quando ainda não havia nada, havia apenas Deus, que é infinito, sem limite, sem forma. Ele continha em si todas as coisas e pensamentos.'", "E Deus pensou em criar um mundo, e do seu pensamento nasceu a Luz.", "Da Luz nasceu a Vida, e da Vida e da Luz nasceu o Mundo.", "Assim, o Mundo é feito de Luz e de Vida, e tudo o que existe é uma manifestação do pensamento divino."]
      }},
      { id: "tabua_de_esmeralda", name: "Tábua de Esmeralda", chapters: 3, content: {
        1: ["É verdade, sem falsidade alguma, verdade absoluta:", "O que está embaixo é como o que está em cima e o que está em cima é como o que está em baixo, para realizar os milagres de uma coisa única.", "E como todas as coisas vieram de um, pela meditação de um, assim todas as coisas vieram dessa coisa una, por adaptação.", "Seu pai é o Sol, sua mãe, a Lua; trouxe-o o vento em seu ventre; a sua nutriz é a terra.", "O Pai de toda perfeição do mundo inteiro é este. A sua força permanece íntegra, mesmo quando derramada na terra."],
        2: ["Separarás a terra do fogo, o sutil do espesso, suavemente e com muito engenho.", "Subiu da terra para o céu, novamente desceu para a terra, e recebeu a força dos superiores e dos inferiores.", "Assim terás a glória do mundo inteiro. Por isso fuja de ti toda escuridão.", "Esta é a fortaleza forte de toda fortaleza, porque vencerá toda coisa sutil e penetrará toda coisa sólida.", "Assim foi criado o mundo. As adaptações dele serão admiráveis, e o seu modo é este."],
        3: ["Por isso sou chamado Hermes Trismegistus, tendo as três partes da filosofia do mundo todo.", "Está terminado o que eu disse sobre a operação do Sol.", "Completo é o ensinamento do Poimandres.", "Aquele que compreende estas palavras compreende a natureza de todas as coisas.", "Aquele que pratica este ensinamento alcançará a perfeição e a imortalidade."]
      }},
      { id: "o_caibalion", name: "O Caibalion - Os Sete Princípios Herméticos", chapters: 7, content: {
        1: ["O Todo é Mente; o Universo é Mental.", "Este Princípio encerra a verdade de que 'tudo é mente'. Explica que a natureza essencial do Universo é mental.", "Que o Universo é uma criação mental do Todo, mantido em existência pela mente do Todo.", "Que o Universo, e tudo o que ele contém, é uma manifestação mental do Todo.", "Que tudo o que chamamos de matéria, energia, fenômeno mental, é uma forma de energia mental."],
        2: ["Como é em cima, é em baixo; como é em baixo, é em cima.", "Este Princípio encerra a verdade de que há sempre uma correspondência entre as leis e os fenômenos dos vários planos do ser e da vida.", "O antigo Axioma hermético afirmava: 'Como é em cima, é em baixo; como é em baixo, é em cima.'", "A interpretação deste Princípio é de grande importância, pois o homem que compreende isto tem a chave de muitos dos mistérios ocultos.", "Há correspondências entre todos os planos da existência, entre todas as coisas que existem."],
        3: ["Nada está em repouso; tudo se move; tudo vibra.", "Este Princípio encerra a verdade de que tudo está em movimento. Nada está absolutamente em repouso.", "Tudo vibra com um movimento que lhe é próprio. Os graus de vibração formam os graus de atividade e de manifestação.", "Do Espírito ao Átomo, tudo vibra. Quanto mais elevada é a vibração, tanto mais elevada é a manifestação.", "O conhecimento deste Princípio permite ao estudante de Hermetismo compreender as diferenças entre os vários planos e manifestações."],
        4: ["Tudo é duplo; tudo tem dois pólos; tudo tem o seu oposto; o semelhante e o dessemelhante são a mesma coisa.", "Os opostos são idênticos em natureza, diferindo apenas em grau.", "Os extremos se tocam; todas as verdades são meias-verdades; todos os paradoxos podem ser reconciliados."],
        5: ["Tudo flui, para fora e para dentro; tudo tem as suas marés; todas as coisas sobem e descem.", "O Princípio do Ritmo manifesta-se em tudo; a medida do movimento para a direita é a medida do movimento para a esquerda.", "O ritmo compensa."],
        6: ["Toda Causa tem o seu Efeito, todo Efeito tem a sua Causa.", "Tudo acontece de acordo com a Lei; o Acaso é simplesmente um nome dado a uma Lei não reconhecida.", "Há muitos planos de causalidade, mas nada escapa à Lei."],
        7: ["O Gênero está em tudo; tudo tem os seus Princípios Masculino e Feminino.", "O Gênero manifesta-se em todos os planos.", "Nenhuma criação, física, mental ou espiritual, é possível sem este Princípio."]
      }},
    ],
    "São Francisco de Assis": [
      { id: "cantico_das_criaturas", name: "Cântico das Criaturas", chapters: 2, content: {
        1: ["Altíssimo, onipotente, bom Senhor, Teus são o louvor, a glória, a honra e toda bênção.", "Louvado sejas, meu Senhor, com todas as Tuas criaturas, especialmente o irmão Sol, que faz o dia e nos ilumina.", "Louvado sejas, meu Senhor, pela irmã Lua e as estrelas, que no céu formaste claras, preciosas e belas.", "Louvado sejas, meu Senhor, pelo irmão Vento, pelo ar, pelas nuvens, pelo céu sereno e por todo tempo.", "Louvado sejas, meu Senhor, pela irmã Água, tão útil, humilde, preciosa e casta."],
        2: ["Louvado sejas, meu Senhor, pelo irmão Fogo, pelo qual iluminas a noite, e ele é belo, alegre, robusto e forte.", "Louvado sejas, meu Senhor, pela nossa irmã, a mãe Terra, que nos sustenta e governa, e produz frutos diversos, flores coloridas e ervas.", "Louvado sejas, meu Senhor, pelos que perdoam por Teu amor e suportam enfermidades e tribulações.", "Bem-aventurados os que as suportam em paz, pois por Ti, Altíssimo, serão coroados.", "Louvai e bendizei ao meu Senhor, e dai-Lhe graças e servi-O com grande humildade."]
      }},
      { id: "admoestacoes", name: "Admoestações de São Francisco", chapters: 3, content: {
        1: ["Bem-aventurado o servo que ama tanto o seu irmão quando está enfermo e não pode retribuir-lhe, como quando está são e pode retribuir-lhe.", "Bem-aventurado o servo que ama e respeita tanto o seu irmão quando está longe dele, como quando está junto dele, e não diz nada atrás dele que não possa dizer com caridade na sua presença."],
        2: ["Bem-aventurado o servo que se deixa repreender, acusar e corrigir por outro tão pacientemente como faria consigo mesmo.", "Bem-aventurado o servo que obedece prontamente, não por temor, mas por amor.", "Bem-aventurado o servo que não se considera melhor quando é louvado e exaltado pelos homens do que quando é considerado vil, simples e desprezado."],
        3: ["Onde há caridade e sabedoria, não há temor nem ignorância.", "Onde há paciência e humildade, não há ira nem perturbação.", "Onde há pobreza com alegria, não há cobiça nem avareza.", "Onde há paz e meditação, não há ansiedade nem dissipação.", "Onde há misericórdia e discernimento, não há superfluidade nem endurecimento."]
      }},
    ],
    "Filósofos Orientais": [
      { id: "analectos_confucio", name: "Analectos de Confúcio", chapters: 5, content: {
        1: ["Não é agradável ter amigos que vêm de longe?", "Não é um homem superior aquele que não se ressente quando os outros não o reconhecem?", "O homem superior busca a virtude; o homem inferior busca o conforto.", "Aprender sem pensar é inútil. Pensar sem aprender é perigoso.", "O que você não quer que façam a você, não faça aos outros."],
        2: ["O homem superior é modesto em suas palavras, mas excede em suas ações.", "Quando vires um homem de valor, pensa em igualar-te a ele. Quando vires um homem sem valor, examina-te interiormente.", "O homem superior é firme, mas não obstinado.", "A virtude nunca está sozinha; sempre tem vizinhos."],
        3: ["Governe o povo com dignidade e ele será respeitoso. Trate-o com bondade e ele será leal.", "A sabedoria é gostar dos homens. A benevolência é conhecer os homens.", "O homem superior pensa na virtude; o homem inferior pensa no conforto."],
        4: ["Não se preocupe em não ter um cargo oficial. Preocupe-se em ser digno de um.", "O homem superior é universal e não partidário. O homem inferior é partidário e não universal."],
        5: ["Aquele que age com constância e sinceridade está no caminho da virtude.", "O estudo sem reflexão é perda de tempo; a reflexão sem estudo é perigosa."]
      }},
      { id: "tao_te_ching", name: "Tao Te Ching - Lao Tsé", chapters: 5, content: {
        1: ["O Tao que pode ser dito não é o Tao eterno. O nome que pode ser nomeado não é o nome eterno.", "O sem-nome é a origem do Céu e da Terra. O nomeado é a mãe de todas as coisas.", "Livre de desejo, você realiza o mistério. Preso ao desejo, você vê apenas as manifestações.", "Mistério e manifestações surgem da mesma fonte. Essa fonte é chamada escuridão.", "Escuridão dentro da escuridão. O portal de toda compreensão."],
        2: ["Quando as pessoas veem algumas coisas como belas, outras se tornam feias. Quando as pessoas veem algumas coisas como boas, outras se tornam ruins.", "Ser e não-ser criam um ao outro. Difícil e fácil se complementam.", "O sábio age sem esforço e ensina sem palavras.", "As coisas surgem e ele as deixa vir. As coisas desaparecem e ele as deixa ir.", "Ele tem sem possuir, age sem expectativa. Quando seu trabalho está feito, ele o esquece. É por isso que dura para sempre."],
        3: ["Não exalte os talentosos, para que o povo não compita. Não valorize bens raros, para que o povo não roube.", "O sábio governa esvaziando mentes e enchendo estômagos, enfraquecendo ambições e fortalecendo ossos."],
        4: ["O Tao é como um poço: usado mas nunca esgotado. É como o vazio eterno: cheio de possibilidades infinitas.", "Ele é escondido mas sempre presente. Não sei quem o gerou. Parece ser o ancestral comum de tudo."],
        5: ["O Céu e a Terra não são bondosos. Tratam todas as coisas como cães de palha.", "O sábio não é bondoso. Trata todas as pessoas como cães de palha.", "O espaço entre o Céu e a Terra é como um fole: vazio mas inexaurível. Quanto mais se move, mais produz."]
      }},
    ],
    "Mestres Modernos": [
      { id: "gandhi", name: "Ensinamentos de Gandhi", chapters: 3, content: {
        1: ["Seja a mudança que você deseja ver no mundo.", "A força não provém da capacidade física. Provém de uma vontade indomável.", "A não-violência é a maior força à disposição da humanidade. É mais poderosa que a mais poderosa arma de destruição concebida pelo engenho do homem.", "Primeiro eles te ignoram, depois riem de ti, depois lutam contra ti, e então você vence.", "A verdadeira medida de qualquer sociedade pode ser encontrada na forma como ela trata seus membros mais vulneráveis."],
        2: ["Viver simplesmente para que outros possam simplesmente viver.", "A felicidade é quando o que você pensa, o que você diz e o que você faz estão em harmonia.", "Um olho por olho acabará deixando o mundo inteiro cego.", "A fraqueza da atitude se torna fraqueza de caráter.", "Ninguém pode me ferir sem minha permissão."],
        3: ["A oração não é pedir. É um anseio da alma. É a admissão diária da própria fraqueza.", "A verdade subsiste; a mentira não.", "Onde há amor, há vida.", "A melhor maneira de se encontrar é se perder no serviço aos outros.", "Aprendi através da experiência amarga a suprema lição: controlar minha ira e torná-la como o calor que é convertido em energia."]
      }},
      { id: "madre_teresa", name: "Ensinamentos de Madre Teresa", chapters: 2, content: {
        1: ["Não podemos todos fazer grandes coisas. Mas podemos fazer pequenas coisas com grande amor.", "Se você julgar as pessoas, não terá tempo para amá-las.", "Espalhe amor por onde você for. Que ninguém jamais venha a você sem sair mais feliz.", "A paz começa com um sorriso.", "Não é o quanto fazemos, mas quanto amor colocamos naquilo que fazemos."],
        2: ["Eu sozinha não posso mudar o mundo, mas posso lançar uma pedra sobre as águas para criar muitas ondulações.", "Ontem se foi. Amanhã ainda não veio. Temos apenas hoje. Comecemos.", "Dê ao mundo o melhor de você e isso nunca será suficiente. Dê o melhor de você assim mesmo.", "O mais terrível da pobreza é a solidão e o sentimento de não ser amado.", "Deus não nos pede para ter sucesso. Ele nos pede para ser fiéis."]
      }},
    ],
    "Platão e Sócrates": [
      { id: "apologia", name: "Apologia de Sócrates", chapters: 3, content: {
        1: ["Uma vida não examinada não vale a pena ser vivida.", "Só sei que nada sei.", "A sabedoria começa na admiração.", "Eu não posso ensinar nada a ninguém. Eu só posso fazê-los pensar.", "O segredo da mudança é focar toda a sua energia não em lutar contra o velho, mas em construir o novo."],
        2: ["Conhece-te a ti mesmo.", "A educação é acender uma chama, não encher um recipiente.", "Os mais sábios são aqueles que sabem que não sabem.", "Não tenho inimigos. Tenho apenas professores."],
        3: ["A morte pode ser a maior de todas as bênçãos humanas.", "Prefiro ser injustiçado a cometer injustiça.", "O homem justo não teme a morte."]
      }},
      { id: "a_republica", name: "A República", chapters: 3, content: {
        1: ["A justiça é a virtude da alma.", "O preço que os bons pagam pela indiferença aos assuntos públicos é serem governados por homens maus.", "A medida do homem é o que ele faz com o poder."],
        2: ["A alma de cada um é composta de três partes: razão, espírito e apetite.", "O homem justo é aquele em quem cada parte da alma faz o que lhe é próprio.", "A educação musical é soberana porque o ritmo e a harmonia penetram nos recônditos da alma."],
        3: ["Os que são capazes de ver além das sombras e mentiras de sua cultura nunca serão compreendidos, muito menos acreditados, pelas massas.", "Podemos facilmente perdoar uma criança que tem medo do escuro; a verdadeira tragédia da vida é quando os homens têm medo da luz."]
      }},
    ],
    "Escrituras Budistas": [
      { id: "dhammapada", name: "Dhammapada", chapters: 4, content: {
        1: ["Somos o que pensamos. Tudo o que somos surge com nossos pensamentos. Com nossos pensamentos, fazemos o nosso mundo.", "Não há fogo como a paixão, não há tubarão como o ódio, não há armadilha como a ilusão, não há torrente como a ganância.", "Melhor do que mil palavras vazias é uma palavra que traz paz.", "A raiva é como segurar um carvão em brasa com a intenção de jogá-lo em alguém; você é quem se queima."],
        2: ["Assim como uma vela não pode arder sem fogo, o homem não pode viver sem uma vida espiritual.", "Três coisas não podem ser escondidas por muito tempo: o sol, a lua e a verdade.", "Ninguém nos salva senão nós mesmos. Ninguém pode e ninguém deve. Nós mesmos devemos percorrer o caminho."],
        3: ["A saúde é o maior presente, a contentamento a maior riqueza, a fidelidade o melhor relacionamento.", "Não habite no passado, não sonhe com o futuro, concentre a mente no momento presente.", "Você só perde aquilo a que se apega."],
        4: ["A paz vem de dentro. Não a procure fora.", "O caminho não está no céu. O caminho está no coração.", "Meditar é encontrar o silêncio dentro do barulho."]
      }},
    ],
    "Aristóteles": [
      { id: "etica_nicomaco", name: "Ética a Nicômaco", chapters: 3, content: {
        1: ["A felicidade é o significado e o propósito da vida, o objetivo e o fim da existência humana.", "A virtude é um meio-termo entre dois vícios, um por excesso e outro por falta.", "Somos o que repetidamente fazemos. A excelência, portanto, não é um ato, mas um hábito.", "O homem é por natureza um animal político."],
        2: ["A educação é o melhor provimento para a velhice.", "A esperança é o sonho do homem acordado.", "O prazer no trabalho põe perfeição no trabalho.", "Conhecer a si mesmo é o início de toda sabedoria."],
        3: ["A paciência é amarga, mas seu fruto é doce.", "Qualquer um pode ficar com raiva - isso é fácil. Mas ficar com raiva da pessoa certa, no grau certo, na hora certa, pelo propósito certo e da maneira certa - isso não é fácil."]
      }},
    ],
    "Santos e Mártires": [
      { id: "joana_darc", name: "Palavras de Joana D'Arc", chapters: 2, content: {
        1: ["Eu não tenho medo. Nasci para fazer isto.", "Aja, e Deus agirá.", "Uma vida sem propósito é uma vida sem direção.", "Não tenho medo dos soldados. Minha estrada está aberta. Se houver soldados no meu caminho, tenho Deus, meu Senhor, que saberá abrir o caminho."],
        2: ["Prefiro morrer a fazer algo que sei ser pecado.", "Deus me enviou. Não tenho medo de nada.", "A coragem não é a ausência do medo, mas a decisão de que algo é mais importante que o medo."]
      }},
    ],
    "Outras Grandes Mentes": [
      { id: "marco_aurelio", name: "Meditações de Marco Aurélio", chapters: 3, content: {
        1: ["Você tem poder sobre sua mente, não sobre eventos externos. Perceba isso e encontrará força.", "A felicidade de sua vida depende da qualidade de seus pensamentos.", "Muito do que nos preocupa é desnecessário. Se você puder eliminar isso, terá mais espaço e tranquilidade.", "Não desperdice o que resta de sua vida especulando sobre seus vizinhos."],
        2: ["Quando você se levantar de manhã, pense no precioso privilégio de estar vivo: respirar, pensar, desfrutar, amar.", "A melhor vingança é não ser como seu inimigo.", "Aceite as coisas às quais o destino o vincula e ame as pessoas com quem o destino o une, e faça isso de todo o coração."],
        3: ["Tudo o que ouvimos é uma opinião, não um fato. Tudo o que vemos é uma perspectiva, não a verdade.", "A alma se torna tingida pela cor de seus pensamentos.", "Se não é certo, não faça. Se não é verdade, não diga."]
      }},
      { id: "epicuro", name: "Ensinamentos de Epicuro", chapters: 2, content: {
        1: ["Não é o que temos, mas o que desfrutamos, que constitui nossa abundância.", "De todos os meios que a sabedoria adquire para assegurar a felicidade ao longo de toda a vida, de longe o mais importante é a amizade.", "Não estrague o que você tem desejando o que não tem; lembre-se de que o que você tem agora já foi uma das coisas que você desejava."],
        2: ["É impossível viver uma vida prazerosa sem viver sabiamente, bem e justamente.", "A morte não é nada para nós, pois quando existimos, a morte não está presente, e quando a morte está presente, não existimos mais."]
      }},
    ],
  };
}
