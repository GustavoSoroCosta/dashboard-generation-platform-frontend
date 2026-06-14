import { useRef, useState } from "react";
import { useTheme } from "../context/theme.js";
import EmptyState from "./EmptyState.jsx";
import DashboardItem from "./DashboardItem.jsx";
import BottomSheet from "./BottomSheet.jsx";
import SuggestionsPanel from "./SuggestionsPanel.jsx";

const COMPONENT_TYPES = [
  { type: "bar", icon: "▦", label: "Barras", desc: "Comparar valores" },
  { type: "line", icon: "↗", label: "Linha", desc: "Tendências" },
  { type: "area", icon: "⬟", label: "Área", desc: "Volume e fluxo" },
  { type: "pie", icon: "◔", label: "Circular", desc: "Proporções" },
  { type: "table", icon: "⊞", label: "Tabela", desc: "Ver em detalhe" },
  { type: "kpi", icon: "◈", label: "KPI Card", desc: "Métrica chave" },
];

const THEME_OPTIONS = [
  { key: "dark", label: "🌙 Escuro" },
  { key: "light", label: "☀️ Claro" },
  { key: "colorblind", label: "◐ Daltónico" },
];

function MobileShell({
  items,
  loading,
  datasetOptions,
  user,
  onAddItem,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdate,
  onClearDashboard,
  onLogout,
}) {
  const { theme, setTheme } = useTheme();
  const [sheet, setSheet] = useState(null); // 'add' | 'theme' | 'account' | 'suggestions'
  const contentRef = useRef(null);

  const close = () => setSheet(null);
  const scrollTop = () =>
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  function handleAdd(type) {
    onAddItem(type);
    close();
    requestAnimationFrame(() =>
      contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: "smooth" })
    );
  }

  return (
    <div className="mobile-shell" data-mobile-shell>
      <header className="mobile-topbar">
        <div className="mobile-topbar-text">
          <span className="mobile-topbar-greeting">Olá, {user?.username}</span>
          <h1 className="mobile-topbar-title">Dashboard</h1>
        </div>
        <button
          className="mobile-avatar"
          onClick={() => setSheet("account")}
          aria-label="Conta e definições"
        >
          {(user?.username || "?").charAt(0).toUpperCase()}
        </button>
      </header>

      <main className="mobile-content" ref={contentRef}>
        {loading ? (
          <div className="dashboard-loading">
            <div className="loading-spinner" />
            <p className="loading-text">A carregar...</p>
          </div>
        ) : items.length === 0 ? (
          <EmptyState onAddItem={onAddItem} />
        ) : (
          <>
            <div className="mobile-stat-strip">
              <span>{items.length} {items.length === 1 ? "componente" : "componentes"}</span>
              <span className="mobile-stat-dot">•</span>
              <span>{datasetOptions.length} datasets</span>
            </div>
            <div className="mobile-card-list">
              {items.map((item, index) => (
                <DashboardItem
                  key={item.id}
                  item={item}
                  datasetOptions={datasetOptions}
                  onRemove={() => onRemove(item.id)}
                  onMoveUp={() => onMoveUp(index)}
                  onMoveDown={() => onMoveDown(index)}
                  onUpdate={onUpdate}
                  canMoveUp={index > 0}
                  canMoveDown={index < items.length - 1}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <nav className="mobile-nav" aria-label="Navegação principal">
        <button className="mobile-nav-btn" onClick={scrollTop}>
          <span className="mobile-nav-icon">⌂</span>
          <span className="mobile-nav-label">Início</span>
        </button>
        <button className="mobile-nav-btn" onClick={() => setSheet("suggestions")}>
          <span className="mobile-nav-icon">✦</span>
          <span className="mobile-nav-label">Sugestões</span>
        </button>

        <button className="mobile-fab" onClick={() => setSheet("add")} aria-label="Adicionar componente">
          +
        </button>

        <button className="mobile-nav-btn" onClick={() => setSheet("theme")}>
          <span className="mobile-nav-icon">◑</span>
          <span className="mobile-nav-label">Tema</span>
        </button>
        <button className="mobile-nav-btn" onClick={() => setSheet("account")}>
          <span className="mobile-nav-icon">☰</span>
          <span className="mobile-nav-label">Conta</span>
        </button>
      </nav>

      {/* Add component sheet */}
      <BottomSheet open={sheet === "add"} title="Adicionar componente" onClose={close}>
        <div className="sheet-grid">
          {COMPONENT_TYPES.map((c) => (
            <button key={c.type} className="sheet-grid-item" onClick={() => handleAdd(c.type)}>
              <span className="sheet-grid-icon">{c.icon}</span>
              <span className="sheet-grid-label">{c.label}</span>
              <span className="sheet-grid-desc">{c.desc}</span>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Theme sheet */}
      <BottomSheet open={sheet === "theme"} title="Aparência" onClose={close}>
        <div className="sheet-theme-list">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`sheet-theme-btn${theme === opt.key ? " is-active" : ""}`}
              onClick={() => setTheme(opt.key)}
            >
              <span>{opt.label}</span>
              {theme === opt.key && <span className="sheet-check">✓</span>}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Account / settings sheet */}
      <BottomSheet open={sheet === "account"} title="Conta" onClose={close}>
        <div className="sheet-account">
          <div className="sheet-account-row">
            <div className="sheet-account-avatar">
              {(user?.username || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="sheet-account-name">{user?.username}</p>
              <p className="sheet-account-sub">Sessão ativa</p>
            </div>
          </div>

          <button
            className="sheet-action danger"
            onClick={() => {
              close();
              onClearDashboard();
            }}
          >
            <span>🗑</span> Limpar dashboard
          </button>
          <button
            className="sheet-action"
            onClick={() => {
              close();
              onLogout();
            }}
          >
            <span>⇥</span> Terminar sessão
          </button>
        </div>
      </BottomSheet>

      {/* Suggestions reuse the existing panel */}
      {sheet === "suggestions" && (
        <SuggestionsPanel
          items={items}
          onAddItem={(type) => {
            onAddItem(type);
            close();
          }}
          onClose={close}
        />
      )}
    </div>
  );
}

export default MobileShell;
