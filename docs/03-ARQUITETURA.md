# 03 · Arquitetura e modelo de dados — Smart Sports

## Stack
| Camada | Tecnologia | Por quê |
|---|---|---|
| Front-end | React + TypeScript + Vite | Build rápido, SPA simples |
| Estilo | Tailwind CSS | Velocidade de UI, mobile-first |
| Rotas | React Router | Padrão |
| Backend/BD | Firebase Auth + Firestore (SDK modular) | Sem servidor para manter |
| Validação | Zod + React Hook Form | Formulários rápidos e seguros |
| Gráficos | Recharts | Dashboard simples |
| Ícones | lucide-react | Leve |
| Hospedagem | Vercel | Deploy por Git, grátis |

Evitar dependências extras. Menos pacotes significa menos risco e bundle menor.

## Estrutura de pastas
```
src/
  app/            # rotas, layout, providers
  components/     # componentes de UI reutilizáveis (Button, Input, Card, Modal)
  features/
    auth/         # login, AuthProvider, ProtectedRoute
    players/      # lista, formulário, perfil, hooks, schema
    trainings/    # treinos e chamada
    materials/    # materiais
    loans/        # empréstimos e devoluções
    dashboard/    # indicadores e alertas
  lib/
    firebase.ts   # init do Firebase + cache offline
    constants.ts  # categorias, limites de alerta (RN06, RN07)
    dates.ts      # helpers de data
  types/          # tipos globais
firestore.rules
vercel.json
.env.example
docs/             # estes arquivos .md
```
Cada `feature` tem seus próprios `types`, `schema` (Zod), `service` (acesso ao Firestore) e `hooks`. **Componentes não chamam o Firestore direto**, só via `service`/hooks.

## Inicialização do Firebase (`lib/firebase.ts`)
```ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
```

## Modelo de dados (Firestore)

### `coaches/{uid}`
Quem tem permissão de acesso. Criado **manualmente** no console para o treinador.
```
{ name: string, createdAt: Timestamp }
```

### `players/{playerId}`
```
{
  name: string,
  birthDate: Timestamp,
  category: string,              // "Sub-10"...
  neighborhood: string,
  guardianName: string,
  guardianPhone: string,
  guardianConsent: boolean,      // autorização do responsável para guardar dados
  status: "active" | "inactive",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `trainings/{trainingId}`
```
{ date: Timestamp, category: string, notes?: string, createdAt: Timestamp }
```

### `attendance/{trainingId}_{playerId}`
ID determinístico, o que garante **uma presença por jogador e treino** (RN03).
```
{
  trainingId: string,
  playerId: string,
  category: string,
  date: Timestamp,               // copiado do treino, para consultas
  present: boolean
}
```

### `materials/{materialId}`
```
{
  name: string,
  totalQuantity: number,
  availableQuantity: number,     // atualizado só via transação
  active: boolean,
  createdAt: Timestamp
}
```

### `loans/{loanId}`
```
{
  materialId: string,
  materialName: string,          // cópia, evita leitura extra na lista
  playerId: string,
  playerName: string,            // cópia
  quantity: number,
  loanedAt: Timestamp,
  returnedAt: Timestamp | null,
  status: "open" | "returned"
}
```

## Consultas principais e índices
| Uso | Consulta | Índice composto |
|---|---|---|
| Lista de jogadores ativos por categoria | `players` where `status==active`, `category==X`, orderBy `name` | status + category + name |
| Treinos recentes da categoria | `trainings` where `category==X`, orderBy `date desc`, limit N | category + date desc |
| Histórico do jogador | `attendance` where `playerId==X`, orderBy `date desc` | playerId + date desc |
| Chamada do treino | `attendance` where `trainingId==X` | simples |
| Empréstimos em aberto | `loans` where `status==open`, orderBy `loanedAt` | status + loanedAt |

O Firestore mostra no console o link para criar cada índice quando a consulta falha. Crie por esse link.

## Operações que exigem transação
- **Empréstimo:** `runTransaction`: lê o material, valida `availableQuantity >= quantity`, cria o `loan` e decrementa `availableQuantity`.
- **Devolução:** `runTransaction`: lê o `loan` (precisa estar `open`), marca `returned` com `returnedAt` e incrementa `availableQuantity`.
- **Salvar chamada:** `writeBatch` com todos os documentos de `attendance` do treino (até 500 por batch).

## Cálculo de alertas (no cliente, no MVP)
- **Evasão (RN06):** para cada jogador ativo, buscar as últimas `N` presenças da categoria e verificar se as `3` mais recentes são `present: false`.
- **Material (RN07):** `loans` com `status == open` e `loanedAt` anterior a hoje − 7 dias.
- Limites em `lib/constants.ts`: `ABSENCE_ALERT_STREAK = 3`, `LOAN_ALERT_DAYS = 7`.

## Convenções
- TypeScript estrito (`strict: true`), sem `any`.
- Nomes de coleções e campos em inglês, textos de UI em português.
- Datas sempre como `Timestamp` no banco e formatadas só na UI.
- Todo formulário valida com Zod antes de gravar.
- Estados de carregamento, vazio e erro em toda lista e toda ação.
- Commits pequenos, um por tarefa do `04-PLANO-DE-TAREFAS.md`.
