import { useEffect, useState } from "react";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { useMediaQuery } from "./hooks/useMediaQuery.js";
import LoginPage from "./components/LoginPage.jsx";
import Sidebar from "./components/Sidebar.jsx";
import EmptyState from "./components/EmptyState.jsx";
import DashboardItem from "./components/DashboardItem.jsx";
import MobileShell from "./components/MobileShell.jsx";
import { getDatasets, getDashboard, saveDashboard, logout as apiLogout } from "./services/api.js";

const AUTH_KEY = "dashboard-auth";

const DEFAULT_COLORS = {
  bar: "#7c3aed",
  line: "#a855f7",
  area: "#6366f1",
  pie: "#7c3aed",
  table: "#7c3aed",
  kpi: "#7c3aed",
};

const DEFAULT_TITLES = {
  bar: "Novo gráfico de barras",
  line: "Novo gráfico de linha",
  area: "Novo gráfico de área",
  pie: "Novo gráfico circular",
  table: "Nova tabela",
  kpi: "Novo KPI",
};

function createNewItem(type, datasetKey) {
  return {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    title: DEFAULT_TITLES[type] || "Novo componente",
    type,
    datasetKey: datasetKey || "vendas",
    color: DEFAULT_COLORS[type] || "#7c3aed",
    showTooltip: true,
  };
}

function DashboardApp() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(AUTH_KEY)) || null; }
    catch { return null; }
  });

  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [datasetOptions, setDatasetOptions] = useState([]);
  const [showClearModal, setShowClearModal] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Load datasets + the saved dashboard once a user is authenticated.
  useEffect(() => {
    if (!user) return;
    let active = true;

    getDatasets()
      .then((opts) => active && setDatasetOptions(opts))
      .catch(() => active && setDatasetOptions([]));

    getDashboard()
      .then((saved) => { if (active) setItems(Array.isArray(saved) ? saved : []); })
      .catch(() => {})
      .finally(() => { if (active) setLoaded(true); });

    return () => { active = false; };
  }, [user]);

  // Persist the dashboard whenever it changes, debounced so rapid edits
  // (and a future backend) aren't hammered on every keystroke.
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => { saveDashboard(items).catch(() => {}); }, 500);
    return () => clearTimeout(timer);
  }, [items, loaded]);

  function handleLogin(userData) {
    setUser(userData);
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  }

  function handleLogout() {
    apiLogout();
    setUser(null);
    setItems([]);
    setLoaded(false);
    sessionStorage.removeItem(AUTH_KEY);
  }

  const addItem = (type) =>
    setItems((prev) => [...prev, createNewItem(type, datasetOptions[0]?.key)]);
  const removeItem = (id) => setItems((prev) => prev.filter((item) => item.id !== id));
  const updateItem = (id, changes) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  function moveItemUp(index) {
    if (index === 0) return;
    setItems((prev) => {
      const u = [...prev];
      [u[index - 1], u[index]] = [u[index], u[index - 1]];
      return u;
    });
  }

  function moveItemDown(index) {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const u = [...prev];
      [u[index], u[index + 1]] = [u[index + 1], u[index]];
      return u;
    });
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      {isMobile ? (
        <MobileShell
          items={items}
          loading={!loaded}
          datasetOptions={datasetOptions}
          user={user}
          onAddItem={addItem}
          onRemove={removeItem}
          onMoveUp={moveItemUp}
          onMoveDown={moveItemDown}
          onUpdate={updateItem}
          onClearDashboard={() => setShowClearModal(true)}
          onLogout={handleLogout}
        />
      ) : (
        <div className="app-shell">
          <Sidebar
            onAddItem={addItem}
            onClearDashboard={() => setShowClearModal(true)}
            totalItems={items.length}
            items={items}
            user={user}
            onLogout={handleLogout}
          />

          <main className="main-content">
            <div className="page-header">
              <h1>Meu Dashboard</h1>
              <p>Interface configurável para visualização dinâmica de dados com componentes independentes.</p>
            </div>

            {!loaded ? (
              <div className="dashboard-loading">
                <div className="loading-spinner" />
                <p className="loading-text">A carregar o teu dashboard...</p>
              </div>
            ) : items.length === 0 ? (
              <EmptyState onAddItem={addItem} />
            ) : (
              <section className="dashboard-grid">
                {items.map((item, index) => (
                  <DashboardItem
                    key={item.id}
                    item={item}
                    datasetOptions={datasetOptions}
                    onRemove={() => removeItem(item.id)}
                    onMoveUp={() => moveItemUp(index)}
                    onMoveDown={() => moveItemDown(index)}
                    onUpdate={updateItem}
                    canMoveUp={index > 0}
                    canMoveDown={index < items.length - 1}
                  />
                ))}
              </section>
            )}
          </main>
        </div>
      )}

      {showClearModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={() => setShowClearModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 id="modal-title">Limpar dashboard</h2>
            <p>Tens a certeza que queres remover todos os componentes do dashboard?</p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowClearModal(false)}>Cancelar</button>
              <button className="modal-confirm-btn" onClick={() => {
                setItems([]);
                setShowClearModal(false);
              }}>Limpar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <DashboardApp />
    </ThemeProvider>
  );
}

export default App;
