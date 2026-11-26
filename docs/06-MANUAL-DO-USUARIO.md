# 06 · Manual do Usuário e Operação — Smart Sports

Este documento serve como guia prático de utilização do sistema para o treinador e coordenadores do **Projeto B5**, além de detalhar procedimentos operacionais padrão.

---

## 1. Primeiro Acesso e Autenticação

1. Acesse o endereço web do sistema através do navegador do celular ou computador.
2. Informe o **e-mail** e **senha** cadastrados para o treinador.
3. Clique em **Entrar**.
4. **Segurança de Acesso:**
   - O sistema valida se o usuário autenticado possui registro ativo na coleção de treinadores (`coaches`).
   - Caso um usuário não autorizado tente logar, a sessão é encerrada imediatamente com a mensagem *"Sem permissão para acessar este sistema"*.
   - Para sair com segurança, clique no botão **Sair** no canto superior direito do cabeçalho.

---

## 2. Painel de Controle (Dashboard)

Ao entrar no sistema, o treinador visualiza a tela principal com os indicadores consolidados:

- **Cards de Métricas:**
  - **Atletas Ativos:** Número total de crianças e jovens atualmente ativos no projeto.
  - **Frequência (30d):** Média percentual geral de presença nos treinos realizados nos últimos 30 dias.
  - **Materiais em Uso:** Quantidade total de itens esportivos que estão emprestados no momento.
  - **Pendências:** Quantidade de empréstimos em aberto que ainda não foram devolvidos.
- **Gráfico de Frequência por Categoria:**
  - Exibe barras comparativas de presença percentual para cada categoria (`Sub-8`, `Sub-10`, `Sub-12`, `Sub-14`, `Sub-16`) nos últimos 30 dias.
- **Alertas e Atenção:**
  - **Alerta de Evasão (Vermelho):** Destaca automaticamente atletas que acumularam **3 ou mais faltas consecutivas**. Clicar no alerta redireciona imediatamente ao perfil do atleta para contato com o responsável.
  - **Alerta de Atraso de Material (Âmbar):** Destaca empréstimos que estão sem devolução há **mais de 7 dias**. Clicar no alerta redireciona para a lista de empréstimos para registrar o retorno.

---

## 3. Gestão de Atletas (Jogadores)

### 3.1. Cadastrar Novo Atleta
1. No menu inferior, toque em **Jogadores**.
2. Clique no botão **Novo Jogador** (+).
3. Preencha os campos obrigatórios:
   - **Nome Completo:** Nome do jovem (sem apelidos).
   - **Data de Nascimento:** O sistema calcula e exibe a idade automaticamente.
   - **Categoria:** Selecione a turma correspondente (`Sub-8` a `Sub-16`).
   - **Bairro:** Bairro de residência (para indicadores de impacto geográfico).
   - **Nome do Responsável Legal.**
   - **Telefone do Responsável:** Telefone para contato e emergências.
   - **Termo de Consentimento:** Marque obrigatoriamente a ciência e autorização dos responsáveis para guarda das informações (exigência da LGPD).
4. Clique em **Salvar Jogador**.

### 3.2. Busca e Filtros
- Utilize o campo de busca no topo para pesquisar pelo nome do atleta (a busca conta com atraso inteligente para economizar dados de internet).
- Filtre por categoria ou visualize atletas **Inativos**.

### 3.3. Inativação / Reativação
- O sistema **nunca apaga** registros de atletas para não corromper o histórico passado de treinos e relatórios.
- Para desligar um atleta, acesse seu perfil, clique em **Inativar** e confirme no diálogo. O atleta deixará de aparecer nas chamadas e empréstimos, mas seu histórico permanecerá seguro.

---

## 4. Gestão de Treinos e Chamada Rápida

### 4.1. Criar Sessão de Treino
1. No menu inferior, selecione **Treinos**.
2. Clique no botão **Novo Treino** (+).
3. Selecione a **Data**, a **Categoria** que treinará e observações opcionais.
4. Clique em **Salvar**.

### 4.2. Fazer Chamada em Campo
1. Na lista de treinos, toque no botão **Fazer chamada** correspondente à sessão.
2. O sistema listará todos os atletas ativos daquela categoria com botões grandes de toque fácil:
   - Toque no botão de cada atleta para alternar entre **Presente (Verde)** e **Falta (Cinza/Vermelho)**.
   - Caso todos estejam presentes, clique em **Marcar todos presentes** para preencher rapidamente.
3. No rodapé, o contador indica quantas presenças e faltas foram assinaladas.
4. Clique em **Salvar chamada**.
5. As presenças são gravadas em lote atômico (`writeBatch`), garantindo rapidez mesmo com internet móvel reduzida. O treino passará a exibir o indicador verde **Chamada concluída**.
6. É possível entrar novamente a qualquer momento para editar a chamada sem duplicar registros.

---

## 5. Materiais e Empréstimos

### 5.1. Cadastro de Materiais
1. Acesse a aba **Materiais**.
2. Clique em **Novo Material** para cadastrar (ex: *Bolas Campo Umbro*, *Coletes Verdes*, *Cones demarcatórios*).
3. Informe a quantidade total. Inicialmente, a quantidade disponível será idêntica à total.

### 5.2. Registrar Empréstimo
1. Acesse a aba **Empréstimos**.
2. Clique em **Novo Empréstimo**.
3. Selecione o material desejado (o sistema mostra o saldo disponível).
4. Utilize o filtro de **Categoria** para localizar o atleta rapidamente.
5. Selecione a quantidade e confirme.
6. O saldo disponível do material será decrementado automaticamente no mesmo instante.

### 5.3. Devolução de Material
1. Na lista de empréstimos em aberto, localize o empréstimo pendente.
2. Toque no ícone de devolução (↩) ao lado do item.
3. Confirme a devolução no modal.
4. O status mudará para *Devolvido* e o material retornará imediatamente ao estoque disponível.

---

## 6. Relatórios de Participação e Impacto

1. No cabeçalho superior direito, clique em **Relatórios**.
2. Selecione os filtros desejados:
   - **Categoria:** Turma específica ou visão geral.
   - **Status:** Atletas ativos ou todos.
   - **Período:** Histórico geral, últimos 30 dias ou últimos 90 dias.
3. **Imprimir:** Clique no botão **Imprimir** para visualizar a versão limpa para folha A4 (sem menus ou botões do sistema).
4. **Exportar CSV:** Clique em **Exportar CSV** para baixar uma planilha compatível com Microsoft Excel e Google Planilhas. O arquivo é gerado com formatação UTF-8 e sanitizado contra injeções de fórmulas.

---

## 7. Suporte a Falhas e Modo Offline

- O sistema utiliza **persistência local de dados (cache)**. Se a conexão cair no meio do campo, a navegação entre telas continuará funcionando.
- As alterações salvas offline serão sincronizadas com os servidores do Firebase assim que a conexão com a internet for restabelecida.
