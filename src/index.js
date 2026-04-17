/**
 * WhatsApp Chatbot - Pedro Tiago Contabilidade
 * Cloudflare Worker que atua como webhook para WhatsApp Cloud API
 * e integra com OpenAI para respostas inteligentes.
 * 
 * Autor: Pedro Tiago
 * Versão: 1.0.0
 */

import { generateResponse, getStats, clearHistory } from './openai.js';
import { 
  sendTextMessage, 
  markAsRead, 
  sendReaction, 
  removeReaction, 
  parseWebhookMessage 
} from './whatsapp.js';

// Set para rastrear mensagens já processadas (evita duplicatas)
const processedMessages = new Set();
const MAX_PROCESSED_CACHE = 1000;

/**
 * Handler principal do Cloudflare Worker
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Roteamento
    switch (path) {
      case '/webhook':
      case '/webhook/':
        if (request.method === 'GET') {
          return handleWebhookVerification(url, env);
        }
        if (request.method === 'POST') {
          return handleWebhookMessage(request, env, ctx);
        }
        return new Response('Method not allowed', { status: 405 });

      case '/health':
      case '/health/':
        return handleHealthCheck(env);

      case '/stats':
      case '/stats/':
        return handleStats(request, env);

      case '/':
        return new Response(JSON.stringify({
          service: 'WhatsApp Chatbot - Pedro Tiago Contabilidade',
          status: 'online',
          version: '1.0.0',
          endpoints: {
            webhook: '/webhook',
            health: '/health',
            stats: '/stats'
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response('Not found', { status: 404 });
    }
  }
};

/**
 * Verificação do webhook (GET)
 * Meta envia um GET request para verificar o endpoint
 */
function handleWebhookVerification(url, env) {
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  console.log(`[VERIFY] mode=${mode}, token=${token ? '***' : 'null'}, challenge=${challenge}`);

  if (mode === 'subscribe' && token === env.WEBHOOK_VERIFY_TOKEN) {
    console.log('[VERIFY] Webhook verified successfully!');
    return new Response(challenge, { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  console.error('[VERIFY] Webhook verification failed!');
  return new Response('Forbidden', { status: 403 });
}

/**
 * Processa mensagens recebidas do webhook (POST)
 */
async function handleWebhookMessage(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error('Invalid JSON body:', error);
    return new Response('Bad request', { status: 400 });
  }

  // Responde imediatamente com 200 (requisito da Meta)
  // O processamento real acontece em background via ctx.waitUntil
  ctx.waitUntil(processMessage(body, env));

  return new Response('OK', { status: 200 });
}

/**
 * Processamento assíncrono da mensagem
 */
async function processMessage(body, env) {
  try {
    const parsed = parseWebhookMessage(body);
    
    if (!parsed) {
      console.log('[WEBHOOK] No actionable message in payload');
      return;
    }

    // Ignora atualizações de status (delivered, read, etc.)
    if (parsed.type === 'status') {
      console.log('[WEBHOOK] Status update received, ignoring');
      return;
    }

    if (parsed.type !== 'message') {
      return;
    }

    const { from, messageId, contactName, text, messageType, phoneNumberId } = parsed;

    // Evita processar mensagens duplicadas
    if (processedMessages.has(messageId)) {
      console.log(`[WEBHOOK] Duplicate message ${messageId}, skipping`);
      return;
    }
    processedMessages.add(messageId);
    
    // Limpa cache de mensagens processadas se ficar muito grande
    if (processedMessages.size > MAX_PROCESSED_CACHE) {
      const entries = Array.from(processedMessages);
      entries.slice(0, entries.length - MAX_PROCESSED_CACHE / 2).forEach(id => {
        processedMessages.delete(id);
      });
    }

    console.log(`[MESSAGE] From: ${from} (${contactName}), Type: ${messageType}, Text: ${text?.substring(0, 100)}`);

    // Usa o phone_number_id do env (configurado) ou do webhook
    const whatsappPhoneId = env.WHATSAPP_PHONE_NUMBER_ID || phoneNumberId;

    // Marca mensagem como lida
    await markAsRead(whatsappPhoneId, env.WHATSAPP_TOKEN, messageId);

    // Envia reação de "processando" (emoji de relógio)
    await sendReaction(whatsappPhoneId, env.WHATSAPP_TOKEN, from, messageId, '⏳');

    // Para tipos não-texto, informa que só processa texto
    if (messageType !== 'text' && messageType !== 'interactive') {
      const nonTextReply = `Olá ${contactName}! No momento, consigo processar apenas mensagens de texto. Por favor, envie sua dúvida por escrito que terei prazer em ajudar! 😊`;
      await sendTextMessage(whatsappPhoneId, env.WHATSAPP_TOKEN, from, nonTextReply);
      await removeReaction(whatsappPhoneId, env.WHATSAPP_TOKEN, from, messageId);
      return;
    }

    // Gera resposta via OpenAI
    const apiBase = env.OPENAI_API_BASE || 'https://api.openai.com';
    const response = await generateResponse(
      env.OPENAI_API_KEY,
      apiBase,
      from,
      contactName,
      text
    );

    // Remove reação de "processando"
    await removeReaction(whatsappPhoneId, env.WHATSAPP_TOKEN, from, messageId);

    // Envia resposta
    await sendTextMessage(whatsappPhoneId, env.WHATSAPP_TOKEN, from, response);

    console.log(`[REPLY] Sent response to ${from} (${response.length} chars)`);

  } catch (error) {
    console.error('[ERROR] Processing message:', error);
  }
}

/**
 * Endpoint de health check
 */
function handleHealthCheck(env) {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: {
      openai_key: env.OPENAI_API_KEY ? 'configured' : 'MISSING',
      whatsapp_token: env.WHATSAPP_TOKEN ? 'configured' : 'MISSING',
      whatsapp_phone_id: env.WHATSAPP_PHONE_NUMBER_ID ? 'configured' : 'MISSING',
      webhook_verify_token: env.WEBHOOK_VERIFY_TOKEN ? 'configured' : 'MISSING'
    }
  };

  const allConfigured = Object.values(checks.config).every(v => v === 'configured');
  checks.status = allConfigured ? 'healthy' : 'degraded';

  return new Response(JSON.stringify(checks, null, 2), {
    status: allConfigured ? 200 : 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Endpoint de estatísticas (protegido por token)
 */
function handleStats(request, env) {
  // Proteção simples por query param
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  if (token !== env.WEBHOOK_VERIFY_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stats = getStats();
  return new Response(JSON.stringify(stats, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
