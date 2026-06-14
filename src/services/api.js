import { USE_MOCK } from "./config.js";
import { setToken } from "./http.js";
import * as mock from "./mockApi.js";
import * as real from "./realApi.js";

// Single public API surface for the whole app. Swap the entire backend by
// flipping VITE_USE_MOCK — no component needs to change. See BACKEND.md.
const impl = USE_MOCK ? mock : real;

export async function login(credentials) {
  const { user, token } = await impl.login(credentials);
  setToken(token);
  return user;
}

export function logout() {
  setToken(null);
}

export const register = impl.register;
export const getDatasets = impl.getDatasets;
export const getDataset = impl.getDataset;
export const getDashboard = impl.getDashboard;
export const saveDashboard = impl.saveDashboard;
