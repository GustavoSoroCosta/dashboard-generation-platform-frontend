// Central runtime configuration, sourced from Vite env vars.
// Copy .env.example to .env and fill these in to point at a real backend.

// Base URL of the REST API (only used when USE_MOCK is false).
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// Defaults to the in-memory mock so the app runs with zero backend.
// Set VITE_USE_MOCK=false in .env once the real API is available.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
