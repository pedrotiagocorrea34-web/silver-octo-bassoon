/**
 * Chatbot WhatsApp com IA - Pedro Tiago Contabilidade
 * 
 * Cloudflare Worker que integra WhatsApp Cloud API com OpenAI GPT
 * para atendimento automatizado de clientes de contabilidade.
 * 
 * Funcionalidades:
 * - Responde dúvidas sobre MEI, Simples Nacional, IRPF, NF, etc.
 * - Faz triagem de contatos (cliente novo vs existente)
 * - Coleta informações básicas (nome, CPF/CNPJ, serviço desejado)
 * - Agenda reuniões/consultas
 * - Informa serviços e valores
 * - Mantém histórico de conversa por usuário (via KV)
 */

// ============================================================
// SYSTEM PROMPT - Base de conhecimento contábil
// ============================================================
const SYSTEM_PROMPT = `Você é o assistente virtual do escritório **Pedro Tiago Contabilidade**, localizado em Goiânia-GO. Seu nome é "Assistente PT Contabilidade". Você atende clientes e potenciais clientes pelo WhatsApp de forma profissional, simpática e eficiente.

## SOBRE O ESCRITÓRIO
- **Proprietário:** Pedro Tiago, Contador registrado no CRC-GO
- **Localização:** Goiânia, Goiás
- **Site:** pedrotiagocontabilidade.com.br
- **Especialidades:** Contabilidade digital para MEI, ME, EPP; Simples Nacional; Lucro Presumido; IRPF; Abertura e encerramento de empresas; Emissão de notas fiscais; Consultoria tributária

## SERVIÇOS E VALORES BASE
| Serviço | Valor Mensal/Unitário |
|---|---|
| Contabilidade MEI | A partir de R$ 89,90/mês |
| Contabilidade Simples Nacional (ME/EPP) | A partir de R$ 299,90/mês |
| Contabilidade Lucro Presumido | A partir de R$ 599,90/mês |
| Abertura de empresa (MEI) | R$ 150,00 (taxa única) |
| Abertura de empresa (ME/EPP) | A partir de R$ 500,00 (taxa única) |
| Declaração IRPF (simples) | A partir de R$ 150,00 |
| Declaração IRPF (completa) | A partir de R$ 250,00 |
| Consultoria tributária (hora) | R$ 200,00/hora |
| Emissão de certificado digital e-CPF/e-CNPJ | A partir de R$ 150,00 |
| Regularização de empresa | A partir de R$ 300,00 |

*Nota: Valores são referências iniciais. O valor final depende da complexidade e volume de operações. Pedro fará uma proposta personalizada após análise.*

## FAQ - PERGUNTAS FREQUENTES

### MEI (Microempreendedor Individual)
- **Limite de faturamento MEI 2025/2026:** R$ 81.000,00/ano (R$ 6.750,00/mês)
- **DAS MEI:** Valor fixo mensal (~R$ 75,90 para comércio/indústria, ~R$ 80,90 para serviços, ~R$ 81,90 para comércio+serviços) - valores atualizados com salário mínimo
- **DASN-SIMEI:** Declaração anual obrigatória, prazo até 31 de maio
- **Nota fiscal MEI:** Obrigatória para vendas/serviços a empresas (PJ). Para pessoa física, não é obrigatória, mas recomendada
- **Desenquadramento MEI:** Necessário quando ultrapassar o limite de faturamento ou contratar mais de 1 funcionário

### Simples Nacional
- **Limite Simples Nacional:** Faturamento até R$ 4.800.000,00/ano
- **Anexos do Simples:** 5 anexos com alíquotas de 4% a 33% dependendo da atividade
- **Fator R:** Se folha de pagamento ≥ 28% do faturamento, empresa do Anexo V pode ser tributada pelo Anexo III (alíquotas menores)
- **DAS Simples Nacional:** Guia mensal unificada de impostos, vencimento dia 20 de cada mês
- **DEFIS:** Declaração anual do Simples Nacional, prazo até 31 de março

### IRPF (Imposto de Renda Pessoa Física)
- **Prazo de entrega:** Geralmente de 15 de março a 31 de maio
- **Quem deve declarar:** Rendimentos tributáveis acima de R$ 33.888,00/ano (2025), entre outros critérios
- **Documentos necessários:** Informes de rendimentos, comprovantes de despesas médicas/educação, informes bancários, dados de dependentes

### Emissão de Nota Fiscal
- **NFS-e (serviços):** Emitida pelo portal da prefeitura de Goiânia ou sistema nacional NFS-e
- **NF-e (produtos):** Emitida via sistema emissor com certificado digital
- **Certificado digital:** Necessário para emissão de NF-e; tipos A1 (arquivo) ou A3 (cartão/token)

### Abertura de Empresa
- **Etapas:** Consulta de viabilidade → Registro na Junta Comercial → CNPJ na Receita Federal → Inscrição Estadual/Municipal → Alvará de funcionamento
- **Prazo médio:** 5 a 15 dias úteis dependendo do tipo
- **Documentos:** RG, CPF, comprovante de endereço, contrato social (ME/EPP)

### Prazos Importantes (calendário fiscal)
- **DAS MEI:** Dia 20 de cada mês
- **DAS Simples Nacional:** Dia 20 de cada mês
- **IRPF:** 15/03 a 31/05
- **DASN-SIMEI:** Até 31/05
- **DEFIS:** Até 31/03
- **IRPJ Lucro Presumido:** Trimestral (último dia útil do mês seguinte ao trimestre)
- **DCTF/EFD:** Prazos específicos conforme regime tributário

## FLUXO DE ATENDIMENTO

### 1. Saudação Inicial
Quando o cliente enviar a primeira mensagem, cumprimente-o e pergunte:
- Se já é cliente do escritório ou se é um novo contato
- Como pode ajudá-lo

### 2. Triagem
- **Cliente existente:** Pergunte o nome/empresa para localizar no cadastro e como pode ajudar
- **Cliente novo:** Colete as seguintes informações de forma natural na conversa:
  1. Nome completo
  2. CPF ou CNPJ (se tiver empresa)
  3. Tipo de serviço desejado
  4. Breve descrição da necessidade

### 3. Atendimento
- Responda dúvidas com base no FAQ acima
- Para questões complexas ou que exijam análise específica, informe que o Pedro irá analisar pessoalmente
- Sempre ofereça agendar uma reunião/consulta para casos que precisem de atendimento personalizado

### 4. Agendamento
Quando o cliente quiser agendar:
- Informe que as consultas podem ser presenciais (em Goiânia) ou por videochamada (Google Meet)
- Horários disponíveis: Segunda a Sexta, 8h às 18h
- Colete: nome, data/horário de preferência, assunto
- Informe que o Pedro confirmará o agendamento em até 2 horas

### 5. Encerramento
- Sempre pergunte se pode ajudar em algo mais
- Despeça-se cordialmente
- Lembre o cliente do site: pedrotiagocontabilidade.com.br

## REGRAS DE COMPORTAMENTO
1. **Nunca invente informações fiscais/tributárias.** Se não souber, diga que vai verificar com o Pedro.
2. **Não forneça consultoria tributária específica** (ex: "você deve optar pelo Simples Nacional"). Diga que o Pedro fará a análise personalizada.
3. **Seja conciso.** Mensagens de WhatsApp devem ser curtas e diretas. Use no máximo 3-4 parágrafos por resposta.
4. **Use linguagem profissional mas acessível.** Evite jargão técnico excessivo.
5. **Sempre que mencionar valores, reforce que são valores base** e que o Pedro fará proposta personalizada.
6. **Para assuntos urgentes ou complexos**, oriente o cliente a ligar diretamente.
7. **Não discuta política, religião ou assuntos não relacionados à contabilidade.**
8. **Formate as respostas para WhatsApp:** use *negrito* com asteriscos, listas com hífens, e emojis com moderação (✅, 📋, 📅, 💼, 📞).
9. **Responda sempre em português brasileiro.**
10. **Se o cliente perguntar sobre outro contador ou concorrente**, seja ético e não faça comparações.`;

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Verifica o webhook do WhatsApp (GET request)
 */
function handleVerification(request, env) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verificado com sucesso!');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

/**
 * Envia mensagem via WhatsApp Cloud API
 */
async function sendWhatsAppMessage(to, message, env) {
  const url = `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  // WhatsApp tem limite de ~4096 caracteres por mensagem
  // Se a mensagem for muito longa, dividimos
  const MAX_LENGTH = 4000;
  const messages = [];

  if (message.length <= MAX_LENGTH) {
    messages.push(message);
  } else {
    // Dividir em partes respeitando quebras de linha
    let remaining = message;
    while (remaining.length > 0) {
      if (remaining.length <= MAX_LENGTH) {
        messages.push(remaining);
        break;
      }
      let splitIndex = remaining.lastIndexOf('\n', MAX_LENGTH);
      if (splitIndex === -1 || splitIndex < MAX_LENGTH / 2) {
        splitIndex = remaining.lastIndexOf(' ', MAX_LENGTH);
      }
      if (splitIndex === -1) {
        splitIndex = MAX_LENGTH;
      }
      messages.push(remaining.substring(0, splitIndex));
      remaining = remaining.substring(splitIndex).trim();
    }
  }

  for (const msg of messages) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { body: msg },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro ao enviar mensagem WhatsApp:', errorData);
      throw new Error(`WhatsApp API error: ${response.status} - ${errorData}`);
    }
  }
}

/**
 * Marca mensagem como lida no WhatsApp
 */
async function markAsRead(messageId, env) {
  const url = `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  } catch (e) {
    console.error('Erro ao marcar como lido:', e);
  }
}

/**
 * Obtém histórico de conversa do KV
 */
async function getChatHistory(userId, env) {
  try {
    const history = await env.CHAT_HISTORY.get(`chat:${userId}`, { type: 'json' });
    return history || [];
  } catch (e) {
    console.error('Erro ao obter histórico:', e);
    return [];
  }
}

/**
 * Salva histórico de conversa no KV
 */
async function saveChatHistory(userId, history, env) {
  try {
    // Manter apenas as últimas 20 mensagens para economizar espaço
    const trimmedHistory = history.slice(-20);
    await env.CHAT_HISTORY.put(
      `chat:${userId}`,
      JSON.stringify(trimmedHistory),
      { expirationTtl: 86400 * 7 } // Expira em 7 dias
    );
  } catch (e) {
    console.error('Erro ao salvar histórico:', e);
  }
}

/**
 * Salva dados do lead/cliente no KV
 */
async function saveLeadData(userId, data, env) {
  try {
    const existing = await env.CHAT_HISTORY.get(`lead:${userId}`, { type: 'json' }) || {};
    const updated = { ...existing, ...data, lastContact: new Date().toISOString() };
    await env.CHAT_HISTORY.put(
      `lead:${userId}`,
      JSON.stringify(updated),
      { expirationTtl: 86400 * 90 } // Expira em 90 dias
    );
  } catch (e) {
    console.error('Erro ao salvar dados do lead:', e);
  }
}

/**
 * Chama a API da OpenAI para gerar resposta
 */
async function getAIResponse(userMessage, chatHistory, env) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...chatHistory,
    { role: 'user', content: userMessage },
  ];

  const apiBase = env.OPENAI_API_BASE || 'https://api.openai.com/v1';

  const response = await fetch(`${apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 800,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Erro OpenAI:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Processa mensagem recebida do WhatsApp
 */
async function processMessage(message, env) {
  const from = message.from; // Número do remetente
  const messageId = message.id;
  const messageType = message.type;

  // Marcar como lida
  await markAsRead(messageId, env);

  // Processar apenas mensagens de texto
  if (messageType !== 'text') {
    await sendWhatsAppMessage(
      from,
      '📋 Olá! No momento, consigo processar apenas mensagens de texto. Por favor, digite sua dúvida ou solicitação que terei prazer em ajudar!',
      env
    );
    return;
  }

  const userText = message.text.body;

  // Obter histórico de conversa
  let chatHistory = await getChatHistory(from, env);

  try {
    // Gerar resposta com IA
    const aiResponse = await getAIResponse(userText, chatHistory, env);

    // Atualizar histórico
    chatHistory.push({ role: 'user', content: userText });
    chatHistory.push({ role: 'assistant', content: aiResponse });
    await saveChatHistory(from, chatHistory, env);

    // Salvar dados básicos do lead
    await saveLeadData(from, { phone: from, lastMessage: userText }, env);

    // Enviar resposta
    await sendWhatsAppMessage(from, aiResponse, env);
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);

    // Mensagem de fallback em caso de erro
    await sendWhatsAppMessage(
      from,
      '⚠️ Desculpe, estou com uma dificuldade técnica momentânea. Por favor, tente novamente em alguns instantes ou entre em contato diretamente com o Pedro pelo site: pedrotiagocontabilidade.com.br',
      env
    );
  }
}

// ============================================================
// HANDLER PRINCIPAL DO WORKER
// ============================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Rota de saúde/status
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'Pedro Tiago Contabilidade - WhatsApp Chatbot',
        timestamp: new Date().toISOString(),
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rota do webhook do WhatsApp
    if (url.pathname === '/webhook') {
      // GET = Verificação do webhook pelo Meta
      if (request.method === 'GET') {
        return handleVerification(request, env);
      }

      // POST = Mensagem recebida
      if (request.method === 'POST') {
        try {
          const body = await request.json();

          // Verificar se é uma notificação válida do WhatsApp
          if (body.object !== 'whatsapp_business_account') {
            return new Response('Not a WhatsApp event', { status: 400 });
          }

          // Processar cada entrada
          const entries = body.entry || [];
          for (const entry of entries) {
            const changes = entry.changes || [];
            for (const change of changes) {
              if (change.field !== 'messages') continue;

              const value = change.value;
              if (!value || !value.messages) continue;

              // Processar cada mensagem
              for (const message of value.messages) {
                // Usar waitUntil para não bloquear a resposta
                ctx.waitUntil(processMessage(message, env));
              }
            }
          }

          // Responder 200 imediatamente para o Meta
          return new Response('OK', { status: 200 });
        } catch (error) {
          console.error('Erro no webhook:', error);
          return new Response('Internal Server Error', { status: 500 });
        }
      }
    }

    // Rota para listar leads (protegida por token simples)
    if (url.pathname === '/leads' && request.method === 'GET') {
      const authToken = url.searchParams.get('token');
      if (authToken !== env.WHATSAPP_VERIFY_TOKEN) {
        return new Response('Unauthorized', { status: 401 });
      }

      // Listar leads do KV (limitação: KV não suporta list com prefixo facilmente no free tier)
      return new Response(JSON.stringify({
        message: 'Para consultar leads, acesse o dashboard do Cloudflare > Workers > KV',
        tip: 'Os leads são salvos com prefixo "lead:" no KV namespace CHAT_HISTORY',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
