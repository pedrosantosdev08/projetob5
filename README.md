# ⚽ Smart Sports — Gestão do Projeto Social B5

> Sistema web progressivo (PWA-ready), responsivo e mobile-first, desenvolvido para a gestão de atletas infantojuvenis, controle de treinos, chamadas de frequência em campo, empréstimo de materiais e relatórios de impacto social para o **Projeto B5**.

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Spark_Tier-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Contexto & Propósito

O **Projeto B5** é uma iniciativa social sem fins lucrativos que promove a inclusão social e o desenvolvimento esportivo de crianças e adolescentes através do futebol. O projeto atende jovens distribuídos em categorias de base (`Sub-8`, `Sub-10`, `Sub-12`, `Sub-14` e `Sub-16`).

O sistema **Smart Sports** foi projetado para substituir anotações em pranchetas de papel, garantindo agilidade no campo (mesmo com sinal de internet instável) e consolidando dados transparentes para parceiros, apoiadores e responsáveis.

### Contexto Acadêmico
Projeto desenvolvido no âmbito da disciplina de extensão universitária **APIExt III — UNINASSAU**, focado em aliar engenharia de software moderna, impacto comunitário, segurança por design e estrita conformidade com a **LGPD (Lei Geral de Proteção de Dados)**.

---

## 🚀 Funcionalidades Principais

| Módulo | Descrição |
|---|---|
| **🔒 Autenticação & Acesso Restrito** | Login seguro para o treinador. Allowlist por documento no Firestore (`coaches/{uid}`) impedindo cadastros públicos e acessos indevidos. |
| **👥 Gestão de Atletas (Jogadores)** | Cadastro completo com validação Zod (nome, nascimento, categoria, bairro, contato do responsável e termo de consentimento obrigatório). Cálculo automático de idade e inativação lógica (sem exclusão física). |
| **📋 Treinos & Chamada Rápida** | Registro de sessões de treino e interface de chamada rápida com botões de alta ergonomia móvel (alvos ≥ 44px), botão "Marcar todos presentes" e persistência atômica via `writeBatch`. |
| **📊 Histórico & Presença** | Histórico individual de presença nos perfis dos atletas com percentual acumulado, alertas visuais e paginação. |
| **📦 Materiais & Empréstimos** | Cadastro de materiais esportivos com controle em tempo real de estoque disponível. Empréstimos vinculados a atletas com transações atômicas (`runTransaction`), impedindo saldos negativos. |
| **📈 Dashboard & Alertas Operacionais** | Cards de indicadores gerais, taxa de frequência dos últimos 30 dias por categoria com gráficos em barras (Recharts lazy-loaded), **Alerta de Evasão** (3 faltas seguidas) e **Alerta de Material em Atraso** (> 7 dias). |
| **📑 Relatórios de Participação** | Tabela consolidada com filtros por categoria, status e período. Botão de impressão com CSS dedicado e exportação em CSV com blindagem contra **CSV/Formula Injection**. |

---

## 🛠️ Arquitetura e Stack Tecnológica

O sistema foi concebido como uma Single Page Application (SPA) modular e resiliente:

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict Mode, 0% de uso de `any`).
- **Build Tool:** [Vite](https://vitejs.dev/) com code splitting via `React.lazy` e `Suspense`.
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) com design mobile-first e temas neutros de alta legibilidade sob luz solar.
- **Roteamento:** [React Router v7](https://reactrouter.com/).
- **Validação:** [Zod v3](https://zod.dev/) e [React Hook Form](https://react-hook-form.com/).
- **Visualização de Dados:** [Recharts](https://recharts.org/) em chunk assíncrono.
- **Ícones:** [Lucide React](https://lucide.dev/).
- **Backend as a Service:** [Firebase](https://firebase.google.com/) (Modular SDK v11):
  - **Firebase Authentication:** Sessões de usuário autenticadas.
  - **Cloud Firestore:** Banco NoSQL com **cache offline persistente** (`persistentLocalCache` + `persistentMultipleTabManager`), permitindo uso no campo sem internet.
- **Segurança & Hospedagem:** [Vercel](https://vercel.com/) com `vercel.json` configurado com regras rígidas de **Content Security Policy (CSP)**, HSTS e frame sandboxing.

---

## 🔒 Segurança & Privacidade (LGPD)

O projeto segue rigorosamente o guia [`05-PERFORMANCE-E-SEGURANCA.md`](./docs/05-PERFORMANCE-E-SEGURANCA.md):

1. **Privacidade de Menores:** Não são coletados CPF, foto, biometria ou endereços completos das crianças. O consentimento do responsável legal é obrigatório (`guardianConsent: true`).
2. **Autorização Real no Banco:** As regras do [`firestore.rules`](./firestore.rules) negam leitura/escrita a qualquer usuário não listado na coleção `coaches`. Exclusões físicas (`delete`) são bloqueadas em todas as coleções.
3. **Proteção contra Injeção de CSV:** Na exportação de dados, qualquer célula contendo caracteres de gatilho (`=`, `+`, `-`, `@`, `\t`, `\r`) é prefixada com apóstrofo (`'`) para neutralizar execução de fórmulas maliciosas em softwares de planilha.
4. **Proteção XSS e Clickjacking:** Não há uso de `dangerouslySetInnerHTML`. Cabeçalhos `X-Content-Type-Options: nosniff` e `frame-ancestors 'none'` ativos.
5. **Restrição de Credenciais:** Chaves de API restritas via HTTP Referrer no Google Cloud Console para os domínios autorizados.

---

## 📁 Estrutura de Pastas

```text
projetob5/
├── docs/                      # Documentação de visão, requisitos, arquitetura e segurança
│   ├── 01-VISAO-GERAL.md
│   ├── 02-REQUISITOS.md
│   ├── 03-ARQUITETURA.md
│   ├── 04-PLANO-DE-TAREFAS.md
│   ├── 05-PERFORMANCE-E-SEGURANCA.md
│   └── 06-MANUAL-DO-USUARIO.md
├── src/
│   ├── app/                   # Shell da aplicação (Rotas, Layout e Navbar móvel)
│   ├── components/            # Design system base (Button, Card, Input, Modal, States)
│   ├── features/              # Módulos de domínio desacoplados
│   │   ├── auth/              # Login, contexto de autenticação e proteção de rotas
│   │   ├── dashboard/         # Métricas, cálculo de indicadores e gráfico de presença
│   │   ├── loans/             # Empréstimos e devoluções de material
│   │   ├── materials/         # Catálogo de materiais esportivos
│   │   ├── players/           # Cadastro, perfis e busca de atletas
│   │   ├── reports/           # Relatórios de presença, impressão e exportação CSV
│   │   └── trainings/         # Gestão de treinos e chamada de frequência
│   ├── lib/                   # Utilitários globais (Firebase, Datas, Constantes, Resolvers)
│   ├── types/                 # Tipos genéricos do TypeScript
│   └── main.tsx               # Ponto de entrada do React
├── firestore.rules            # Regras declarativas de segurança do Firestore
├── vercel.json                # Configuração de SPA rewrites e Security Headers (CSP)
├── vite.config.ts             # Configuração do Vite e plugins
└── package.json
```

---

## 💻 Instalação & Execução Local

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- Gerenciador de pacotes `npm`.
- Projeto configurado no [Firebase Console](https://console.firebase.google.com/) com Authentication (E-mail/Senha) e Firestore ativados.

### 1. Clonar o repositório
```bash
git clone https://github.com/pedrosantosdev08/projetob5.git
cd projetob5
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Copie o modelo de variáveis de ambiente:
```bash
cp .env.example .env
```
Abra o arquivo `.env` e preencha com as credenciais obtidas no Firebase Console (*Project Settings → General → Your apps*):
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 4. Rodar o servidor de desenvolvimento
```bash
npm run dev
```
O sistema estará disponível em [http://localhost:5173](http://localhost:5173).

### 5. Checagem de tipagem e build
```bash
npm run typecheck
npm run build
```

---

## ☁️ Guia de Publicação (Deploy na Vercel)

1. Faça um fork ou conecte o repositório no seu dashboard da **[Vercel](https://vercel.com/)**.
2. Na etapa de importação, expanda **Environment Variables** e cadastre as 6 chaves `VITE_FIREBASE_*` do seu `.env`.
3. Conclua o deploy.
4. Após obter a URL da Vercel (ex: `https://projetob5.vercel.app`):
   - Vá ao **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**.
   - Adicione o domínio da Vercel para autorizar o login.
   - No **Google Cloud Console**, restrinja sua chave de API para aceitar apenas os domínios do app.

---

## 👥 Equipe & Contribuição

Projeto idealizado e desenvolvido para o **Projeto B5** — UNINASSAU (APIExt III).

- **Desenvolvedor:** [@pedrosantosdev08](https://github.com/pedrosantosdev08)
- **Orientação:** Coordenação de Extensão Universitária

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
