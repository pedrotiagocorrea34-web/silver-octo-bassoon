/**
 * Diário de Prática Espiritual - API Worker
 * Cloudflare Worker que serve como proxy seguro para a OpenAI API.
 * Recebe o relato do dia do usuário + o capítulo escolhido e retorna
 * feedback espiritual personalizado via GPT-4o-mini.
 */

const SYSTEM_PROMPT = `Você é um guia espiritual sábio e compassivo do app "Escrituras Sagradas". Sua missão é ajudar pessoas a viverem de acordo com os ensinamentos das escrituras que escolheram praticar.

## SEU PAPEL
Você analisa o relato diário do praticante comparando com os ensinamentos do capítulo escolhido para o dia. Seja honesto, amoroso e construtivo.

## FORMATO DA RESPOSTA
Responda SEMPRE em JSON válido com esta estrutura exata:
{
  "consonancias": "Texto descrevendo onde a pessoa agiu em consonância com os ensinamentos. Seja específico, citando atitudes e conectando com os ensinamentos.",
  "divergencias": "Texto descrevendo onde a pessoa divergiu ou poderia ter agido melhor segundo os ensinamentos. Seja gentil mas honesto.",
  "dicas": "3-5 dicas práticas e conselhos alinhados com a filosofia dos ensinamentos para o dia seguinte.",
  "orientacoes": "Orientações gerais para melhorar a prática espiritual, considerando o que foi relatado.",
  "nota_geral": 7,
  "aspectos": {
    "compaixao": 7,
    "disciplina": 6,
    "sabedoria": 7,
    "paz_interior": 6,
    "generosidade": 7,
    "paciencia": 6,
    "gratidao": 7
  },
  "frase_motivacional": "Uma frase inspiradora relacionada aos ensinamentos do capítulo."
}

## REGRAS
1. A nota_geral vai de 1 a 10 (10 = perfeita consonância)
2. Cada aspecto vai de 1 a 10
3. Seja empático e encorajador, mesmo quando apontar divergências
4. Conecte sempre o feedback com os ensinamentos específicos do capítulo/livro
5. Use linguagem acessível e acolhedora
6. As dicas devem ser práticas e aplicáveis no dia a dia
7. SEMPRE responda em português brasileiro
8. NUNCA inclua texto fora do JSON
9. Se o relato for vago, peça mais detalhes de forma gentil dentro do JSON`;

function corsHeaders(origin, allowedOrigin) {
  const allowed = allowedOrigin === '*' || origin === allowedOrigin || 
    (origin && (origin.endsWith('.pages.dev') || origin.includes('localhost')));
  return {
    'Access-Control-Allow-Origin': allowed ? origin : allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    const headers = corsHeaders(origin, allowedOrigin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // Routing
    if (url.pathname === '/api/analyze' && request.method === 'POST') {
      return handleAnalyze(request, env, headers);
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'diario-pratica-api' }), {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
};

async function handleAnalyze(request, env, headers) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }

  const { relato, capitulo, livro, categoria, historico_resumo } = body;

  if (!relato || !capitulo || !livro) {
    return new Response(JSON.stringify({ error: 'Campos obrigatórios: relato, capitulo, livro' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }

  const userMessage = buildUserMessage(relato, capitulo, livro, categoria, historico_resumo);

  try {
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key não configurada' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const apiBase = env.OPENAI_API_BASE || 'https://api.openai.com';
    const response = await fetch(`${apiBase}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', response.status, errText);
      return new Response(JSON.stringify({ error: 'Erro na API de IA', details: response.status }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: 'Resposta vazia da IA' }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    // Parse e valida o JSON da resposta
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Se não for JSON válido, retorna como texto
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({
      success: true,
      feedback: parsed,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Worker error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
}

function buildUserMessage(relato, capitulo, livro, categoria, historico_resumo) {
  let msg = `## Capítulo Praticado Hoje
- Livro: ${livro}
- Capítulo: ${capitulo}
${categoria ? `- Categoria: ${categoria}` : ''}

## Relato do Dia
${relato}`;

  if (historico_resumo) {
    msg += `

## Histórico Recente do Praticante
${historico_resumo}`;
  }

  msg += `

Por favor, analise o relato comparando com os ensinamentos do capítulo mencionado e forneça o feedback no formato JSON especificado.`;

  return msg;
}
