import { API_URL } from "./config.js";
import { request } from "./http.js";

// Real backend (FastAPI). Endpoints documented in BACKEND.md.
// Each function returns the same shape as its mockApi.js counterpart.

const ITEMS_KEY = "dynamic-dashboard-items";

// ── AUTH ────────────────────────────────────────────────────────────
export async function register({ email, password }) {
  // POST /utilizadores  { email, password }
  return request("/utilizadores", { method: "POST", auth: false, body: { email, password } });
}

export async function login({ username, password }) {
  // POST /login is OAuth2 form-encoded (username = email). Returns
  // { access_token, refresh_token, token_type }.
  let res;
  try {
    res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
    });
  } catch {
    throw new Error("Não foi possível ligar ao servidor.");
  }
  if (!res.ok) {
    let detail = "Email ou password incorretos.";
    try { detail = (await res.json()).detail || detail; } catch { /* ignore */ }
    throw new Error(detail);
  }
  const data = await res.json();
  return { user: { username }, token: data.access_token };
}

// ── DATASETS (= fontes de dados) ────────────────────────────────────
export async function getDatasets() {
  // GET /fontes-dados -> [{ id, nome }]
  const fontes = await request("/fontes-dados");
  return (fontes || []).map((f) => ({ key: f.id, label: f.nome }));
}

const isDateCol = (c) => /data|timestamp|date|hora/i.test(c);

export async function getDataset(key) {
  // 1st call: discover column metadata + a default aggregation.
  let resp = await request(`/fontes-dados/${key}/analise`);
  const textCols = resp.colunas_texto || [];
  const numCols = resp.colunas_numero || [];
  const nameKey = textCols.find((c) => !isDateCol(c)) || textCols[0];
  const valueKey = numCols[0];

  // If a better (non-date) category exists, re-aggregate by it.
  const used = Object.keys((resp.dados && resp.dados[0]) || {});
  if (nameKey && valueKey && !used.includes(nameKey)) {
    resp = await request(
      `/fontes-dados/${key}/analise?groupby=${encodeURIComponent(nameKey)}&agg_col=${encodeURIComponent(valueKey)}`
    );
  }

  const data = (resp.dados || []).map((row) => ({
    name: String(row[nameKey] ?? ""),
    value: Number(row[valueKey] ?? 0) || 0,
  }));

  return {
    label: nameKey && valueKey ? `${valueKey} por ${nameKey}` : "Dados",
    description: "Dados obtidos em tempo real do backend.",
    data,
  };
}

// ── DASHBOARD LAYOUT ────────────────────────────────────────────────
// Persistido localmente: o modelo de widgets do backend ainda não guarda
// cor/disposição. Autenticação e dados vêm do backend; o arranjo dos
// componentes fica no cliente (ver BACKEND.md / nota de integração).
export async function getDashboard() {
  try { return JSON.parse(localStorage.getItem(ITEMS_KEY)) || []; }
  catch { return []; }
}

export async function saveDashboard(items) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  return items;
}
