/**
 * Módulo de integração com a WhatsApp Cloud API (Meta)
 * Gerencia envio e recebimento de mensagens
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

/**
 * Envia uma mensagem de texto via WhatsApp Cloud API
 */
export async function sendTextMessage(phoneNumberId, token, to, message) {
  // WhatsApp tem limite de ~4096 caracteres por mensagem
  // Dividimos mensagens longas em partes
  const maxLength = 4000;
  const parts = splitMessage(message, maxLength);

  for (const part of parts) {
    const url = `${WHATSAPP_API_URL}/${phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: part
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`WhatsApp API error: ${response.status} - ${errorBody}`);
      throw new Error(`WhatsApp send message failed: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Message sent to ${to}: ${result.messages?.[0]?.id}`);

    // Pequeno delay entre mensagens múltiplas para manter a ordem
    if (parts.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

/**
 * Marca uma mensagem como lida (blue ticks)
 */
export async function markAsRead(phoneNumberId, token, messageId) {
  const url = `${WHATSAPP_API_URL}/${phoneNumberId}/messages`;
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      })
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

/**
 * Envia indicador de "digitando..." (não disponível na Cloud API padrão)
 * Alternativa: enviar reação de relógio e remover depois
 */
export async function sendReaction(phoneNumberId, token, to, messageId, emoji) {
  const url = `${WHATSAPP_API_URL}/${phoneNumberId}/messages`;
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'reaction',
        reaction: {
          message_id: messageId,
          emoji: emoji
        }
      })
    });
  } catch (error) {
    console.error('Error sending reaction:', error);
  }
}

/**
 * Remove reação de uma mensagem
 */
export async function removeReaction(phoneNumberId, token, to, messageId) {
  const url = `${WHATSAPP_API_URL}/${phoneNumberId}/messages`;
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'reaction',
        reaction: {
          message_id: messageId,
          emoji: ''
        }
      })
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
  }
}

/**
 * Extrai dados da mensagem recebida do webhook
 */
export function parseWebhookMessage(body) {
  try {
    if (body.object !== 'whatsapp_business_account') {
      return null;
    }

    const entry = body.entry?.[0];
    if (!entry) return null;

    const change = entry.changes?.[0];
    if (!change || change.field !== 'messages') return null;

    const value = change.value;
    if (!value) return null;

    // Extrai metadados do número de telefone do business
    const metadata = value.metadata;
    const phoneNumberId = metadata?.phone_number_id;

    // Verifica se há mensagens (pode ser apenas status update)
    const messages = value.messages;
    if (!messages || messages.length === 0) {
      // Pode ser uma atualização de status (delivered, read, etc.)
      const statuses = value.statuses;
      if (statuses) {
        return {
          type: 'status',
          phoneNumberId,
          statuses
        };
      }
      return null;
    }

    const message = messages[0];
    const contact = value.contacts?.[0];

    return {
      type: 'message',
      phoneNumberId,
      from: message.from,
      messageId: message.id,
      timestamp: message.timestamp,
      messageType: message.type,
      contactName: contact?.profile?.name || 'Desconhecido',
      // Extrai o texto dependendo do tipo de mensagem
      text: extractMessageText(message),
      rawMessage: message
    };
  } catch (error) {
    console.error('Error parsing webhook message:', error);
    return null;
  }
}

/**
 * Extrai texto de diferentes tipos de mensagem
 */
function extractMessageText(message) {
  switch (message.type) {
    case 'text':
      return message.text?.body || '';
    case 'image':
      return message.image?.caption || '[Imagem recebida]';
    case 'document':
      return message.document?.caption || `[Documento: ${message.document?.filename || 'sem nome'}]`;
    case 'audio':
      return '[Áudio recebido - por favor, envie sua dúvida por texto]';
    case 'video':
      return message.video?.caption || '[Vídeo recebido]';
    case 'sticker':
      return '[Sticker recebido]';
    case 'location':
      return `[Localização: ${message.location?.latitude}, ${message.location?.longitude}]`;
    case 'contacts':
      return '[Contato compartilhado]';
    case 'interactive':
      // Respostas de botões ou listas
      if (message.interactive?.type === 'button_reply') {
        return message.interactive.button_reply?.title || '';
      }
      if (message.interactive?.type === 'list_reply') {
        return message.interactive.list_reply?.title || '';
      }
      return '[Resposta interativa]';
    default:
      return `[Tipo de mensagem não suportado: ${message.type}]`;
  }
}

/**
 * Divide mensagem longa em partes menores
 */
function splitMessage(message, maxLength) {
  if (message.length <= maxLength) {
    return [message];
  }

  const parts = [];
  let remaining = message;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      parts.push(remaining);
      break;
    }

    // Tenta quebrar em uma quebra de linha ou espaço
    let splitIndex = remaining.lastIndexOf('\n', maxLength);
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      splitIndex = remaining.lastIndexOf(' ', maxLength);
    }
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      splitIndex = maxLength;
    }

    parts.push(remaining.substring(0, splitIndex));
    remaining = remaining.substring(splitIndex).trimStart();
  }

  return parts;
}
