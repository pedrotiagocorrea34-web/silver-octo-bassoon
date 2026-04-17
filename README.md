# Chatbot WhatsApp com IA - Pedro Tiago Contabilidade

Assistente virtual inteligente para atendimento automatizado de clientes via WhatsApp Business, desenvolvido com **Cloudflare Workers**, **WhatsApp Cloud API** e **OpenAI GPT-4o-mini**.

## Funcionalidades

- Responde duvidas frequentes sobre contabilidade (MEI, Simples Nacional, IRPF, NF, abertura de empresa)
- Faz triagem de contatos (cliente novo vs existente)
- Coleta informacoes basicas do cliente (nome, CPF/CNPJ, servico desejado)
- Agenda reunioes/consultas
- Informa servicos oferecidos e valores base
- Mantem historico de conversa por usuario (Cloudflare KV)

## Arquitetura

```
Cliente WhatsApp -> Meta Cloud API -> Cloudflare Worker -> OpenAI API
                                          |
                                    Cloudflare KV
                                  (historico de conversas)
```

## Configuracao

### Variaveis de Ambiente (Secrets no Cloudflare)

| Variavel | Descricao |
|---|---|
| `OPENAI_API_KEY` | Chave API da OpenAI |
| `WHATSAPP_TOKEN` | Token de acesso do WhatsApp Cloud API |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do numero de telefone do WhatsApp Business |
| `WHATSAPP_VERIFY_TOKEN` | Token de verificacao do webhook (voce define) |

### Deploy

```bash
npm install
npx wrangler deploy
```

### Webhook URL

```
https://whatsapp-chatbot-pedro.escrituras-sagradas-tts.workers.dev/webhook
```

## Custos

- **Cloudflare Workers:** Gratuito ate 100.000 requisicoes/dia
- **Cloudflare KV:** Gratuito ate 100.000 leituras/dia
- **WhatsApp Cloud API:** 1.000 conversas de servico gratuitas/mes
- **OpenAI GPT-4o-mini:** ~$0.15 por 1M tokens de entrada

## Licenca

Privado - Pedro Tiago Contabilidade