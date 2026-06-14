import { useState } from "react";
import { useTheme } from "../context/theme.js";
import SuggestionsPanel from "./SuggestionsPanel.jsx";

const THEME_OPTIONS = [
  { key: "dark", label: "🌙 Dark" },
  { key: "light", label: "☀️ Light" },
  { key: "colorblind", label: "◐ Daltónico" },
];

function Sidebar({ onAddItem, onClearDashboard, totalItems, items, user, onLogout }) {
  const { theme, setTheme } = useTheme();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="sidebar" role="navigation" aria-label="Painel de controlo">
        <div className="sidebar-mobile-header" onClick={() => setMobileOpen((v) => !v)}>
          <h1 className="sidebar-title">Dashboard</h1>
          <span className="sidebar-toggle-icon">{mobileOpen ? "▲" : "▼"}</span>
        </div>

        <div className={`sidebar-collapsible${mobileOpen ? " open" : ""}`}>
          <p className="sidebar-text">
            Plataforma de criação dinâmica de visualizações com componentes configuráveis.
          </p>

          {user && (
            <div className="sidebar-user">
              <span className="sidebar-user-name">👤 {user.username}</span>
              <button className="sidebar-logout-btn" onClick={onLogout}>Sair</button>
            </div>
          )}

          <div className="sidebar-section">
            <p className="sidebar-label">Tema</p>
            <div className="theme-row">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  className={`theme-btn${theme === opt.key ? " theme-btn--active" : ""}`}
                  onClick={() => setTheme(opt.key)}
                  title={opt.label}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-label">Adicionar componente</p>
            <button className="primary-btn" onClick={() => onAddItem("bar")}>▦ Barras</button>
            <button className="primary-btn" onClick={() => onAddItem("line")}>↗ Linha</button>
            <button className="primary-btn" onClick={() => onAddItem("area")}>⬟ Área</button>
            <button className="primary-btn" onClick={() => onAddItem("pie")}>◔ Circular</button>
            <button className="primary-btn" onClick={() => onAddItem("table")}>⊞ Tabela</button>
            <button className="primary-btn" onClick={() => onAddItem("kpi")}>◈ KPI Card</button>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-label">Resumo</p>
            <div className="summary-card">
              <span>Total de componentes</span>
              <strong>{totalItems}</strong>
            </div>
          </div>

          <div className="sidebar-section">
            <button className="secondary-btn" onClick={() => setShowSuggestions(true)}>
              ✦ Ver sugestões
            </button>
            <button className="danger-btn" onClick={onClearDashboard}>
              Limpar dashboard
            </button>
          </div>
        </div>
      </aside>

      {showSuggestions && (
        <SuggestionsPanel
          items={items}
          onAddItem={(type) => {
            onAddItem(type);
            setShowSuggestions(false);
          }}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
