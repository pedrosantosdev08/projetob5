# 05 · Performance e segurança — Smart Sports

Este arquivo é **regra de projeto**: o agente deve seguir isto ao gerar código e revisar contra o checklist no fim.

---

# PARTE A · SEGURANÇA

## A1. Autenticação e autorização
- **Desativar cadastro público.** No console do Firebase (Authentication → Settings → User actions), desative a criação de contas por usuários. O treinador é criado manualmente.
- **Autorização no banco, não na tela.** Esconder um botão não protege nada. Quem protege é o `firestore.rules`.
- **Allowlist por documento:** só quem tem `coaches/{uid}` acessa dados. Mesmo que alguém crie uma conta, não lê nada.
- **Princípio do menor privilégio:** `delete` negado em todas as coleções (inativa-se, não se apaga).
- Senha forte para o treinador e, se possível, ativar verificação em duas etapas na conta Google/Firebase do dono do projeto.
- Rotas protegidas (`ProtectedRoute`) são só UX. Nunca confie nelas como segurança.

## A2. `firestore.rules` (base)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function isCoach() {
      return isSignedIn() &&
        exists(/databases/$(database)/documents/coaches/$(request.auth.uid));
    }
    function validPlayer() {
      let d = request.resource.data;
      return d.name is string && d.name.size() > 1 && d.name.size() <= 100
        && d.category is string
        && d.status in ['active', 'inactive']
        && d.guardianConsent is bool;
    }
    function validMaterial() {
      let d = request.resource.data;
      return d.name is string && d.name.size() > 0 && d.name.size() <= 80
        && d.totalQuantity is int && d.totalQuantity >= 0
        && d.availableQuantity is int && d.availableQuantity >= 0
        && d.availableQuantity <= d.totalQuantity;
    }

    match /coaches/{uid} {
      allow read: if isSignedIn() && request.auth.uid == uid;
      allow write: if false;                 // criado só pelo console
    }
    match /players/{id} {
      allow read: if isCoach();
      allow create, update: if isCoach() && validPlayer();
      allow delete: if false;
    }
    match /trainings/{id} {
      allow read, create, update: if isCoach();
      allow delete: if false;
    }
    match /attendance/{id} {
      allow read, create, update: if isCoach();
      allow delete: if false;
    }
    match /materials/{id} {
      allow read: if isCoach();
      allow create, update: if isCoach() && validMaterial();
      allow delete: if false;
    }
    match /loans/{id} {
      allow read, create, update: if isCoach();
      allow delete: if false;
    }

    match /{document=**} { allow read, write: if false; }   // nega o resto
  }
}
```
Observações: `exists()` conta como uma leitura por avaliação, o que é aceitável neste porte. Se o projeto crescer, migrar para **custom claims**. Teste as regras com o **Rules Playground** do console antes de publicar.

## A3. Chaves, variáveis e segredos
- `VITE_*` vai para o bundle e é **público**. A config do Firebase (`apiKey`, `projectId`...) não é segredo, mas **restrinja a API key** no Google Cloud Console (Credentials) por **referrer HTTP** ao domínio da Vercel e a `localhost` em dev.
- **Nunca** colocar service account, chaves privadas ou tokens no repositório ou no front.
- `.env` no `.gitignore`; só `.env.example` (sem valores) vai ao Git.
- Antes de cada commit: `git diff --staged` para conferir se não vazou nada. Se vazar, **gire a chave** e não apenas apague o commit.

## A4. Proteção contra ataques web
- **XSS:** o React escapa por padrão. **Proibido** `dangerouslySetInnerHTML` e `innerHTML` com dado do usuário.
- **CSP e headers** via `vercel.json` (modelo abaixo). Testar no navegador; se algo legítimo bloquear, ajustar a política e não removê-la.
- **Validação de entrada** com Zod no cliente **e** validação mínima nas regras do Firestore (cliente pode ser burlado).
- **CSV injection:** ao exportar CSV, células iniciadas por `=`, `+`, `-` ou `@` devem ser prefixadas com `'`.
- **Clickjacking:** `frame-ancestors 'none'` no CSP.
- **Dependências (cadeia de suprimentos):** poucas libs, versões travadas pelo lockfile, `npm audit` antes da entrega, Dependabot/alertas do GitHub ativados. Não instalar pacote desconhecido sugerido pelo agente sem conferir o nome (cuidado com *typosquatting*).
- **Domínios autorizados:** no Firebase Auth, deixar só `localhost` e o domínio da Vercel em *Authorized domains*.
- **Opcional (hardening):** Firebase **App Check** para barrar acesso ao backend vindo de fora do app.

## A5. `vercel.json` (headers de segurança + SPA)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" }
      ]
    }
  ]
}
```
Se implementar leitura de QR por câmera (P2), trocar para `camera=(self)`.

## A6. Privacidade e LGPD (dados de crianças)
> Orientação técnica de boas práticas, não aconselhamento jurídico. Valide com o professor/orientador e com o projeto.

- A LGPD trata dados de crianças e adolescentes com cuidado reforçado: o tratamento deve ser no **melhor interesse da criança**, com **consentimento específico de ao menos um dos pais ou responsável**. Por isso existe o campo `guardianConsent`.
- **Minimização:** coletar só o necessário (nome, nascimento, categoria, bairro, contato do responsável). **Não coletar** CPF, foto, endereço completo, dados de saúde ou escola.
- **Finalidade clara:** os dados servem só para a gestão do projeto e indicadores agregados.
- **Relatórios para parceiros:** apenas números **agregados**, sem nomes de crianças.
- **Acesso restrito** ao treinador; sem links públicos com dados.
- **Demonstração:** usar **dados fictícios** na apresentação e nos prints. Nada de dados reais de crianças em tela, README ou repositório.
- **Retenção:** permitir inativar; definir com o treinador por quanto tempo guardar dados de quem saiu.
- **Logs:** não imprimir dados pessoais no `console.log`.
- Incluir no relatório da faculdade um parágrafo sobre privacidade e consentimento.

## A7. Controle de custos e abuso
- Ativar **alerta de orçamento** no Google Cloud/Firebase (evita surpresa de cobrança).
- Limitar consultas (`limit`) e evitar listeners sem necessidade (ver Parte B). Isso também protege contra estourar a cota gratuita.

---

# PARTE B · PERFORMANCE

## B1. Metas
| Métrica | Meta (mobile) |
|---|---|
| Lighthouse Performance | ≥ 90 |
| LCP | ≤ 2,5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0,1 |
| JS inicial (gzip) | o menor possível; evitar passar de ~200 KB |

## B2. Carregamento
- **Code splitting por rota** com `React.lazy` + `Suspense`. Dashboard e gráficos (Recharts) em chunk separado.
- **Firebase modular:** importar só o que usa (`firebase/auth`, `firebase/firestore`), nunca `firebase/compat`.
- Analisar o bundle uma vez (`vite build` + visualizador de bundle) e remover o que pesar sem necessidade.
- Sem imagens pesadas; ícones via `lucide-react` (importar ícone por ícone).
- Fonte do sistema ou uma única fonte com `font-display: swap`.
- Assets com hash do Vite ficam em cache de longa duração na Vercel automaticamente.

## B3. Firestore (o maior ganho real)
- **Sempre `limit()`** em listas e paginação com `startAfter` ("carregar mais").
- **Índices compostos** criados pelo link do console para cada consulta de `03-ARQUITETURA.md`.
- **Cache offline persistente** (`persistentLocalCache`) já configurado: o app abre rápido e funciona no campo sem sinal, e as escritas sincronizam depois.
- **`onSnapshot` só onde há ganho em tempo real** (ex.: chamada aberta). Fora isso, `getDocs` pontual. Todo listener tem `unsubscribe` no cleanup do `useEffect`.
- **Desnormalização leve** (`materialName`, `playerName` em `loans`) para evitar leituras extras na lista.
- **Lotes:** chamada com `writeBatch` (uma ida ao servidor, não 20).
- **Transações** só onde há concorrência (empréstimo e devolução).
- Dashboard: consultar **janela de 30 dias**, não a coleção inteira.

## B4. Renderização React
- Listas longas (> ~100 itens): paginação ou virtualização.
- `useMemo`/`useCallback`/`React.memo` **só onde medido** (React DevTools Profiler), e não por padrão.
- Chave estável (`key={id}`) em listas, nunca o índice.
- Estado local o mais perto possível de quem usa; evitar contexto global que re-renderiza tudo.
- Formulários com React Hook Form (não controlado) para reduzir re-renders.
- Debounce de ~300 ms na busca de jogadores.
- Skeletons em vez de tela em branco, o que melhora a percepção de velocidade e o CLS.

## B5. UX que também é performance
- Alvo de toque ≥ 44px e feedback imediato (**atualização otimista** na chamada, com reversão em caso de erro).
- Estados de carregando/vazio/erro em tudo.
- Testar em celular real, com a rede limitada (DevTools → throttling "Fast 3G").

---

# CHECKLIST DE REVISÃO (o agente deve conferir tudo)

### Segurança
- [ ] Cadastro público desativado no Firebase Auth
- [ ] `coaches/{uid}` criado só pelo console
- [ ] `firestore.rules` publicado, com delete negado e `match /{document=**}` negado
- [ ] Regras testadas com conta sem permissão
- [ ] API key restrita por referrer; sem segredos no repositório
- [ ] `.env` no `.gitignore`, `.env.example` presente
- [ ] Sem `dangerouslySetInnerHTML`
- [ ] Zod em todos os formulários
- [ ] `vercel.json` com CSP e headers; app testado sem bloqueios
- [ ] `npm audit` sem vulnerabilidades altas/críticas
- [ ] Authorized domains só com localhost e domínio da Vercel
- [ ] Alerta de orçamento configurado
- [ ] Nenhum dado pessoal em `console.log`
- [ ] Dados de demonstração 100% fictícios

### Privacidade
- [ ] Campo de consentimento do responsável no cadastro
- [ ] Nenhum dado sensível além do necessário
- [ ] Relatórios externos só com dados agregados

### Performance
- [ ] Rotas com `React.lazy`; Recharts em chunk separado
- [ ] Imports modulares do Firebase
- [ ] `limit()` e paginação em listas
- [ ] Índices criados; sem erro de índice no console
- [ ] Listeners com unsubscribe
- [ ] Cache offline persistente ativo
- [ ] Lighthouse mobile ≥ 90 testado
- [ ] Testado em celular real e em rede lenta
