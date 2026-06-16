import { datasets } from "../data/datasets.js";

// Backend falso (mesmo contrato que realApi.js): localStorage + dados estáticos.
const ITEMS_KEY = "dynamic-dashboard-items";

const users = { demo: "demo123", "demo@dashboard.pt": "demo123" };

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

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
    return JSON.parse(localStorage.getItem(ITEMS_KEY)) || [];
  } catch {
    return [];
  }
}

export async function saveDashboard(items) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  return items;
}
