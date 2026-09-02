# 🚀 Brotherhood — Autoajuda Masculina Anônima

O **Brotherhood** é um ecossistema mobile e focado em acolhimento e suporte emocional masculino. O projeto foi projetado sob estritas regras de **anonimato e privacidade**, permitindo que homens compartilhem desabafos cotidianos, fragilidades e desafios de carreira de forma 100% segura, contando com uma rede de apoio direta através de canais de texto privados em tempo real.

---

## 🛡️ Core UX & Regras de Negócio de Impacto

- **Identidade Blindada:** E-mails e senhas servem estritamente para autenticação de segurança. Dentro do ecossistema, o único rastro visível do usuário é o seu `nickname` único e gerado de forma anônima.
- **Feed Isolado por Tópicos:** Os desabafos são organizados por categorias (`Depressão`, `Serviço/Carreira`, `Ansiedade`, `Outros`) através de um carrossel responsivo de tags.
- **Apoio Privado Unilateral:** Qualquer leitor pode iniciar uma conversa direta com o autor de um desabafo. Para mitigar assédios e spam, o autor do post original é bloqueado de abrir um chat consigo mesmo.
- **Anonimato Cruzado no Direct:** Na caixa de entrada, a API chaveia as identidades dinamicamente. Se você é o leitor, vê o autor; se você é o autor, vê o participante que te chamou, ocultando cruzamentos de dados reais.
- **Tempo Real Nativo:** A troca de mensagens opera através de conexões de WebSockets bidirecionais isoladas por IDs de salas de chat.
- **Compliance Estrito (LGPD/Apple/Google):** Inclusão de fluxo nativo para exclusão permanente de conta com limpeza em efeito cascata no banco de dados.

---

## 🛠️ Stack Tecnológica & Arquitetura Comercial

### 💻 Backend (`brotherhood-back`)
- **Node.js** com **TypeScript** para um ambiente tipado e resiliente.
- **Express** estruturado em arquitetura baseada em rotas e controladores modulares.
- **Prisma ORM** integrado ao banco de dados relacional **PostgreSQL** (rodando em ambiente conteinerizado via **Docker**).
- Autenticação e integridade via **JWT (JSON Web Tokens)** e criptografia de senhas com **Bcrypt**.
- Comunicação bidirecional e eventos orientados através de **Socket.io**.

### 📱 Frontend Mobile (`brotherhood-app`)
- **React Native** com **Expo SDK 54** utilizando a estrutura moderna de roteamento **Expo Router (File-based)**.
- Consumo HTTP e interceptores dinâmicos de cabeçalhos com **Axios**.
- Estado global e controle de gateway automático gerenciados por **React Context API**.
- Persistência criptografada local nativa usando **Expo Secure Store**.
- Layout responsivo universal e calibrado para resoluções **Android, iOS e Web**.

---

## ⚙️ Como Executar o Ecossistema Localmente

### 1. Preparação da Infraestrutura (Banco de Dados)
Certifique-se de possuir o Docker ativo e execute o contêiner do banco relacional:
```bash
docker start seven_d_postgres
```

### 2. Inicialização do Servidor API
Entre no diretório do servidor, instale os pacotes e inicialize o ambiente:
```bash
cd brotherhood-back
npm install
npx prisma db push
npm run dev
```
*O console confirmará o start: `🚀 Brotherhood Backend rodando com WebSockets na porta 3334!`*

### 3. Inicialização do Aplicativo Mobile
Entre no diretório do aplicativo, configure o IP local da sua máquina no arquivo de serviços e dispare o chassi:
```bash
cd brotherhood-app
npm install
npm run start
```
*Aperte `a` para emular no Android, `i` para o iOS ou escaneie o QR Code direto no aplicativo **Expo Go** do seu smartphone.*
