# 01 · Visão geral — Smart Sports

> Leia este arquivo antes de qualquer tarefa. Ele é o contexto do projeto.

## O que é
**Smart Sports** é um sistema web para apoiar a gestão do **Projeto B5**, um projeto social de futebol infantil. O dono do projeto é o treinador, que é o usuário principal.

Contexto acadêmico: entrega da disciplina **APIExt III (UNINASSAU)**, tema *Cidades Inteligentes e Prototipagem de Soluções*. A disciplina exige um **protótipo funcional**, aplicado a um **problema real**, com **contrapartida social**.

## Problema
A gestão do projeto é manual. Cadastro, chamada e empréstimo de materiais têm pouca organização, o treinador não enxerga quem está faltando e não tem números de impacto para prestar contas a parceiros.

## Objetivo
Entregar um **MVP** que permita ao treinador:
1. Cadastrar e consultar jogadores.
2. Registrar presença nos treinos e ver o histórico.
3. Controlar empréstimo e devolução de materiais esportivos.
4. Ver um **painel de indicadores e alertas** (o diferencial Smart City).

## Por que é "Smart City"
O sistema transforma registros do dia a dia em **informação para decisão**: quem está em risco de evasão, como os recursos são usados e qual o alcance do projeto na comunidade. É tecnologia e dados em benefício da comunidade, o que atende ao tema e à contrapartida social.

## Usuários
| Usuário | Papel | Dispositivo |
|---|---|---|
| Treinador (principal) | Usa tudo | Celular, no campo, às vezes com internet ruim |
| Equipe de apoio (futuro) | Chamada e materiais | Celular |
| Parceiros (indireto) | Recebem relatório de impacto | — |

## Princípios do produto
- **Mobile-first.** A chamada tem que ser feita em segundos, com o polegar.
- **Simples acima de completo.** Telas com poucos campos, sem treinamento.
- **Funciona com internet instável.** Cache offline do Firestore.
- **Dados de crianças.** Coletar o mínimo necessário (ver `05-PERFORMANCE-E-SEGURANCA.md`).
- **Nunca apagar, sempre inativar.** Preserva o histórico.

## Fora de escopo do MVP
Pagamentos, app nativo, múltiplos projetos/organizações, área do responsável, notificações push, integração com WhatsApp.

## Prazo
- Reunião com o treinador: **26/11/2026**.
- Entrega do MVP: **sexta, 27/11/2026**.
- Apresentação: semana seguinte.

## Pendências a confirmar com o treinador
Ver seção "A confirmar" em `02-REQUISITOS.md`.
