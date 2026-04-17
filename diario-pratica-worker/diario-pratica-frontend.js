
/* ============================================================
   DIÁRIO DE PRÁTICA ESPIRITUAL — Escrituras Sagradas
   Script inline que adiciona funcionalidade de diário com IA
   ao app existente. Usa localStorage para persistência.
   ============================================================ */
(function () {
  'use strict';

  var API_URL = 'https://diario-pratica-api.escrituras-sagradas-tts.workers.dev/api/analyze';

  // ── Dados das escrituras (reutilizados do script existente) ──
  var SCRIPTURES = {
    "biblia": [{"id":"genesis","name":"Gênesis","chapters":50},{"id":"exodo","name":"Êxodo","chapters":40},{"id":"levitico","name":"Levítico","chapters":27},{"id":"numeros","name":"Números","chapters":36},{"id":"deuteronomio","name":"Deuteronômio","chapters":34},{"id":"josue","name":"Josué","chapters":24},{"id":"juizes","name":"Juízes","chapters":21},{"id":"rute","name":"Rute","chapters":4},{"id":"1samuel","name":"1 Samuel","chapters":31},{"id":"2samuel","name":"2 Samuel","chapters":24},{"id":"1reis","name":"1 Reis","chapters":22},{"id":"2reis","name":"2 Reis","chapters":25},{"id":"1cronicas","name":"1 Crônicas","chapters":29},{"id":"2cronicas","name":"2 Crônicas","chapters":36},{"id":"esdras","name":"Esdras","chapters":10},{"id":"neemias","name":"Neemias","chapters":13},{"id":"ester","name":"Ester","chapters":10},{"id":"jo","name":"Jó","chapters":42},{"id":"salmos","name":"Salmos","chapters":150},{"id":"proverbios","name":"Provérbios","chapters":31},{"id":"eclesiastes","name":"Eclesiastes","chapters":12},{"id":"canticos","name":"Cânticos","chapters":8},{"id":"isaias","name":"Isaías","chapters":66},{"id":"jeremias","name":"Jeremias","chapters":52},{"id":"lamentacoes","name":"Lamentações","chapters":5},{"id":"ezequiel","name":"Ezequiel","chapters":48},{"id":"daniel","name":"Daniel","chapters":14},{"id":"oseias","name":"Oseias","chapters":14},{"id":"joel","name":"Joel","chapters":3},{"id":"amos","name":"Amós","chapters":9},{"id":"obadias","name":"Obadias","chapters":1},{"id":"jonas","name":"Jonas","chapters":4},{"id":"miqueias","name":"Miqueias","chapters":7},{"id":"naum","name":"Naum","chapters":3},{"id":"habacuque","name":"Habacuque","chapters":3},{"id":"sofonias","name":"Sofonias","chapters":3},{"id":"ageu","name":"Ageu","chapters":2},{"id":"zacarias","name":"Zacarias","chapters":14},{"id":"malaquias","name":"Malaquias","chapters":4},{"id":"tobias","name":"Tobias","chapters":14},{"id":"judite","name":"Judite","chapters":16},{"id":"sabedoria","name":"Sabedoria","chapters":19},{"id":"eclesiastico","name":"Eclesiástico","chapters":51},{"id":"baruc","name":"Baruc","chapters":6},{"id":"1macabeus","name":"1 Macabeus","chapters":16},{"id":"2macabeus","name":"2 Macabeus","chapters":15},{"id":"mateus","name":"Mateus","chapters":28},{"id":"marcos","name":"Marcos","chapters":16},{"id":"lucas","name":"Lucas","chapters":24},{"id":"joao","name":"João","chapters":21},{"id":"atos","name":"Atos","chapters":28},{"id":"romanos","name":"Romanos","chapters":16},{"id":"1corintios","name":"1 Coríntios","chapters":16},{"id":"2corintios","name":"2 Coríntios","chapters":13},{"id":"galatas","name":"Gálatas","chapters":6},{"id":"efesios","name":"Efésios","chapters":6},{"id":"filipenses","name":"Filipenses","chapters":4},{"id":"colossenses","name":"Colossenses","chapters":4},{"id":"1tessalonicenses","name":"1 Tessalonicenses","chapters":5},{"id":"2tessalonicenses","name":"2 Tessalonicenses","chapters":3},{"id":"1timoteo","name":"1 Timóteo","chapters":6},{"id":"2timoteo","name":"2 Timóteo","chapters":4},{"id":"tito","name":"Tito","chapters":3},{"id":"filemom","name":"Filemom","chapters":1},{"id":"hebreus","name":"Hebreus","chapters":13},{"id":"tiago","name":"Tiago","chapters":5},{"id":"1pedro","name":"1 Pedro","chapters":5},{"id":"2pedro","name":"2 Pedro","chapters":3},{"id":"1joao","name":"1 João","chapters":5},{"id":"2joao","name":"2 João","chapters":1},{"id":"3joao","name":"3 João","chapters":1},{"id":"judas","name":"Judas","chapters":1},{"id":"apocalipse","name":"Apocalipse","chapters":22}],
    "apocrifos": [{"id":"enoque","name":"Livro de Enoque","chapters":36},{"id":"tome","name":"Evangelho de Tomé","chapters":7},{"id":"maria","name":"Evangelho de Maria Madalena","chapters":4},{"id":"pastor_hermas","name":"Pastor de Hermas","chapters":12},{"id":"atos_paulo_tecla","name":"Atos de Paulo e Tecla","chapters":8},{"id":"evangelho_filipe","name":"Evangelho de Filipe","chapters":6},{"id":"evangelho_pedro","name":"Evangelho de Pedro","chapters":4},{"id":"apocalipse_pedro","name":"Apocalipse de Pedro","chapters":5},{"id":"didaque","name":"Didaqué","chapters":6},{"id":"carta_barnabe","name":"Carta de Barnabé","chapters":5},{"id":"evangelho_nicodemos","name":"Evangelho de Nicodemos","chapters":8},{"id":"assuncao_moises","name":"Assunção de Moisés","chapters":4},{"id":"livro_jubileus","name":"Livro dos Jubileus","chapters":10},{"id":"vida_adao_eva","name":"Vida de Adão e Eva","chapters":6},{"id":"salmos_salomao","name":"Salmos de Salomão","chapters":8},{"id":"odes_salomao","name":"Odes de Salomão","chapters":8}],
    "budismo": [{"id":"dhammapada","name":"Dhammapada","chapters":26},{"id":"sutra_coracao","name":"Sutra do Coração","chapters":1},{"id":"sutra_lotus","name":"Sutra do Lótus","chapters":10},{"id":"sutra_diamante","name":"Sutra do Diamante","chapters":8},{"id":"metta_sutta","name":"Metta Sutta","chapters":1},{"id":"sutra_plataforma","name":"Sutra da Plataforma","chapters":10},{"id":"sutra_vimalakirti","name":"Sutra de Vimalakirti","chapters":8},{"id":"sutra_lankavatara","name":"Sutra Lankavatara","chapters":6},{"id":"sutra_amitabha","name":"Sutra de Amitabha","chapters":3},{"id":"sutta_nipata","name":"Sutta Nipata","chapters":8},{"id":"bodhicaryavatara","name":"Bodhicaryavatara","chapters":10},{"id":"majjhima_nikaya","name":"Majjhima Nikaya (Seleção)","chapters":8},{"id":"anguttara_nikaya","name":"Anguttara Nikaya (Seleção)","chapters":6},{"id":"samyutta_nikaya","name":"Samyutta Nikaya (Seleção)","chapters":6},{"id":"milinda_panha","name":"Milinda Panha","chapters":6},{"id":"tibetano_mortos","name":"Bardo Thodol (Livro Tibetano dos Mortos)","chapters":8}],
    "hermes_trismegisto": [{"id":"corpus_hermeticum_poimandres","name":"Corpus Hermeticum - Poimandres","chapters":2},{"id":"t_bua_de_esmeralda","name":"Tábua de Esmeralda","chapters":3},{"id":"o_caibalion_os_sete_princ_pios_herm_ticos","name":"O Caibalion - Os Sete Princípios Herméticos","chapters":7}],
    "sao_francisco": [{"id":"c_ntico_do_irm_o_sol_c_ntico_das_criaturas","name":"Cântico do Irmão Sol","chapters":10},{"id":"admoesta_es_de_s_o_francisco","name":"Admoestações de São Francisco","chapters":4}],
    "platao_socrates": [{"id":"apologia_de_s_crates","name":"Apologia de Sócrates","chapters":4},{"id":"f_don_ou_da_alma","name":"Fédon (ou Da Alma)","chapters":4},{"id":"a_rep_blica","name":"A República","chapters":3}],
    "aristoteles": [{"id":"a_pol_tica","name":"A Política","chapters":4},{"id":"metaf_sica","name":"Metafísica","chapters":4},{"id":"ret_rica","name":"Retórica","chapters":3}],
    "filosofos_orientais": [{"id":"analectos_de_conf_cio","name":"Analectos de Confúcio","chapters":5},{"id":"tao_te_ching_o_livro_do_caminho_e_da_virtude","name":"Tao Te Ching","chapters":5},{"id":"versos_ureos_de_pit_goras","name":"Versos Áureos de Pitágoras","chapters":5}],
    "filosofos_classicos": [{"id":"tica_a_nic_maco","name":"Ética a Nicômaco","chapters":4},{"id":"en_adas","name":"Enéadas","chapters":4},{"id":"notas_e_reflex_es_de_leonardo_da_vinci","name":"Notas e Reflexões de Leonardo da Vinci","chapters":4}],
    "mestres_modernos": [{"id":"pensamentos_e_ensinamentos_de_mahatma_gandhi","name":"Pensamentos de Mahatma Gandhi","chapters":6},{"id":"ensinamentos_e_reflex_es_de_madre_teresa_de_calcut","name":"Reflexões de Madre Teresa","chapters":7}],
    "santos_martires": [{"id":"cartas_e_testemunhas_de_joana_d_arc","name":"Cartas de Joana D'Arc","chapters":4},{"id":"pensamentos_de_giordano_bruno","name":"Pensamentos de Giordano Bruno","chapters":4}],
    "platao_dialogos": [{"id":"o_banquete","name":"O Banquete","chapters":3},{"id":"m_non","name":"Mênon","chapters":3},{"id":"o_sofista","name":"O Sofista","chapters":3},{"id":"cr_ton","name":"Críton","chapters":3}],
    "outras_mentes": [{"id":"medita_es","name":"Meditações","chapters":2},{"id":"ensinamentos_de_epicuro","name":"Ensinamentos de Epicuro","chapters":2},{"id":"ensinamentos_de_zen_o","name":"Ensinamentos de Zenão","chapters":2},{"id":"poesias_e_ensinamentos_de_rumi","name":"Poesias de Rumi","chapters":3},{"id":"ensinamentos_de_ramakrishna_paramahamsa","name":"Ensinamentos de Ramakrishna","chapters":3},{"id":"ensinamentos_de_buda","name":"Ensinamentos de Buda","chapters":3}]
  };

  var CATEGORY_LABELS = {
    "biblia":"Bíblia Sagrada","apocrifos":"Livros Apócrifos","budismo":"Escrituras Budistas",
    "hermes_trismegisto":"Hermes Trismegisto","sao_francisco":"São Francisco de Assis",
    "platao_socrates":"Platão e Sócrates","aristoteles":"Aristóteles",
    "filosofos_orientais":"Filósofos Orientais","filosofos_classicos":"Filósofos Clássicos",
    "mestres_modernos":"Mestres Modernos","santos_martires":"Santos e Mártires",
    "platao_dialogos":"Platão - Diálogos","outras_mentes":"Outras Grandes Mentes"
  };

  // ── localStorage helpers ──
  var LS_KEY = 'diario_pratica_data';
  function loadData() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || { entries: [], profile: {} }; }
    catch(e) { return { entries: [], profile: {} }; }
  }
  function saveData(d) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function getTodayTraining() {
    var data = loadData();
    return data.entries.find(function(e) { return e.date === todayStr() && e.status === 'training'; });
  }

  // ── CSS do Diário ──
  var CSS = '\
  #dp-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:100000;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;}\
  #dp-overlay.dp-show{display:flex;}\
  #dp-modal{background:#FDF8F0;width:100%;max-width:480px;height:100%;max-height:100vh;overflow-y:auto;position:relative;animation:dp-slide-up 0.3s ease;}\
  @media(min-width:500px){#dp-modal{height:auto;max-height:92vh;border-radius:20px;margin:16px;}}\
  @keyframes dp-slide-up{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}\
  .dp-header{background:linear-gradient(135deg,#8B5E3C,#6B4E2C);color:#FDF8F0;padding:20px 20px 16px;position:sticky;top:0;z-index:2;}\
  .dp-header h2{margin:0;font-size:20px;font-weight:700;}\
  .dp-header p{margin:4px 0 0;font-size:13px;opacity:0.85;}\
  .dp-close{position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.2);border:none;color:#FDF8F0;width:32px;height:32px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;}\
  .dp-body{padding:16px 20px 24px;}\
  .dp-tabs{display:flex;gap:0;border-bottom:2px solid #E0D5C8;margin-bottom:16px;}\
  .dp-tab{flex:1;padding:10px 8px;text-align:center;font-size:13px;font-weight:600;color:#8C7B6B;background:none;border:none;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.2s;}\
  .dp-tab.active{color:#8B5E3C;border-bottom-color:#8B5E3C;}\
  .dp-panel{display:none;}\
  .dp-panel.active{display:block;}\
  .dp-section{margin-bottom:20px;}\
  .dp-section h3{font-size:15px;font-weight:700;color:#2C1810;margin:0 0 10px;}\
  .dp-section h4{font-size:13px;font-weight:600;color:#8B5E3C;margin:0 0 8px;}\
  .dp-select-wrap{position:relative;}\
  .dp-select{width:100%;padding:12px 14px;border:1.5px solid #E0D5C8;border-radius:12px;background:#F5EDE0;color:#2C1810;font-size:14px;appearance:none;cursor:pointer;}\
  .dp-select:focus{outline:none;border-color:#8B5E3C;}\
  .dp-textarea{width:100%;min-height:140px;padding:14px;border:1.5px solid #E0D5C8;border-radius:12px;background:#F5EDE0;color:#2C1810;font-size:14px;font-family:inherit;resize:vertical;box-sizing:border-box;}\
  .dp-textarea:focus{outline:none;border-color:#8B5E3C;}\
  .dp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;width:100%;}\
  .dp-btn-primary{background:linear-gradient(135deg,#8B5E3C,#6B4E2C);color:#FDF8F0;}\
  .dp-btn-primary:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(139,94,60,0.4);}\
  .dp-btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none;box-shadow:none;}\
  .dp-btn-secondary{background:#F5EDE0;color:#8B5E3C;border:1.5px solid #E0D5C8;}\
  .dp-btn-success{background:linear-gradient(135deg,#5B8C5A,#4A7A49);color:#FDF8F0;}\
  .dp-training-card{background:linear-gradient(135deg,#5B8C5A15,#5B8C5A08);border:1.5px solid #5B8C5A40;border-radius:14px;padding:16px;margin-bottom:16px;}\
  .dp-training-card .dp-tc-title{font-size:15px;font-weight:700;color:#5B8C5A;margin:0 0 4px;}\
  .dp-training-card .dp-tc-sub{font-size:12px;color:#8C7B6B;margin:0;}\
  .dp-feedback-card{background:#F5EDE0;border-radius:14px;padding:16px;margin-bottom:12px;border-left:4px solid #8B5E3C;}\
  .dp-feedback-card h4{margin:0 0 8px;font-size:14px;color:#8B5E3C;}\
  .dp-feedback-card p{margin:0;font-size:13px;color:#2C1810;line-height:1.6;}\
  .dp-feedback-card.green{border-left-color:#5B8C5A;}\
  .dp-feedback-card.green h4{color:#5B8C5A;}\
  .dp-feedback-card.orange{border-left-color:#D4A03C;}\
  .dp-feedback-card.orange h4{color:#D4A03C;}\
  .dp-feedback-card.blue{border-left-color:#5E6B8B;}\
  .dp-feedback-card.blue h4{color:#5E6B8B;}\
  .dp-score-ring{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#FDF8F0;margin:0 auto 8px;}\
  .dp-score-label{text-align:center;font-size:12px;color:#8C7B6B;}\
  .dp-aspects{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;}\
  .dp-aspect{background:#FDF8F0;border-radius:10px;padding:10px 12px;border:1px solid #E0D5C8;}\
  .dp-aspect-name{font-size:11px;color:#8C7B6B;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;}\
  .dp-aspect-bar{height:6px;background:#E0D5C8;border-radius:3px;overflow:hidden;}\
  .dp-aspect-fill{height:100%;border-radius:3px;transition:width 0.5s ease;}\
  .dp-aspect-val{font-size:12px;font-weight:700;color:#2C1810;margin-top:4px;}\
  .dp-history-item{background:#F5EDE0;border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;transition:all 0.2s;border:1px solid #E0D5C8;}\
  .dp-history-item:hover{border-color:#8B5E3C;}\
  .dp-history-date{font-size:12px;color:#8C7B6B;margin:0;}\
  .dp-history-book{font-size:14px;font-weight:600;color:#2C1810;margin:2px 0;}\
  .dp-history-score{display:inline-block;background:#8B5E3C;color:#FDF8F0;padding:2px 10px;border-radius:10px;font-size:12px;font-weight:700;}\
  .dp-loading{text-align:center;padding:30px;}\
  .dp-spinner{width:40px;height:40px;border:3px solid #E0D5C8;border-top-color:#8B5E3C;border-radius:50%;animation:dp-spin 0.8s linear infinite;margin:0 auto 12px;}\
  @keyframes dp-spin{to{transform:rotate(360deg)}}\
  .dp-loading-text{font-size:14px;color:#8C7B6B;}\
  .dp-chart-container{margin-top:16px;}\
  .dp-chart-row{display:flex;align-items:center;margin-bottom:8px;}\
  .dp-chart-label{width:80px;font-size:11px;color:#8C7B6B;text-align:right;padding-right:10px;}\
  .dp-chart-bar-wrap{flex:1;height:20px;background:#E0D5C8;border-radius:10px;overflow:hidden;position:relative;}\
  .dp-chart-bar-fill{height:100%;border-radius:10px;transition:width 0.8s ease;}\
  .dp-chart-bar-val{position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:10px;font-weight:700;color:#2C1810;}\
  .dp-empty{text-align:center;padding:40px 20px;color:#8C7B6B;}\
  .dp-empty-icon{font-size:48px;margin-bottom:12px;}\
  .dp-empty p{font-size:14px;line-height:1.5;}\
  .dp-motivational{background:linear-gradient(135deg,#6B4E8B15,#6B4E8B08);border:1px solid #6B4E8B30;border-radius:14px;padding:16px;margin-top:16px;text-align:center;}\
  .dp-motivational p{font-size:14px;font-style:italic;color:#6B4E8B;line-height:1.5;margin:0;}\
  .dp-streak{display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#D4A03C15,#D4A03C08);border:1px solid #D4A03C40;border-radius:14px;padding:14px 16px;margin-bottom:16px;}\
  .dp-streak-num{font-size:28px;font-weight:800;color:#D4A03C;}\
  .dp-streak-text{font-size:13px;color:#8C7B6B;}\
  .dp-streak-text strong{color:#2C1810;display:block;font-size:14px;}\
  ';

  // ── Injetar CSS ──
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // ── Calcular streak ──
  function calcStreak() {
    var data = loadData();
    var entries = data.entries.filter(function(e) { return e.feedback; });
    if (!entries.length) return 0;
    entries.sort(function(a,b) { return b.date.localeCompare(a.date); });
    var streak = 0;
    var d = new Date();
    for (var i = 0; i < 365; i++) {
      var ds = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
      if (entries.find(function(e) { return e.date === ds; })) {
        streak++;
      } else if (i > 0) {
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  // ── Calcular perfil médio ──
  function calcProfile() {
    var data = loadData();
    var withFeedback = data.entries.filter(function(e) { return e.feedback && e.feedback.aspectos; });
    if (!withFeedback.length) return null;
    var last = withFeedback.slice(-14); // últimos 14 dias
    var aspects = ['compaixao','disciplina','sabedoria','paz_interior','generosidade','paciencia','gratidao'];
    var avg = {};
    aspects.forEach(function(a) {
      var sum = 0; var count = 0;
      last.forEach(function(e) {
        if (e.feedback.aspectos && e.feedback.aspectos[a]) { sum += e.feedback.aspectos[a]; count++; }
      });
      avg[a] = count > 0 ? Math.round(sum / count * 10) / 10 : 0;
    });
    var notaSum = 0;
    last.forEach(function(e) { if (e.feedback.nota_geral) notaSum += e.feedback.nota_geral; });
    avg.nota_media = last.length > 0 ? Math.round(notaSum / last.length * 10) / 10 : 0;
    return avg;
  }

  // ── Cor por nota ──
  function scoreColor(n) {
    if (n >= 8) return '#5B8C5A';
    if (n >= 6) return '#D4A03C';
    if (n >= 4) return '#C45B4A';
    return '#8C7B6B';
  }

  // ── Aspect labels ──
  var ASPECT_LABELS = {
    compaixao: 'Compaixão', disciplina: 'Disciplina', sabedoria: 'Sabedoria',
    paz_interior: 'Paz Interior', generosidade: 'Generosidade', paciencia: 'Paciência', gratidao: 'Gratidão'
  };

  // ── Aspect colors ──
  var ASPECT_COLORS = {
    compaixao:'#C45B4A', disciplina:'#8B5E3C', sabedoria:'#6B4E8B',
    paz_interior:'#5E6B8B', generosidade:'#5B8C5A', paciencia:'#D4A03C', gratidao:'#5E8B7B'
  };

  // ── Criar overlay HTML ──
  function buildOverlay() {
    var el = document.createElement('div');
    el.id = 'dp-overlay';
    el.innerHTML = '<div id="dp-modal">' +
      '<div class="dp-header">' +
        '<h2>Diário de Prática</h2>' +
        '<p>Treine, pratique e evolua espiritualmente</p>' +
        '<button class="dp-close" id="dp-close-btn">&times;</button>' +
      '</div>' +
      '<div class="dp-body">' +
        '<div class="dp-tabs">' +
          '<button class="dp-tab active" data-tab="treinar">Treinar</button>' +
          '<button class="dp-tab" data-tab="relatar">Relatar</button>' +
          '<button class="dp-tab" data-tab="perfil">Perfil</button>' +
          '<button class="dp-tab" data-tab="historico">Histórico</button>' +
        '</div>' +
        '<div id="dp-panel-treinar" class="dp-panel active"></div>' +
        '<div id="dp-panel-relatar" class="dp-panel"></div>' +
        '<div id="dp-panel-perfil" class="dp-panel"></div>' +
        '<div id="dp-panel-historico" class="dp-panel"></div>' +
      '</div>' +
    '</div>';
    document.body.appendChild(el);

    // Tab switching
    el.querySelectorAll('.dp-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        el.querySelectorAll('.dp-tab').forEach(function(t) { t.classList.remove('active'); });
        el.querySelectorAll('.dp-panel').forEach(function(p) { p.classList.remove('active'); });
        tab.classList.add('active');
        document.getElementById('dp-panel-' + tab.dataset.tab).classList.add('active');
        renderPanel(tab.dataset.tab);
      });
    });

    document.getElementById('dp-close-btn').addEventListener('click', closeOverlay);
    el.addEventListener('click', function(e) { if (e.target === el) closeOverlay(); });

    return el;
  }

  function openOverlay() {
    var el = document.getElementById('dp-overlay') || buildOverlay();
    el.classList.add('dp-show');
    document.body.style.overflow = 'hidden';
    renderPanel('treinar');
  }

  function closeOverlay() {
    var el = document.getElementById('dp-overlay');
    if (el) { el.classList.remove('dp-show'); document.body.style.overflow = ''; }
  }

  // ── Render panels ──
  function renderPanel(name) {
    var panel = document.getElementById('dp-panel-' + name);
    if (!panel) return;
    switch(name) {
      case 'treinar': renderTreinar(panel); break;
      case 'relatar': renderRelatar(panel); break;
      case 'perfil': renderPerfil(panel); break;
      case 'historico': renderHistorico(panel); break;
    }
  }

  // ── TREINAR ──
  function renderTreinar(panel) {
    var training = getTodayTraining();
    var streak = calcStreak();

    var html = '';

    if (streak > 0) {
      html += '<div class="dp-streak"><div class="dp-streak-num">' + streak + '</div><div class="dp-streak-text"><strong>Dias consecutivos</strong>Continue assim! Sua jornada espiritual está crescendo.</div></div>';
    }

    if (training) {
      html += '<div class="dp-training-card">' +
        '<p class="dp-tc-title">Treinando Hoje</p>' +
        '<p class="dp-tc-sub">' + training.livro + ' — Capítulo ' + training.capitulo + '</p>' +
        '<p class="dp-tc-sub" style="margin-top:4px;color:#5B8C5A;font-weight:600;">Pratique os ensinamentos durante o dia!</p>' +
      '</div>' +
      '<button class="dp-btn dp-btn-secondary" style="margin-bottom:12px;" onclick="document.querySelectorAll(\'.dp-tab\')[1].click();">Escrever Relato do Dia</button>' +
      '<button class="dp-btn dp-btn-secondary" id="dp-cancel-training">Cancelar Treino de Hoje</button>';
    } else {
      html += '<div class="dp-section">' +
        '<h3>Escolha um capítulo para treinar hoje</h3>' +
        '<div style="margin-bottom:12px;">' +
          '<label style="font-size:13px;color:#8C7B6B;display:block;margin-bottom:6px;">Categoria</label>' +
          '<select class="dp-select" id="dp-cat-select"><option value="">Selecione...</option></select>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' +
          '<label style="font-size:13px;color:#8C7B6B;display:block;margin-bottom:6px;">Livro</label>' +
          '<select class="dp-select" id="dp-book-select" disabled><option value="">Selecione a categoria primeiro</option></select>' +
        '</div>' +
        '<div style="margin-bottom:16px;">' +
          '<label style="font-size:13px;color:#8C7B6B;display:block;margin-bottom:6px;">Capítulo</label>' +
          '<select class="dp-select" id="dp-chap-select" disabled><option value="">Selecione o livro primeiro</option></select>' +
        '</div>' +
        '<button class="dp-btn dp-btn-primary" id="dp-start-training" disabled>Treinar Hoje</button>' +
      '</div>';
    }

    panel.innerHTML = html;

    if (training) {
      var cancelBtn = document.getElementById('dp-cancel-training');
      if (cancelBtn) cancelBtn.addEventListener('click', function() {
        var data = loadData();
        data.entries = data.entries.filter(function(e) { return !(e.date === todayStr() && e.status === 'training'); });
        saveData(data);
        renderTreinar(panel);
      });
    } else {
      setupSelectors(panel);
    }
  }

  function setupSelectors(panel) {
    var catSel = document.getElementById('dp-cat-select');
    var bookSel = document.getElementById('dp-book-select');
    var chapSel = document.getElementById('dp-chap-select');
    var startBtn = document.getElementById('dp-start-training');

    Object.keys(CATEGORY_LABELS).forEach(function(k) {
      var opt = document.createElement('option');
      opt.value = k; opt.textContent = CATEGORY_LABELS[k];
      catSel.appendChild(opt);
    });

    catSel.addEventListener('change', function() {
      bookSel.innerHTML = '<option value="">Selecione...</option>';
      chapSel.innerHTML = '<option value="">Selecione o livro primeiro</option>';
      chapSel.disabled = true;
      startBtn.disabled = true;
      if (!catSel.value) { bookSel.disabled = true; return; }
      bookSel.disabled = false;
      var books = SCRIPTURES[catSel.value] || [];
      books.forEach(function(b) {
        var opt = document.createElement('option');
        opt.value = b.id; opt.textContent = b.name;
        bookSel.appendChild(opt);
      });
    });

    bookSel.addEventListener('change', function() {
      chapSel.innerHTML = '<option value="">Selecione...</option>';
      startBtn.disabled = true;
      if (!bookSel.value) { chapSel.disabled = true; return; }
      chapSel.disabled = false;
      var books = SCRIPTURES[catSel.value] || [];
      var book = books.find(function(b) { return b.id === bookSel.value; });
      if (book) {
        for (var i = 1; i <= book.chapters; i++) {
          var opt = document.createElement('option');
          opt.value = i; opt.textContent = 'Capítulo ' + i;
          chapSel.appendChild(opt);
        }
      }
    });

    chapSel.addEventListener('change', function() {
      startBtn.disabled = !chapSel.value;
    });

    startBtn.addEventListener('click', function() {
      var books = SCRIPTURES[catSel.value] || [];
      var book = books.find(function(b) { return b.id === bookSel.value; });
      if (!book) return;
      var data = loadData();
      // Remove treino anterior do mesmo dia se existir
      data.entries = data.entries.filter(function(e) { return !(e.date === todayStr() && e.status === 'training'); });
      data.entries.push({
        date: todayStr(),
        status: 'training',
        categoria: catSel.value,
        categoriaLabel: CATEGORY_LABELS[catSel.value],
        livroId: book.id,
        livro: book.name,
        capitulo: parseInt(chapSel.value),
        createdAt: new Date().toISOString()
      });
      saveData(data);
      renderTreinar(panel);
    });
  }

  // ── RELATAR ──
  function renderRelatar(panel) {
    var training = getTodayTraining();
    var data = loadData();
    var todayEntry = data.entries.find(function(e) { return e.date === todayStr() && e.feedback; });

    if (todayEntry && todayEntry.feedback) {
      renderFeedback(panel, todayEntry);
      return;
    }

    if (!training) {
      panel.innerHTML = '<div class="dp-empty"><div class="dp-empty-icon">&#128214;</div><p>Você ainda não escolheu um capítulo para treinar hoje.<br>Vá na aba <strong>Treinar</strong> para começar!</p></div>';
      return;
    }

    panel.innerHTML = '<div class="dp-training-card">' +
      '<p class="dp-tc-title">Treinando: ' + training.livro + '</p>' +
      '<p class="dp-tc-sub">Capítulo ' + training.capitulo + ' — ' + training.categoriaLabel + '</p>' +
    '</div>' +
    '<div class="dp-section">' +
      '<h3>Como foi seu dia?</h3>' +
      '<p style="font-size:13px;color:#8C7B6B;margin:0 0 12px;">Descreva como foi seu dia, que atitudes tomou, como agiu com as pessoas, que decisões fez. Seja honesto — quanto mais detalhes, melhor o feedback.</p>' +
      '<textarea class="dp-textarea" id="dp-relato" placeholder="Hoje eu acordei e..."></textarea>' +
    '</div>' +
    '<button class="dp-btn dp-btn-success" id="dp-submit-relato" disabled>Enviar para Análise da IA</button>';

    var textarea = document.getElementById('dp-relato');
    var submitBtn = document.getElementById('dp-submit-relato');

    textarea.addEventListener('input', function() {
      submitBtn.disabled = textarea.value.trim().length < 20;
    });

    submitBtn.addEventListener('click', function() {
      submitRelato(panel, training, textarea.value.trim());
    });
  }

  function submitRelato(panel, training, relato) {
    // Mostrar loading
    panel.innerHTML = '<div class="dp-loading"><div class="dp-spinner"></div><p class="dp-loading-text">Analisando seu relato com sabedoria...</p><p style="font-size:12px;color:#8C7B6B;margin-top:8px;">Comparando com os ensinamentos de ' + training.livro + '</p></div>';

    // Preparar histórico resumido
    var data = loadData();
    var recentEntries = data.entries.filter(function(e) { return e.feedback; }).slice(-5);
    var historicoResumo = '';
    if (recentEntries.length > 0) {
      historicoResumo = 'Últimas práticas:\n';
      recentEntries.forEach(function(e) {
        historicoResumo += '- ' + e.date + ': ' + e.livro + ' Cap.' + e.capitulo + ' (Nota: ' + (e.feedback.nota_geral || '?') + ')\n';
      });
    }

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        relato: relato,
        capitulo: training.capitulo,
        livro: training.livro,
        categoria: training.categoriaLabel,
        historico_resumo: historicoResumo || undefined
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(result) {
      if (!result.success) throw new Error(result.error || 'Erro desconhecido');
      var feedback = result.feedback;

      // Salvar no localStorage
      var data = loadData();
      var idx = data.entries.findIndex(function(e) { return e.date === todayStr() && e.status === 'training'; });
      if (idx >= 0) {
        data.entries[idx].status = 'completed';
        data.entries[idx].relato = relato;
        data.entries[idx].feedback = feedback;
        data.entries[idx].completedAt = new Date().toISOString();
      }
      saveData(data);
      renderFeedback(panel, data.entries[idx]);
    })
    .catch(function(err) {
      panel.innerHTML = '<div class="dp-empty"><div class="dp-empty-icon">&#9888;&#65039;</div><p>Ocorreu um erro ao analisar seu relato.<br><strong>' + (err.message || 'Tente novamente') + '</strong></p></div>' +
        '<button class="dp-btn dp-btn-primary" style="margin-top:16px;" onclick="document.querySelectorAll(\'.dp-tab\')[1].click();">Tentar Novamente</button>';
    });
  }

  function renderFeedback(panel, entry) {
    var fb = entry.feedback;
    var nota = fb.nota_geral || 0;
    var color = scoreColor(nota);

    var html = '<div class="dp-training-card">' +
      '<p class="dp-tc-title">' + entry.livro + ' — Capítulo ' + entry.capitulo + '</p>' +
      '<p class="dp-tc-sub">' + entry.date + ' — ' + (entry.categoriaLabel || '') + '</p>' +
    '</div>';

    // Score
    html += '<div style="text-align:center;margin-bottom:20px;">' +
      '<div class="dp-score-ring" style="background:' + color + ';">' + nota + '</div>' +
      '<div class="dp-score-label">Nota Geral de Consonância</div>' +
    '</div>';

    // Consonâncias
    if (fb.consonancias) {
      html += '<div class="dp-feedback-card green"><h4>&#10004; Consonâncias</h4><p>' + fb.consonancias + '</p></div>';
    }

    // Divergências
    if (fb.divergencias) {
      html += '<div class="dp-feedback-card orange"><h4>&#9888; Pontos de Atenção</h4><p>' + fb.divergencias + '</p></div>';
    }

    // Dicas
    if (fb.dicas) {
      html += '<div class="dp-feedback-card blue"><h4>&#128161; Dicas para Amanhã</h4><p>' + fb.dicas + '</p></div>';
    }

    // Orientações
    if (fb.orientacoes) {
      html += '<div class="dp-feedback-card"><h4>&#127793; Orientações</h4><p>' + fb.orientacoes + '</p></div>';
    }

    // Aspectos
    if (fb.aspectos) {
      html += '<div class="dp-section"><h4>Aspectos Espirituais</h4><div class="dp-aspects">';
      Object.keys(ASPECT_LABELS).forEach(function(k) {
        var val = fb.aspectos[k] || 0;
        html += '<div class="dp-aspect">' +
          '<div class="dp-aspect-name">' + ASPECT_LABELS[k] + '</div>' +
          '<div class="dp-aspect-bar"><div class="dp-aspect-fill" style="width:' + (val*10) + '%;background:' + (ASPECT_COLORS[k] || '#8B5E3C') + ';"></div></div>' +
          '<div class="dp-aspect-val">' + val + '/10</div>' +
        '</div>';
      });
      html += '</div></div>';
    }

    // Frase motivacional
    if (fb.frase_motivacional) {
      html += '<div class="dp-motivational"><p>"' + fb.frase_motivacional + '"</p></div>';
    }

    panel.innerHTML = html;
  }

  // ── PERFIL ──
  function renderPerfil(panel) {
    var profile = calcProfile();
    var data = loadData();
    var totalDays = data.entries.filter(function(e) { return e.feedback; }).length;
    var streak = calcStreak();

    if (!profile || totalDays === 0) {
      panel.innerHTML = '<div class="dp-empty"><div class="dp-empty-icon">&#127793;</div><p>Seu perfil espiritual será construído conforme você pratica.<br>Complete pelo menos um dia de prática para ver seu diagrama!</p></div>';
      return;
    }

    var html = '<div style="text-align:center;margin-bottom:20px;">' +
      '<div class="dp-score-ring" style="background:' + scoreColor(profile.nota_media) + ';">' + profile.nota_media + '</div>' +
      '<div class="dp-score-label">Média Geral (últimos 14 dias)</div>' +
    '</div>';

    html += '<div style="display:flex;gap:12px;margin-bottom:20px;">' +
      '<div style="flex:1;background:#F5EDE0;border-radius:12px;padding:14px;text-align:center;border:1px solid #E0D5C8;">' +
        '<div style="font-size:24px;font-weight:800;color:#8B5E3C;">' + totalDays + '</div>' +
        '<div style="font-size:11px;color:#8C7B6B;">Dias Praticados</div>' +
      '</div>' +
      '<div style="flex:1;background:#F5EDE0;border-radius:12px;padding:14px;text-align:center;border:1px solid #E0D5C8;">' +
        '<div style="font-size:24px;font-weight:800;color:#D4A03C;">' + streak + '</div>' +
        '<div style="font-size:11px;color:#8C7B6B;">Sequência Atual</div>' +
      '</div>' +
    '</div>';

    // Diagrama de aspectos
    html += '<div class="dp-section"><h3>Diagrama Espiritual</h3><div class="dp-chart-container">';
    Object.keys(ASPECT_LABELS).forEach(function(k) {
      var val = profile[k] || 0;
      var pct = val * 10;
      html += '<div class="dp-chart-row">' +
        '<div class="dp-chart-label">' + ASPECT_LABELS[k] + '</div>' +
        '<div class="dp-chart-bar-wrap">' +
          '<div class="dp-chart-bar-fill" style="width:' + pct + '%;background:' + (ASPECT_COLORS[k] || '#8B5E3C') + ';"></div>' +
          '<div class="dp-chart-bar-val">' + val + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div></div>';

    // Categorias mais praticadas
    var catCount = {};
    data.entries.filter(function(e) { return e.feedback; }).forEach(function(e) {
      var cat = e.categoriaLabel || e.categoria || 'Outro';
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
    var sortedCats = Object.keys(catCount).sort(function(a,b) { return catCount[b] - catCount[a]; });
    if (sortedCats.length > 0) {
      html += '<div class="dp-section"><h3>Categorias Mais Praticadas</h3>';
      sortedCats.slice(0, 5).forEach(function(cat) {
        html += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E0D5C8;">' +
          '<span style="font-size:13px;color:#2C1810;">' + cat + '</span>' +
          '<span style="font-size:13px;font-weight:700;color:#8B5E3C;">' + catCount[cat] + 'x</span>' +
        '</div>';
      });
      html += '</div>';
    }

    panel.innerHTML = html;
  }

  // ── HISTÓRICO ──
  function renderHistorico(panel) {
    var data = loadData();
    var completed = data.entries.filter(function(e) { return e.feedback; });
    completed.sort(function(a,b) { return b.date.localeCompare(a.date); });

    if (!completed.length) {
      panel.innerHTML = '<div class="dp-empty"><div class="dp-empty-icon">&#128197;</div><p>Nenhum registro ainda.<br>Complete sua primeira prática para ver o histórico!</p></div>';
      return;
    }

    var html = '<div class="dp-section"><h3>Seus Registros (' + completed.length + ')</h3>';
    completed.forEach(function(entry, idx) {
      var nota = entry.feedback.nota_geral || 0;
      html += '<div class="dp-history-item" data-idx="' + idx + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<div>' +
            '<p class="dp-history-date">' + formatDate(entry.date) + '</p>' +
            '<p class="dp-history-book">' + entry.livro + ' — Cap. ' + entry.capitulo + '</p>' +
          '</div>' +
          '<span class="dp-history-score" style="background:' + scoreColor(nota) + ';">' + nota + '/10</span>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';

    // Botão limpar dados
    html += '<button class="dp-btn dp-btn-secondary" id="dp-clear-data" style="margin-top:12px;font-size:12px;color:#C45B4A;">Limpar Todos os Dados</button>';

    panel.innerHTML = html;

    // Click em item do histórico
    panel.querySelectorAll('.dp-history-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var idx = parseInt(item.dataset.idx);
        var entry = completed[idx];
        if (entry) renderFeedback(panel, entry);
      });
    });

    var clearBtn = document.getElementById('dp-clear-data');
    if (clearBtn) clearBtn.addEventListener('click', function() {
      if (confirm('Tem certeza que deseja apagar todos os dados do Diário de Prática? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem(LS_KEY);
        renderHistorico(panel);
      }
    });
  }

  function formatDate(ds) {
    var parts = ds.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  // ── Botão flutuante do Diário ──
  function createDiarioButton() {
    if (document.getElementById('btn-diario-pratica')) return;

    var btn = document.createElement('button');
    btn.id = 'btn-diario-pratica';
    btn.innerHTML = '<span style="font-size:18px;line-height:1">&#128214;</span><span style="font-size:10px;font-weight:700;letter-spacing:0.3px">Diário</span>';

    btn.style.cssText = [
      'position:fixed',
      'bottom:80px',
      'left:18px',
      'z-index:99998',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'justify-content:center',
      'gap:2px',
      'width:58px',
      'height:58px',
      'border-radius:50%',
      'border:none',
      'cursor:pointer',
      'background:linear-gradient(145deg,#5B8C5A,#4A7A49)',
      'color:#fdf8f0',
      'box-shadow:0 4px 18px rgba(91,140,90,0.55),0 1px 4px rgba(0,0,0,0.2)',
      'font-family:system-ui,sans-serif',
      'transition:transform 0.15s ease,box-shadow 0.15s ease',
      'outline:none',
      '-webkit-tap-highlight-color:transparent'
    ].join(';');

    // Indicador de treino ativo
    var training = getTodayTraining();
    if (training) {
      var dot = document.createElement('span');
      dot.style.cssText = 'position:absolute;top:2px;right:2px;width:14px;height:14px;background:#D4A03C;border-radius:50%;border:2px solid #FDF8F0;animation:dp-pulse 2s infinite;';
      btn.style.position = 'fixed'; // ensure relative positioning for dot
      btn.appendChild(dot);
      var pulseStyle = document.createElement('style');
      pulseStyle.textContent = '@keyframes dp-pulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.3);opacity:0.7;}}';
      document.head.appendChild(pulseStyle);
    }

    btn.addEventListener('mouseenter', function () {
      btn.style.transform = 'scale(1.08)';
      btn.style.boxShadow = '0 6px 24px rgba(91,140,90,0.7),0 2px 6px rgba(0,0,0,0.25)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 18px rgba(91,140,90,0.55),0 1px 4px rgba(0,0,0,0.2)';
    });
    btn.addEventListener('mousedown', function () { btn.style.transform = 'scale(0.94)'; });
    btn.addEventListener('mouseup', function () { btn.style.transform = 'scale(1.08)'; });

    btn.addEventListener('click', function () { openOverlay(); });

    document.body.appendChild(btn);
  }

  // ── Inicializar ──
  function init() {
    createDiarioButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-inserir botão em navegação SPA
  var _origPS2 = history.pushState;
  var _origRS2 = history.replaceState;
  function onNav2() { setTimeout(function() { createDiarioButton(); }, 250); }
  history.pushState = function () { _origPS2.apply(this, arguments); onNav2(); };
  history.replaceState = function () { _origRS2.apply(this, arguments); onNav2(); };
  window.addEventListener('popstate', onNav2);

})();
