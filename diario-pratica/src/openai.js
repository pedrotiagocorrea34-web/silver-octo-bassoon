/**
 * OpenAI Integration for Diário de Prática
 * Gera feedback espiritual comparando ações do dia com ensinamentos sagrados
 */

const FEEDBACK_SYSTEM_PROMPT = `Você é um conselheiro espiritual sábio e compassivo do app "Escrituras Sagradas". 
Sua missão é comparar o relato do dia da pessoa com os ensinamentos do capítulo sagrado que ela escolheu praticar.

DIRETRIZES:
1. Seja SINCERO mas CONSTRUTIVO - nunca cruel ou julgador
2. Mostre claramente onde a pessoa foi CONSONANTE com os ensinamentos (com citações específicas do texto)
3. Mostre onde DIVERGIU, mas sempre com compaixão e sugestões práticas
4. Faça correlações entre ações/atitudes/palavras específicas e trechos do texto sagrado
5. Dê dicas práticas e conselhos alinhados com a filosofia do texto
6. Use um tom acolhedor, como um mentor sábio que genuinamente se importa
7. Reconheça o esforço da pessoa em buscar autoconhecimento
8. Termine com uma reflexão inspiradora

FORMATO DA RESPOSTA (JSON):
{
  "feedback": "Texto completo do feedback em markdown (use ## para seções, **negrito** para destaques, > para citações do texto sagrado)",
  "consonanceScore": número de 0 a 100 representando o grau de consonância,
  "strengths": ["lista de virtudes/qualidades demonstradas"],
  "improvements": ["lista de áreas para melhorar/desenvolver"]
}

IMPORTANTE: 
- O consonanceScore NÃO é uma nota de aprovação/reprovação
- É uma medida de alinhamento entre as ações e os ensinamentos
- Mesmo scores baixos devem ser apresentados de forma encorajadora
- Sempre encontre pelo menos um ponto positivo
- As strengths e improvements devem ser palavras-chave curtas (ex: "Paciência", "Compaixão", "Controle emocional")`;

const PROFILE_SYSTEM_PROMPT = `Você é um analista de perfil espiritual do app "Escrituras Sagradas".
Analise o histórico de feedbacks da pessoa e gere um perfil espiritual.

Retorne um JSON com:
{
  "virtues": {
    "Compaixão": 0-100,
    "Paciência": 0-100,
    "Sabedoria": 0-100,
    "Humildade": 0-100,
    "Gratidão": 0-100,
    "Coragem": 0-100,
    "Disciplina": 0-100,
    "Generosidade": 0-100
  },
  "summary": "Resumo breve do perfil espiritual da pessoa"
}

Baseie os scores nas forças e áreas de melhoria identificadas nos feedbacks anteriores.`;

export async function getAiFeedback(env, session, entry) {
  const apiKey = env.OPENAI_API_KEY;
  const apiBase = env.OPENAI_API_BASE || 'https://api.openai.com';

  if (!apiKey) {
    return {
      feedback: '## Feedback Indisponível\n\nA chave da API OpenAI não está configurada. Configure a variável OPENAI_API_KEY no Worker para habilitar o feedback por IA.',
      consonanceScore: 50,
      strengths: ['Dedicação à prática'],
      improvements: ['Configurar API para feedback completo']
    };
  }

  const userMessage = `## CAPÍTULO ESCOLHIDO PARA PRATICAR
**Livro:** ${session.book_name}
**Capítulo:** ${session.chapter} - ${session.chapter_title}

### Conteúdo do Capítulo:
${session.chapter_content || 'Conteúdo não disponível'}

---

## RELATO DO DIA DA PESSOA
${entry.entry_text}

---

Por favor, analise o relato comparando com os ensinamentos do capítulo e gere o feedback conforme as diretrizes.`;

  try {
    const response = await fetch(`${apiBase}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: FEEDBACK_SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI API error:', response.status, errText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);

    return {
      feedback: parsed.feedback || 'Feedback não disponível',
      consonanceScore: Math.max(0, Math.min(100, parsed.consonanceScore || 50)),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : []
    };

  } catch (error) {
    console.error('AI Feedback error:', error);
    return {
      feedback: `## Reflexão Automática\n\nNão foi possível gerar o feedback completo por IA neste momento. Mas o simples fato de você ter dedicado tempo para refletir sobre seu dia à luz dos ensinamentos de **${session.book_name}** já é um passo significativo na sua jornada espiritual.\n\n> A prática constante é o caminho para a transformação.\n\nTente novamente mais tarde para receber uma análise detalhada.`,
      consonanceScore: 50,
      strengths: ['Dedicação', 'Autorreflexão'],
      improvements: []
    };
  }
}

export async function getProfileAnalysis(env, feedbacks) {
  const apiKey = env.OPENAI_API_KEY;
  const apiBase = env.OPENAI_API_BASE || 'https://api.openai.com';

  if (!apiKey) return null;

  const feedbackSummary = feedbacks.map(f => ({
    score: f.consonance_score,
    strengths: f.strengths_json,
    improvements: f.improvements_json,
    book: f.book_name,
    chapter: f.chapter_title,
    date: f.created_at
  }));

  try {
    const response = await fetch(`${apiBase}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: PROFILE_SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(feedbackSummary) }
        ],
        max_tokens: 500,
        temperature: 0.5,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return content ? JSON.parse(content) : null;

  } catch (error) {
    console.error('Profile analysis error:', error);
    return null;
  }
}
