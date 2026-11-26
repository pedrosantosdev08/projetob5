# 04 · Plano de tarefas — Smart Sports (vibe coding)

Prazo: **sexta, 27/11/2026**. Hoje é quarta (25/11). Reunião com o treinador: quinta (26/11).

## Como usar com o Antigravity
1. Crie o repositório e coloque estes arquivos em `/docs`.
2. Cole o **prompt mestre** abaixo no início da sessão.
3. Mande **uma tarefa por vez**. Teste no navegador antes de passar para a próxima.
4. Faça um commit a cada tarefa concluída.

## Prompt mestre (cole primeiro)
```
Você vai me ajudar a construir o MVP do "Smart Sports", um sistema web de gestão
para um projeto social de futebol infantil. Antes de qualquer tarefa, leia todos
os arquivos em /docs (01-VISAO-GERAL, 02-REQUISITOS, 03-ARQUITETURA,
05-PERFORMANCE-E-SEGURANCA).

Regras:
- Stack: React + TypeScript + Vite + Tailwind + Firebase (Auth + Firestore).
- Mobile-first, textos de interface em português do Brasil.
- Siga a estrutura de pastas e o modelo de dados de 03-ARQUITETURA.
- Componentes não acessam o Firestore direto: use service/hooks por feature.
- Valide formulários com Zod. TypeScript estrito, sem any.
- Toda lista e ação tem estado de carregando, vazio e erro.
- Siga as regras de segurança e performance de 05. Nunca coloque segredos no código.
- Não instale dependências fora da stack sem me perguntar.
- Faça só a tarefa que eu pedir, explique o que mudou em poucas linhas e diga como testar.
```

---

## Quarta à noite — fundação (meta: login + jogadores)

### T01 · Setup do projeto
```
Crie o projeto Vite + React + TypeScript com Tailwind, React Router, Firebase,
Zod, React Hook Form, Recharts e lucide-react. Monte a estrutura de pastas de
03-ARQUITETURA, o lib/firebase.ts com cache offline, o lib/constants.ts
(categorias, ABSENCE_ALERT_STREAK=3, LOAN_ALERT_DAYS=7) e um .env.example.
Crie um layout mobile-first com navegação inferior (Dashboard, Jogadores,
Treinos, Materiais, Empréstimos).
```
**Pronto quando:** `npm run dev` abre o layout com navegação entre páginas vazias.

### T02 · Autenticação
```
Implemente login com e-mail e senha (Firebase Auth), AuthProvider,
ProtectedRoute e logout. Após logar, verifique se existe o documento
coaches/{uid}; se não existir, deslogue o usuário e mostre "sem permissão".
Não crie tela de cadastro.
```
**Pronto quando:** só o treinador entra; qualquer outra conta vê "sem permissão".
> Antes: no console do Firebase, crie o usuário do treinador e o documento `coaches/{uid}`.

### T03 · Regras do Firestore
```
Crie o firestore.rules conforme 05-PERFORMANCE-E-SEGURANCA (acesso só para
coaches, validação básica, sem delete, negar o resto).
```
**Pronto quando:** regras publicadas e testadas (conta sem `coaches` não lê nada).

### T04 · Jogadores (CRUD)
```
Implemente o módulo players: lista com busca e filtro por categoria, formulário
de cadastro/edição (campos do RF02, com Zod), inativar/reativar (sem apagar) e
página de perfil básica. Faça service e hooks. Mostre idade calculada a partir
da data de nascimento.
```
**Pronto quando:** cadastra, edita, busca e inativa um jogador.

---

## Quinta — núcleo do produto (reunião com o treinador no meio)

> Depois da reunião, ajuste `02-REQUISITOS.md` (categorias, limites de alerta,
> materiais reais) e peça ao agente: *"Atualize constants.ts conforme o 02-REQUISITOS revisado."*

### T05 · Treinos
```
Implemente trainings: criar treino (data, categoria, observação) e listar os
mais recentes. Cada treino tem botão "Fazer chamada".
```

### T06 · Chamada rápida
```
Implemente a tela /treinos/:id/chamada: lista dos jogadores ATIVOS da categoria
do treino, com toggle grande presente/falta (área de toque ≥ 44px), botão
"marcar todos presentes" e salvar. Grave em attendance com ID
`${trainingId}_${playerId}` usando writeBatch. Se já existir chamada, carregue
e permita editar.
```
**Pronto quando:** chamada de 20 jogadores feita em menos de 1 minuto no celular.

### T07 · Histórico de frequência no perfil
```
No perfil do jogador, mostre percentual de presença e lista de presenças/faltas
(mais recentes primeiro, com limit e "carregar mais").
```

### T08 · Materiais
```
Implemente materials: cadastrar (nome, quantidade total), listar com
quantidade disponível e editar. availableQuantity inicia igual ao total.
```

### T09 · Empréstimos e devoluções
```
Implemente loans: novo empréstimo (escolher material, jogador ativo e
quantidade) com runTransaction validando a quantidade disponível; lista de
pendentes; botão devolver com runTransaction. Destaque em vermelho os
empréstimos com mais de LOAN_ALERT_DAYS dias.
```
**Pronto quando:** emprestar e devolver atualiza a quantidade corretamente, sem ficar negativa.

---

## Sexta — diferencial, segurança e entrega

### T10 · Dashboard e alertas
```
Implemente o dashboard: cards (jogadores ativos, frequência média por categoria
nos últimos 30 dias, materiais em uso, empréstimos pendentes), gráfico de barras
da frequência por categoria (Recharts, carregado com React.lazy) e a lista de
alertas: jogadores com ABSENCE_ALERT_STREAK faltas seguidas e empréstimos
atrasados. Cada alerta leva ao perfil/empréstimo.
```
**Pronto quando:** os alertas aparecem com dados de teste reais.

### T11 · Relatório de participação (P1)
```
Crie /relatorios com tabela de participação por jogador e categoria e botão
imprimir (CSS de impressão). Se exportar CSV, proteja contra CSV injection
(prefixar com apóstrofo células que começam com = + - @).
```

### T12 · Revisão de segurança e performance
```
Revise o projeto contra o checklist de 05-PERFORMANCE-E-SEGURANCA e liste o que
falta. Corrija o que for rápido: lazy loading de rotas, limit nas consultas,
unsubscribe de listeners, vercel.json com headers, .env fora do Git.
```

### T13 · Deploy
```
Prepare o deploy na Vercel: vercel.json (headers e rewrite de SPA), variáveis
de ambiente e instruções passo a passo. No Firebase, adicione o domínio da
Vercel em Authorized domains.
```
**Pronto quando:** abre no celular pela URL pública e o login funciona.

### T14 · Dados de demonstração
```
Crie um script/seed (ou tela oculta apenas em dev) com 15 jogadores fictícios
(nomes inventados), 6 treinos com presenças variadas e 5 materiais, para a
apresentação. Nada de dados reais de crianças no ambiente de demo.
```

---

## Se o tempo apertar (ordem de corte)
1. Corte primeiro: T11 (relatório), gráfico por bairro, QR code.
2. Mantenha sempre: T01 a T10. Sem alertas não há "Smart", então o T10 não sai.
3. Pior caso: entregue T01–T09 + dashboard só com cards e alertas, sem gráfico.

## Checklist final de entrega (sexta)
- [ ] Publicado na Vercel e testado no celular
- [ ] Regras do Firestore publicadas
- [ ] Dados de demonstração carregados (fictícios)
- [ ] `.env` fora do repositório, `.env.example` incluído
- [ ] README com como rodar e link do site
- [ ] Prints das telas para o relatório da faculdade
- [ ] Documento da proposta atualizado com o que o treinador pediu
