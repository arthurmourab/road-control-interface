# RoadControl Interface — Documento de suporte a agentes de IA

## Objetivo
Este documento serve de referência de contexto e de padrão arquitetural para o **frontend**
do RoadControl (RC). Agentes de IA que leiam ou alterem o código de qualquer maneira devem
consultar este documento **antes** de tomar suas decisões, e manter a consistência com os
padrões aqui descritos.

> O backend (API .NET) vive em `../RoadControl` e tem seu próprio `CLAUDE.md`. Os contratos
> (DTOs, enums, `ApiResponse<T>`, `PagedResult<T>`) são a fonte da verdade — o front os espelha
> em `src/types`.

## O que o sistema é
Painel web do RoadControl: software de controle de abastecimento de frotas que atua como ponte
entre organizações e postos parceiros. A interface atende **três personas** (papéis do backend):
**SystemAdmin** (administra a plataforma), **OrganizationAdmin** (gestor de frota) e **Driver**
(motorista, que registra abastecimentos). O papel `GasStationAttendant` (Frentista) pode ser
criado pelo admin e tem uma **experiência mínima**: home própria em `/attendant`
(`features/attendant`) com aviso de "em desenvolvimento" — as funcionalidades do papel ainda
não existem. A linguagem da interface é **português (pt-BR)**.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Build / dev server | **Vite** |
| UI | **React 19** + **TypeScript** |
| Dados / cache de servidor | **TanStack Query** (`@tanstack/react-query`) |
| HTTP | **Axios** (instância única com interceptors) |
| Rotas | **React Router** (`react-router-dom`) |
| Formulários | **React Hook Form** + **Zod** (quando há validação declarativa) |
| Ícones | **lucide-react** (via wrapper `Icon` por nome kebab-case) |

Sem biblioteca de componentes de terceiros: o design system é portado à mão (ver abaixo).

---

## Arquitetura e camadas

A dependência flui de cima para baixo. Uma camada só conhece as que estão acima dela:

| Pasta | Responsabilidade | Depende de |
|-------|------------------|------------|
| **`src/types`** | Tipos espelhando DTOs/enums do backend, `ApiResponse`, `PagedResult` | (nada) |
| **`src/lib`** | `api` (axios + interceptors), `auth` (contexto de sessão), `token`, `format`, `tableState` | types |
| **`src/api`** | Um arquivo por recurso: funções de request + **hooks do TanStack Query** (`useXxx`) e query keys | lib, types |
| **`src/components/ds`** | Design system: os 14 primitivos + `Icon`, tipados (inline-style + tokens) | (tokens CSS) |
| **`src/components/ui`** | Blocos compartilhados: `DataTable`, `Modal`/`ConfirmDialog`, estados, toasts, `PageHeader`, badges | ds, lib |
| **`src/components/shell`** | App shell: `Sidebar`, `Topbar`, `AppLayout`, guardas de rota, navegação por papel | ds, ui, lib |
| **`src/features`** | Telas por área: `auth`, `admin`, `fleet`, `driver` | tudo acima |

Regras de dependência:
- **`features` nunca chama `axios`/`fetch` direto** — sempre via os hooks de `src/api`.
- **Componentes de `ds`/`ui` não conhecem regras de negócio nem chamam a API.** São apresentação.
- **Telas do motorista reaproveitam as da frota** em escopo `driver` (ver `features/driver`), não duplicam.

---

## Fluxo de dados

```
Tela (feature)  →  hook useXxx (src/api)  →  api.get/post/... (src/lib/api)  →  backend /v1/...
   (UI/estado)     (TanStack Query)          (axios + JWT + unwrap)
```

1. A **tela** chama um hook (`useFuelings`, `useCreateVehicle`, …) e renderiza a partir de `data`,
   `isLoading`, `isError`.
2. O **hook** encapsula a query/mutation, a **query key** e a invalidação de cache no sucesso.
3. O **`api`** injeta o JWT, desembrulha o `ApiResponse<T>` (devolve só `data`) e converte falhas
   em `ApiError`.

---

## Convenções de código

- **Idioma:** comentários em **português**; identificadores (componentes, funções, variáveis)
  em **inglês**. Todo texto de interface é **pt-BR**.
- **Estilização:** **inline-style tipado + CSS variables (tokens)**. Os tokens ficam em
  `src/styles/tokens/*.css` (cores, tipografia, espaçamento) e são a fonte da verdade visual —
  **nunca hardcode cores/tamanhos**, use `var(--token)`. Sem Tailwind, sem CSS-in-JS.
- **Componentes do design system** (`ds`) são a única forma de botão, input, card, badge etc.
  Não recrie esses primitivos numa tela.
- **Ícones** sempre via `<Icon name="kebab-case" />`. Ao usar um ícone novo, registre-o no mapa
  em `src/components/ds/Icon.tsx`.
- **Imports** usam o alias **`@/`** (= `src/`). Tipos importados com `import type` (o projeto usa
  `verbatimModuleSyntax`).
- **Datas, moeda, litros, km, CNPJ, CEP**: formatar sempre pela `src/lib/format` (pt-BR). O número
  é o protagonista — recebe `var(--font-number)` (Space Grotesk).
- **Sem emoji.** Status é comunicado por **cor + ícone/label** juntos, nunca só cor (acessibilidade).
- **Estados de lista** (carregando/vazio/erro) vêm do status da query via `tableState(...)` e da
  `DataTable`; não invente spinners ad-hoc.

---

## Autenticação e autorização

- Login em `POST /v1/auth`; o token JWT é guardado em `localStorage` (`src/lib/token`).
- O **contexto de sessão** (`src/lib/auth`) reidrata a sessão chamando `GET /v1/auth/me` e expõe
  `user`, `status`, `login`, `logout`. **O papel da navegação vem do `user.role`** — nunca de
  estado local nem de "trocar de visão".
- O interceptor de resposta dispara logout em **401** (evento `rc-unauthorized`).
- **Guardas de rota** (`src/components/shell/guards.tsx`): `RequireAuth` (sessão), `RequireRole`
  (papéis), `HomeRedirect` (tela inicial por papel). A navegação por papel fica em
  `src/components/shell/nav.ts`.

---

## Integração com a API

- **Envelope:** toda resposta é `ApiResponse<T> = { success, data, error }`; listagens são
  `PagedResult<T> = { currentPage, pageSize, totalRows, results }`. O `api` já desembrulha.
- **Rotas:** `/v1/[controller]` em minúsculas. Erros viram `ApiError` (com `status` e mensagem do
  backend) — trate-os com toast/alerta amigável, sem vazar detalhes técnicos.
- **Proxy de dev (importante):** o `vite.config.ts` aponta `/v1` para **`https://localhost:7131`**
  (`secure: false`), **não** para o `http://localhost:5254`. O backend faz `UseHttpsRedirection`
  e um redirect http→https faz o navegador **descartar o header `Authorization`**, quebrando
  `/auth/me` e tudo autenticado. Em produção, defina `VITE_API_URL`.

---

## Checklist: como adicionar uma tela ou recurso

1. **types** — se o recurso é novo, adicione os tipos espelhando o DTO em `src/types/models.ts`
   (e enums/labels em `src/types/enums.ts`).
2. **api** — crie/edite `src/api/<recurso>.ts` com as funções de request, as **query keys** e os
   hooks `useXxx` (mutations invalidam a key do recurso no `onSuccess`).
3. **feature** — crie a tela em `src/features/<área>/`, consumindo os hooks. Reaproveite `DataTable`,
   `Modal`, `PageHeader`, badges e os primitivos de `ds`.
4. **rota** — registre em `src/App.tsx` dentro do grupo de papel correto (`RequireRole`) e adicione
   o item de navegação em `src/components/shell/nav.ts`.
5. **estados** — cubra carregando/vazio/erro (via `tableState` + `emptyProps`) e dê feedback de
   sucesso/erro com `toast`.
6. **valide** — `npm run build` (typecheck + build) e `npm run lint` devem passar limpos.

---

## Mensagens de commit

Ao gerar mensagens de commit, siga as instruções em [`.claude/commit.md`](.claude/commit.md).

---

## Comandos úteis

```bash
npm run dev      # sobe o dev server (Vite) em http://localhost:5173, com proxy /v1
npm run build    # typecheck (tsc -b) + build de produção
npm run lint     # oxlint
npm run preview  # serve o build de produção localmente
```

---

## Gaps e pontos de atenção (dependem do backend)

- **Listagem de postos** (`GasStationController`) exige `SystemAdmin`. Gestor/motorista **não
  listam postos**; no registro de abastecimento o seletor de posto degrada para entrada manual do
  código. Se o backend liberar a listagem para esses papéis, trocar a degradação por um `Select`.
- **`NewUserDto.RoleId`** precisa do id numérico do papel, mas não há endpoint que liste papéis.
  O mapa `ROLE_ID` em `src/types/enums.ts` assume a ordem do `IDENTITY` (`SystemAdmin=1`,
  `OrganizationAdmin=2`, `Driver=3`, `GasStationAttendant=4`). Se a tabela `rc.Roles` mudar,
  ajuste o mapa.
- **CORS:** em desenvolvimento o backend já libera qualquer origem loopback (política `Frontend`
  no `Program.cs`); ainda assim usamos o proxy do Vite por causa do problema do redirect
  http→https descrito acima. Em produção a origem do front precisa ser adicionada em
  `Cors:AllowedOrigins` no `appsettings` da API (hoje está `[]`).
