/**
 * Script de teste local para o chatbot
 * Simula payloads do webhook da WhatsApp Cloud API
 * 
 * Uso: node test/test-local.js [url_base]
 * Padrão: http://localhost:8787
 */

const BASE_URL = process.argv[2] || 'http://localhost:8787';

// Payload de exemplo: verificação do webhook
const verifyPayload = {
  'hub.mode': 'subscribe',
  'hub.verify_token': 'pedro-tiago-contabilidade-2024',
  'hub.challenge': '1234567890'
};

// Payload de exemplo: mensagem de texto recebida
const messagePayload = {
  object: 'whatsapp_business_account',
  entry: [{
    id: '123456789',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: {
          display_phone_number: '5562999999999',
          phone_number_id: '123456789'
        },
        contacts: [{
          profile: { name: 'Cliente Teste' },
          wa_id: '5562988888888'
        }],
        messages: [{
          from: '5562988888888',
          id: 'wamid.test123',
          timestamp: String(Math.floor(Date.now() / 1000)),
          text: { body: 'Olá, preciso abrir um MEI. Quais são os documentos necessários?' },
          type: 'text'
        }]
      },
      field: 'messages'
    }]
  }]
};

// Payload de exemplo: status update (não deve gerar resposta)
const statusPayload = {
  object: 'whatsapp_business_account',
  entry: [{
    id: '123456789',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: {
          display_phone_number: '5562999999999',
          phone_number_id: '123456789'
        },
        statuses: [{
          id: 'wamid.test456',
          status: 'delivered',
          timestamp: String(Math.floor(Date.now() / 1000)),
          recipient_id: '5562988888888'
        }]
      },
      field: 'messages'
    }]
  }]
};

async function runTests() {
  console.log('=== Testes do WhatsApp Chatbot - Pedro Tiago Contabilidade ===\n');
  console.log(`URL Base: ${BASE_URL}\n`);

  // Teste 1: Health Check
  console.log('--- Teste 1: Health Check ---');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    console.log(res.status === 200 || res.status === 503 ? '✅ PASS' : '❌ FAIL');
  } catch (e) {
    console.log(`❌ FAIL: ${e.message}`);
  }
  console.log();

  // Teste 2: Verificação do Webhook
  console.log('--- Teste 2: Webhook Verification ---');
  try {
    const params = new URLSearchParams(verifyPayload);
    const res = await fetch(`${BASE_URL}/webhook?${params}`);
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Challenge response: ${text}`);
    console.log(text === '1234567890' ? '✅ PASS' : '❌ FAIL');
  } catch (e) {
    console.log(`❌ FAIL: ${e.message}`);
  }
  console.log();

  // Teste 3: Verificação com token errado
  console.log('--- Teste 3: Webhook Verification (token inválido) ---');
  try {
    const params = new URLSearchParams({
      ...verifyPayload,
      'hub.verify_token': 'token-errado'
    });
    const res = await fetch(`${BASE_URL}/webhook?${params}`);
    console.log(`Status: ${res.status}`);
    console.log(res.status === 403 ? '✅ PASS' : '❌ FAIL');
  } catch (e) {
    console.log(`❌ FAIL: ${e.message}`);
  }
  console.log();

  // Teste 4: Mensagem recebida
  console.log('--- Teste 4: Webhook Message (POST) ---');
  try {
    const res = await fetch(`${BASE_URL}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messagePayload)
    });
    console.log(`Status: ${res.status}`);
    console.log(res.status === 200 ? '✅ PASS (resposta 200 imediata)' : '❌ FAIL');
    console.log('Nota: O processamento real acontece em background');
  } catch (e) {
    console.log(`❌ FAIL: ${e.message}`);
  }
  console.log();

  // Teste 5: Status update (deve ser ignorado)
  console.log('--- Teste 5: Status Update (deve ser ignorado) ---');
  try {
    const res = await fetch(`${BASE_URL}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusPayload)
    });
    console.log(`Status: ${res.status}`);
    console.log(res.status === 200 ? '✅ PASS' : '❌ FAIL');
  } catch (e) {
    console.log(`❌ FAIL: ${e.message}`);
  }
  console.log();

  // Teste 6: Página raiz
  console.log('--- Teste 6: Root endpoint ---');
  try {
    const res = await fetch(`${BASE_URL}/`);
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Service: ${data.service}`);
    console.log(data.service.includes('Pedro Tiago') ? '✅ PASS' : '❌ FAIL');
  } catch (e) {
    console.log(`❌ FAIL: ${e.message}`);
  }
  console.log();

  console.log('=== Testes concluídos ===');
}

runTests().catch(console.error);
