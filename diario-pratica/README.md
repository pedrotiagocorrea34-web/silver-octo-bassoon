# Diário de Prática - Escrituras Sagradas

Funcionalidade de **Diário de Prática** com chatbot IA para o app Escrituras Sagradas.

## Visão Geral

O Diário de Prática permite que o usuário:

1. **Escolha um capítulo** de qualquer livro/autor sagrado para praticar no dia
2. **Pratique** os ensinamentos durante o dia (ações, palavras, atitudes)
3. **Escreva no diário** como foi o dia, relatando suas experiências
4. **Receba feedback da IA** que compara o relato com os ensinamentos do capítulo
5. **Construa um perfil espiritual** ao longo do tempo com métricas de evolução

## Arquitetura

- **Cloudflare Worker** (`escrituras-diario`) - API REST + SPA frontend
- **Cloudflare D1** - Banco de dados SQLite para diário, sessões e perfil
- **OpenAI API** - Chatbot IA para feedback espiritual

## URL de Acesso

- **Diário de Prática**: https://escrituras-diario.escrituras-sagradas-tts.workers.dev
- **API Health Check**: https://escrituras-diario.escrituras-sagradas-tts.workers.dev/api/health

## Configuração

### Secrets do Worker

```bash
# Configurar chave OpenAI
echo "sk-..." | npx wrangler secret put OPENAI_API_KEY --name escrituras-diario

# Configurar base URL da API OpenAI (opcional)
echo "https://api.openai.com" | npx wrangler secret put OPENAI_API_BASE --name escrituras-diario
```

### Deploy

```bash
cd diario-pratica
npm install
npx wrangler deploy
```

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/user` | Criar/atualizar usuário |
| GET | `/api/sessions` | Listar sessões |
| POST | `/api/sessions` | Criar nova sessão de prática |
| GET | `/api/sessions/active` | Obter sessão ativa |
| POST | `/api/sessions/:id/complete` | Concluir sessão |
| POST | `/api/entries` | Criar entrada no diário |
| GET | `/api/entries` | Listar entradas |
| POST | `/api/feedback` | Gerar feedback da IA |
| GET | `/api/profile` | Obter perfil espiritual |
| POST | `/api/profile/refresh` | Atualizar perfil |
| GET | `/api/history` | Histórico completo |

## Banco de Dados (D1)

### Tabelas

- `users` - Dados do usuário
- `practice_sessions` - Sessões de prática (capítulo escolhido)
- `diary_entries` - Entradas do diário
- `ai_feedbacks` - Feedbacks gerados pela IA
- `user_profiles` - Perfil espiritual agregado

As tabelas são criadas automaticamente na primeira requisição (auto-migration).

## Livros Disponíveis

O app inclui conteúdo de diversas tradições espirituais e filosóficas:

- Bíblia Sagrada (73 livros)
- Hermes Trismegisto (Corpus Hermeticum, Tábua de Esmeralda, O Caibalion)
- São Francisco de Assis
- Filósofos Orientais (Confúcio, Lao Tsé)
- Mestres Modernos (Gandhi, Madre Teresa)
- Platão e Sócrates
- Escrituras Budistas (Dhammapada)
- Aristóteles
- Santos e Mártires
- Outras Grandes Mentes (Marco Aurélio, Epicuro)
