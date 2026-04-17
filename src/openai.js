/**
 * Módulo de integração com a API da OpenAI
 * Gerencia conversas com contexto e chamadas ao GPT
 */

import { SYSTEM_PROMPT, TRIAGE_PROMPT } from './system-prompt.js';

/**
 * Armazena histórico de conversas em memória (por sessão do Worker)
 * Em produção, considerar usar Cloudflare KV ou D1 para persistência
 */
const conversationHistory = new Map();

const MAX_HISTORY_MESSAGES = 20; // Máximo de mensagens no histórico por usuário
const HISTORY_TTL = 3600000; // 1 hora em ms - após isso, limpa o histórico

/**
 * Obtém ou cria o histórico de conversa de um usuário
 */
function getConversationHistory(userId) {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, {
      messages: [],
      lastActivity: Date.now(),
      isNewContact: true,
      contactInfo: {}
    });
  }
  
  const history = conversationHistory.get(userId);
  
  // Limpa histórico se expirou
  if (Date.now() - history.lastActivity > HISTORY_TTL) {
    history.messages = [];
    history.isNewContact = true;
  }
  
  history.lastActivity = Date.now();
  return history;
}

/**
 * Adiciona mensagem ao histórico, mantendo o limite
 */
function addToHistory(userId, role, content) {
  const history = getConversationHistory(userId);
  history.messages.push({ role, content });
  
  // Mantém apenas as últimas N mensagens
  if (history.messages.length > MAX_HISTORY_MESSAGES) {
    history.messages = history.messages.slice(-MAX_HISTORY_MESSAGES);
  }
}

/**
 * Faz a triagem da mensagem para classificação
 */
async function triageMessage(apiKey, apiBase, message) {
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
          { role: 'system', content: TRIAGE_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      console.error('Triage API error:', response.status);
      return null;
    }

    const data = await response.json();
    const triageText = data.choices?.[0]?.message?.content;
    
    try {
      return JSON.parse(triageText);
    } catch {
      return null;
    }
  } catch (error) {
    console.error('Triage error:', error);
    return null;
  }
}

/**
 * Gera resposta do assistente usando OpenAI
 */
export async function generateResponse(apiKey, apiBase, userId, userName, userMessage) {
  const history = getConversationHistory(userId);
  
  // Adiciona contexto do usuário ao sistema
  let contextualSystemPrompt = SYSTEM_PROMPT;
  if (userName) {
    contextualSystemPrompt += `\n\nO nome do contato atual é: ${userName}`;
  }
  if (history.isNewContact) {
    contextualSystemPrompt += `\nEste é um NOVO contato. Faça a triagem e dê boas-vindas.`;
    history.isNewContact = false;
  }

  // Adiciona mensagem do usuário ao histórico
  addToHistory(userId, 'user', userMessage);

  // Faz triagem em paralelo (não bloqueia a resposta principal)
  const triagePromise = triageMessage(apiKey, apiBase, userMessage);

  // Monta mensagens para a API
  const messages = [
    { role: 'system', content: contextualSystemPrompt },
    ...history.messages
  ];

  try {
    const baseUrl = apiBase || 'https://api.openai.com';
    
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorBody}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('Empty response from OpenAI');
    }

    // Adiciona resposta do assistente ao histórico
    addToHistory(userId, 'assistant', assistantMessage);

    // Aguarda triagem (para logging/analytics)
    const triage = await triagePromise;
    if (triage) {
      console.log(`[TRIAGE] User: ${userId}, Type: ${triage.TIPO}, Subject: ${triage.ASSUNTO}, Sentiment: ${triage.SENTIMENTO}`);
    }

    return assistantMessage;

  } catch (error) {
    console.error('Error generating response:', error);
    return 'Desculpe, estou com uma dificuldade técnica no momento. Por favor, entre em contato diretamente com o Pedro pelo telefone ou tente novamente em alguns minutos. 🙏';
  }
}

/**
 * Limpa histórico de um usuário específico
 */
export function clearHistory(userId) {
  conversationHistory.delete(userId);
}

/**
 * Retorna estatísticas do cache de conversas
 */
export function getStats() {
  return {
    activeConversations: conversationHistory.size,
    conversations: Array.from(conversationHistory.entries()).map(([id, data]) => ({
      userId: id.slice(-4), // Últimos 4 dígitos para privacidade
      messageCount: data.messages.length,
      lastActivity: new Date(data.lastActivity).toISOString()
    }))
  };
}
