import { datasets } from "../data/datasets.js";

// Backend falso (mesmo contrato que realApi.js): localStorage + dados estáticos.
const ITEMS_KEY = "dynamic-dashboard-items";

const users = { demo: "demo123", "demo@dashboard.pt": "demo123" };

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// Dashboard de exemplo para a primeira visita à demo, para não abrir vazio.
// Só é usado enquanto não houver nada guardado: se a pessoa limpar o dashboard,
// fica vazio como ela deixou.
const SAMPLE_DASHBOARD = [
  { id: "demo-kpi", title: "Total de vendas (Jan–Jul)", type: "kpi", datasetKey: "vendas", color: "#7c3aed", showTooltip: true },
  { id: "demo-bar", title: "Receita por trimestre", type: "bar", datasetKey: "receita", color: "#7c3aed", showTooltip: true },
  { id: "demo-line", title: "Utilizadores ativos", type: "line", datasetKey: "utilizadores", color: "#a855f7", showTooltip: true },
  { id: "demo-pie", title: "Vendas por produto", type: "pie", datasetKey: "produtos", color: "#7c3aed", showTooltip: true },
  { id: "demo-area", title: "Visitas ao site", type: "area", datasetKey: "visitas", color: "#6366f1", showTooltip: true },
  { id: "demo-table", title: "Vendas mensais", type: "table", datasetKey: "vendas", color: "#7c3aed", showTooltip: true },
];

export async function register({ email, password }) {
  await delay(400);
  if (users[email]) throw new Error("Este email já está registado!");
  users[email] = password;
  return { mensagem: "Conta criada com sucesso!" };
}

export async function login({ username, password }) {
  await delay(500);
  if (users[username] && users[username] === password) {
    return { user: { username }, token: `mock-token-${Date.now()}` };
  }
  throw new Error("Credenciais incorretas. Tenta demo / demo123");
}

export async function getDatasets() {
  await delay(120);
  return Object.entries(datasets).map(([key, d]) => ({ key, label: d.label }));
}

export async function getDataset(key) {
  await delay();
  const found = datasets[key];
  if (!found) throw new Error("Dataset não encontrado");
  return found;
}

export async function getDashboard() {
  await delay(120);
  try {
    const saved = localStorage.getItem(ITEMS_KEY);
    if (saved === null) return SAMPLE_DASHBOARD.map((item) => ({ ...item }));
    return JSON.parse(saved) || [];
  } catch {
    return [];
  }
}

export async function saveDashboard(items) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  return items;
}
