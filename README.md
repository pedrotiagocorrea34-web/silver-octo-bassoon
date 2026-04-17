# Assistente Virtual WhatsApp - Pedro Tiago Contabilidade

Este projeto implementa um assistente virtual para o WhatsApp Business do escritório de contabilidade do Pedro Tiago (Goiânia-GO). O sistema utiliza a **WhatsApp Cloud API** oficial da Meta integrada com a **OpenAI API** (GPT-4o-mini) para responder dúvidas frequentes, fazer triagem de contatos e agendar reuniões.

A infraestrutura é baseada em **Cloudflare Workers**, garantindo alta disponibilidade, baixa latência e custo zero (dentro do plano gratuito da Cloudflare).

---

## 📋 Arquitetura do Sistema

O fluxo de funcionamento do assistente virtual segue os seguintes passos:

1. O cliente envia uma mensagem para o número de WhatsApp Business do Pedro.
2. A Meta (WhatsApp Cloud API) envia um POST request (Webhook) para o Cloudflare Worker.
3. O Worker recebe a mensagem, marca como lida e envia um indicador de "processando" (⏳).
4. O Worker envia o histórico da conversa e o prompt do sistema para a OpenAI API.
5. A OpenAI gera a resposta baseada no conhecimento contábil configurado.
6. O Worker envia a resposta de volta para o cliente via WhatsApp Cloud API.

---

## 🚀 Guia de Configuração Passo a Passo

O código já está publicado na Cloudflare. Para que o assistente comece a funcionar no seu WhatsApp, você precisa realizar as configurações manuais na plataforma da Meta (Facebook).

### Passo 1: Criar o App na Meta for Developers

1. Acesse o [Meta for Developers](https://developers.facebook.com/) e faça login com sua conta do Facebook.
2. Clique em **Meus Aplicativos** e depois em **Criar Aplicativo**.
3. Selecione **Outro** como tipo de aplicativo e clique em Avançar.
4. Selecione **Empresa** e clique em Avançar.
5. Dê um nome ao aplicativo (ex: "Assistente Pedro Tiago") e adicione seu e-mail de contato.
6. Selecione sua Conta Empresarial (Business Manager) e clique em Criar Aplicativo.

### Passo 2: Configurar o WhatsApp Cloud API

1. No painel do seu novo aplicativo, role para baixo até encontrar **WhatsApp** e clique em **Configurar**.
2. No menu lateral esquerdo, vá em **WhatsApp > Configuração da API**.
3. Você verá um **Token de Acesso Temporário** (válido por 24h) e um **ID do Número de Telefone**.
4. Para gerar um token permanente (necessário para produção):
   - Vá em **Configurações do Negócio** (Business Manager).
   - Em **Usuários > Usuários do Sistema**, adicione um novo usuário do sistema.
   - Atribua os ativos (seu app) a este usuário.
   - Gere um novo token selecionando as permissões `whatsapp_business_messaging` e `whatsapp_business_management`.

### Passo 3: Configurar o Webhook

1. No painel do aplicativo, vá em **WhatsApp > Configuração**.
2. Na seção Webhook, clique em **Editar**.
3. Preencha os campos com os seguintes dados:
   - **URL de Retorno (Callback URL)**: `https://whatsapp-chatbot-pedro.escrituras-sagradas-tts.workers.dev/webhook`
   - **Token de Verificação (Verify Token)**: `pedro-tiago-contabilidade-2024`
4. Clique em **Verificar e Salvar**. A Meta fará um teste e deve aprovar imediatamente.
5. Após salvar, clique em **Gerenciar** (abaixo de Webhook fields) e marque a caixa **messages** para assinar os eventos de mensagens recebidas.

### Passo 4: Adicionar seu Número Real

1. Por padrão, a Meta fornece um número de teste. Para usar seu número real:
2. Vá em **WhatsApp > Configuração da API**.
3. Role até a seção "Etapa 5: Adicionar um número de telefone" e clique no botão para adicionar.
4. Siga as instruções para verificar seu número (você receberá um SMS ou ligação).
   - *Atenção: O número não pode estar ativo no aplicativo WhatsApp normal ou WhatsApp Business no celular durante este processo. Você precisará excluir a conta do app antes de vinculá-la à API.*

### Passo 5: Inserir os Secrets na Cloudflare

O Worker já está rodando, mas precisa do seu Token do WhatsApp e do ID do Número. Como não tenho acesso à sua conta Cloudflare, você precisará inserir esses dados.

Se você tiver o [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) instalado no seu computador, execute:

```bash
npx wrangler secret put WHATSAPP_TOKEN
# Cole o token permanente gerado no Passo 2

npx wrangler secret put WHATSAPP_PHONE_NUMBER_ID
# Cole o ID do Número de Telefone obtido no Passo 2
```

Alternativamente, você pode fazer isso pelo painel web da Cloudflare:
1. Acesse o painel da Cloudflare > Workers & Pages.
2. Clique no worker `whatsapp-chatbot-pedro`.
3. Vá em **Settings > Variables**.
4. Em **Environment Variables**, adicione as variáveis `WHATSAPP_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID` (marque a opção "Encrypt" para mantê-las seguras).

---

## 🧠 Personalização do Assistente

O comportamento, tom de voz e conhecimento do assistente são definidos no arquivo `src/system-prompt.js`. 

Atualmente, ele está configurado para:
- Atender como assistente do Pedro Tiago Contabilidade (Goiânia-GO).
- Responder dúvidas sobre emissão de notas fiscais, prazos do Simples Nacional, abertura de MEI/Empresa, Imposto de Renda e regularização fiscal.
- Fazer triagem de contatos (identificando se é cliente ou novo lead).
- Agendar reuniões (presenciais ou online).
- Manter um tom profissional, acessível e objetivo.

Para alterar o comportamento, basta editar o arquivo `src/system-prompt.js` e fazer um novo deploy.

---

## 🛠️ Desenvolvimento Local

Para testar modificações localmente antes de enviar para produção:

1. Clone o repositório.
2. Instale as dependências: `npm install`
3. Copie o arquivo `.dev.vars.example` para `.dev.vars` e preencha com seus dados reais.
4. Execute o servidor local: `npm run dev`
5. Para testar o webhook localmente, você pode usar o script de teste: `npm run test`

Para fazer o deploy de atualizações:
```bash
npm run deploy
```

---

## 📊 Monitoramento

Você pode verificar o status do sistema acessando:
`https://whatsapp-chatbot-pedro.escrituras-sagradas-tts.workers.dev/health`

Para ver os logs em tempo real (útil para debugar problemas):
```bash
npm run tail
```
