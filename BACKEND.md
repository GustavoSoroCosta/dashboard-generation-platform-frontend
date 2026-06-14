# Guia de integração do Backend

A aplicação está pronta para um backend real. Toda a comunicação com dados passa
por uma única camada de serviços em `src/services/`, por isso **nenhum componente
precisa de ser alterado** quando ligares a API.

## Como ligar

1. Copia `.env.example` para `.env`.
2. Define `VITE_API_URL` para o URL base da tua API (ex.: `https://api.exemplo.com`).
3. Muda `VITE_USE_MOCK=false`.
4. Implementa os endpoints abaixo. É tudo.

```
VITE_API_URL=https://api.exemplo.com
VITE_USE_MOCK=false
```

## Arquitetura da camada de serviços

```
src/services/
  config.js     → lê as variáveis de ambiente (API_URL, USE_MOCK)
  http.js       → wrapper de fetch (JSON, token Bearer, erros)
  mockApi.js    → implementação falsa (localStorage + dados estáticos)
  realApi.js    → implementação real (chama os endpoints REST)
  api.js        → superfície pública; escolhe mock ou real via USE_MOCK
```

Os componentes importam **apenas** de `api.js`:
`login`, `logout`, `getDatasets`, `getDataset`, `getDashboard`, `saveDashboard`.

O `mockApi.js` e o `realApi.js` devolvem **exatamente as mesmas formas** — usa o
mock como especificação viva ao construir o backend.

## Autenticação

O `login` guarda o `token` devolvido (via `http.js`) e todos os pedidos seguintes
enviam o cabeçalho `Authorization: Bearer <token>`. O `logout` limpa o token.

## Contrato dos endpoints

| Método | Caminho            | Corpo                      | Resposta                                   |
|--------|--------------------|----------------------------|--------------------------------------------|
| POST   | `/auth/login`      | `{ username, password }`   | `{ user: { username }, token }`            |
| GET    | `/datasets`        | —                          | `[{ key, label }]`                         |
| GET    | `/datasets/:key`   | —                          | `{ label, description, data }`             |
| GET    | `/dashboard`       | —                          | `[ DashboardItem, ... ]`                   |
| PUT    | `/dashboard`       | `{ items: [...] }`         | `[ DashboardItem, ... ]`                   |

### Modelos de dados

**Dataset**
```json
{
  "label": "Vendas Mensais",
  "description": "Evolução mensal das vendas",
  "data": [ { "name": "Jan", "value": 120 }, { "name": "Fev", "value": 180 } ]
}
```

**DashboardItem**
```json
{
  "id": "uuid-ou-string",
  "title": "Vendas Mensais",
  "type": "bar | line | area | pie | table | kpi",
  "datasetKey": "vendas",
  "color": "#7c3aed",
  "showTooltip": true
}
```

## Notas

- Erros: devolve um status não-2xx; o corpo (texto) é mostrado ao utilizador.
- O `PUT /dashboard` é chamado com *debounce* de 500 ms após cada alteração.
- `login` deve devolver `401` com mensagem para credenciais inválidas.
- Credenciais do mock: `demo` / `demo123`.
