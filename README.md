# RoadControl — Interface

Frontend da plataforma RoadControl (controle de abastecimento de frotas). Consome a
API .NET em `../RoadControl`.

## Stack

- **Vite + React 19 + TypeScript** (SPA)
- **TanStack Query** + **Axios** (cache de dados, JWT, desembrulho do `ApiResponse`)
- **React Router 7** (rotas com guarda por papel)
- **React Hook Form + Zod** (validação no login)
- **lucide-react** (ícones) · tokens/estilos portados do design system da marca

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
```

O backend deve estar rodando em `http://localhost:5254`. Em desenvolvimento, o Vite faz
**proxy** de `/v1/*` para o backend (resolve o CORS, que está com `AllowedOrigins` vazio).

Em produção, defina `VITE_API_URL` com a origem do backend e libere o CORS no servidor.

```bash
npm run build      # gera dist/
npm run preview    # serve o build
npm run lint       # oxlint
```

## Estrutura

```
src/
├─ api/            # serviços + hooks de query por recurso (auth, organizations, …)
├─ components/
│  ├─ ds/          # design system tipado (Button, Input, Card, Icon, …)
│  ├─ ui/          # DataTable, Modal, toast, estados, PageHeader, …
│  └─ shell/       # Sidebar, Topbar, AppLayout, guardas e navegação por papel
├─ features/
│  ├─ auth/        # Login
│  ├─ admin/       # SystemAdmin: painel, organizações, postos, usuários
│  ├─ fleet/       # OrganizationAdmin: painel, abastecimentos, frota, motoristas
│  └─ driver/      # Driver: meus abastecimentos, registrar, frota (reúso da frota)
├─ lib/            # api (axios), auth (contexto), format (pt-BR), tableState
├─ types/          # DTOs/enums espelhando o backend
└─ styles/         # tokens + global.css
```

## Personas e rotas

| Papel (JWT) | Rotas |
|---|---|
| `SystemAdmin` | `/admin`, `/admin/orgs`, `/admin/stations`, `/admin/users` |
| `OrganizationAdmin` | `/fleet`, `/fleet/refuels`, `/fleet/register`, `/fleet/vehicles`, `/fleet/drivers` |
| `Driver` | `/driver`, `/driver/register`, `/driver/fleet` |

O papel vem de `GET /v1/auth/me` após o login; cada grupo de rotas é protegido por
`RequireRole`.

## Pendências que dependem do backend

1. **CORS** — liberar a origem do front em produção (`Cors:AllowedOrigins`).
2. **Listagem de postos restrita ao SystemAdmin** — `GasStationController` exige
   `SystemAdmin`. Por isso gestor/motorista **não conseguem listar postos**: na tela de
   registrar abastecimento, o seletor de posto cai para entrada manual do código. Ideal:
   permitir que gestor/motorista listem os postos disponíveis para a organização.
3. **RoleId no cadastro de usuário** — `NewUserDto` exige `RoleId` (long), mas não há
   endpoint de papéis nem seed no repo. O mapa em `src/types/enums.ts` (`ROLE_ID`) assume
   `SystemAdmin=1, OrganizationAdmin=2, Driver=3, GasStationAttendant=4`. Confirmar com a
   tabela `rc.Roles` e ajustar se preciso.
