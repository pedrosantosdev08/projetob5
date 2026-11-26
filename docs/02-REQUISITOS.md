# 02 · Requisitos — Smart Sports

Prioridades: **P0** = obrigatório no MVP · **P1** = entra se der tempo · **P2** = bônus.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | Login do treinador (e-mail e senha) e logout | P0 |
| RF02 | Cadastrar jogador: nome, data de nascimento, categoria, bairro, responsável, telefone do responsável, consentimento do responsável | P0 |
| RF03 | Listar, buscar, filtrar por categoria, editar e **inativar** jogador | P0 |
| RF04 | Criar treino (data, categoria, observação) | P0 |
| RF05 | Registrar presença/falta dos jogadores da categoria em um treino (chamada rápida) | P0 |
| RF06 | Ver histórico de frequência individual (percentual e lista) | P0 |
| RF07 | Cadastrar material esportivo (nome, quantidade total) | P0 |
| RF08 | Registrar empréstimo (material, jogador, quantidade, data) | P0 |
| RF09 | Registrar devolução | P0 |
| RF10 | Listar materiais pendentes de devolução | P0 |
| RF11 | Dashboard: total de atendidos, frequência média por categoria, materiais em uso, pendências | P0 |
| RF12 | Alertas: jogador com faltas consecutivas e material emprestado há muitos dias | P0 |
| RF13 | Relatório de participação (tela imprimível ou PDF) | P1 |
| RF14 | Relatório mensal de impacto para parceiros | P1 |
| RF15 | Gráfico de atletas por bairro | P2 |
| RF16 | Código/QR do jogador para chamada e empréstimo | P2 |

## Requisitos não funcionais
- **RNF01** Responsivo, mobile-first, botões com área de toque mínima de 44px.
- **RNF02** Funciona com internet instável (cache offline do Firestore).
- **RNF03** Acesso só com login; dados protegidos por regras do Firestore.
- **RNF04** Privacidade de dados de menores (ver `05-PERFORMANCE-E-SEGURANCA.md`).
- **RNF05** Carregamento inicial rápido (meta Lighthouse mobile ≥ 90 em Performance).
- **RNF06** Hospedagem gratuita (Vercel + Firebase plano Spark).
- **RNF07** Interface em português do Brasil.

## Regras de negócio
- **RN01** Jogador inativo não aparece na chamada nem em novos empréstimos, mas o histórico é mantido.
- **RN02** A chamada lista só jogadores **ativos** da categoria do treino.
- **RN03** Presença é única por jogador e treino (editar a existente, nunca duplicar).
- **RN04** Empréstimo exige quantidade disponível suficiente; disponível = total − emprestado em aberto.
- **RN05** Devolução só pode ocorrer em empréstimo em aberto, e restaura a quantidade.
- **RN06** **Alerta de evasão:** jogador com **3 faltas seguidas** nos últimos treinos da sua categoria. Limite é uma constante configurável.
- **RN07** **Alerta de material:** empréstimo em aberto há mais de **7 dias**. Limite é uma constante configurável.
- **RN08** Frequência % = presenças ÷ treinos da categoria desde o cadastro do jogador (ou nos últimos 30 dias, no dashboard).
- **RN09** Categorias por faixa etária. Valores iniciais: `Sub-8`, `Sub-10`, `Sub-12`, `Sub-14`, `Sub-16` (ajustar com o treinador).

## Telas (rotas)
| Rota | Tela | Conteúdo principal |
|---|---|---|
| `/login` | Login | E-mail, senha |
| `/` | Dashboard | Cards de indicadores + lista de alertas |
| `/jogadores` | Lista | Busca, filtro de categoria, botão novo |
| `/jogadores/novo` · `/jogadores/:id/editar` | Formulário | Campos do RF02 |
| `/jogadores/:id` | Perfil | Dados + histórico de frequência + empréstimos |
| `/treinos` | Treinos | Lista e criar treino |
| `/treinos/:id/chamada` | Chamada | Lista de jogadores com toggle presente/falta, salvar |
| `/materiais` | Materiais | Lista, cadastro, quantidade disponível |
| `/emprestimos` | Empréstimos | Novo empréstimo, pendentes, devolver |
| `/relatorios` | Relatórios (P1) | Participação e impacto |

## Critérios de aceite do MVP
- [ ] Treinador loga e só ele acessa os dados.
- [ ] Cadastra um jogador em menos de 1 minuto.
- [ ] Faz a chamada de 20 jogadores em menos de 1 minuto no celular.
- [ ] Empresta e devolve material, e a quantidade disponível atualiza corretamente.
- [ ] Dashboard mostra números reais e os alertas das regras RN06 e RN07.
- [ ] Publicado na Vercel e funcionando no celular.

## A confirmar com o treinador (reunião 26/11)
- [ ] Quantos jogadores e turmas existem? Quais as faixas de idade? (ajusta RN09)
- [ ] Quantos treinos por semana?
- [ ] Como a chamada e o empréstimo funcionam hoje?
- [ ] Quais materiais existem e em que quantidade?
- [ ] Quantas faltas seguidas já consideram preocupante? (ajusta RN06)
- [ ] Em quantos dias um material deveria voltar? (ajusta RN07)
- [ ] Quem usa o sistema além dele?
- [ ] Que números ele precisa mostrar a parceiros?
- [ ] Há autorização dos responsáveis para guardar dados das crianças?
- [ ] O que ele mais gostaria de ver numa tela só?
