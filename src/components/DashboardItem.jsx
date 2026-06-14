import { useEffect, useMemo, useState } from "react";
import { getDataset } from "../services/api.js";
import { useMediaQuery } from "../hooks/useMediaQuery.js";
import D3BarChart from "./D3BarChart.jsx";
import D3LineChart from "./D3LineChart.jsx";
import D3AreaChart from "./D3AreaChart.jsx";
import D3PieChart from "./D3PieChart.jsx";

const TYPE_LABELS = {
  bar: "Barras",
  line: "Linha",
  area: "Área",
  pie: "Circular",
  table: "Tabela",
  kpi: "KPI",
};

function DashboardItem({
  item,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdate,
  canMoveUp,
  canMoveDown,
  datasetOptions,
  isDragging,
  isDragOver,
  onDragStartItem,
  onDragEnterItem,
  onDragEndItem,
  onDropItem,
}) {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const chartHeight = isMobile ? 210 : 260;
  const canReorder = typeof onDragStartItem === "function";

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getDataset(item.datasetKey);
        if (active) setDatasetInfo(result);
      } catch {
        if (active) {
          setDatasetInfo(null);
          setError("Não foi possível carregar os dados.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [item.datasetKey]);

  const data = useMemo(() => datasetInfo?.data || [], [datasetInfo]);
  const datasetLabel = datasetInfo?.label || "Sem dados";
  const datasetDescription = datasetInfo?.description || "Sem descrição disponível.";
  const { kpiValue, kpiMax, kpiMin, kpiCount } = useMemo(() => {
    const values = data.map((e) => e.value);
    return {
      kpiValue: values.reduce((sum, v) => sum + v, 0),
      kpiMax: values.length ? Math.max(...values) : 0,
      kpiMin: values.length ? Math.min(...values) : 0,
      kpiCount: values.length,
    };
  }, [data]);

  function renderContent() {
    if (loading) return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p className="loading-text">A carregar dados...</p>
      </div>
    );

    if (error) return (
      <div className="error-state">
        <span>⚠</span>
        <p>{error}</p>
      </div>
    );

    if (item.type === "bar") {
      return <D3BarChart data={data} color={item.color} showTooltip={item.showTooltip} height={chartHeight} />;
    }
    if (item.type === "line") {
      return <D3LineChart data={data} color={item.color} showTooltip={item.showTooltip} height={chartHeight} />;
    }
    if (item.type === "area") {
      return <D3AreaChart data={data} color={item.color} showTooltip={item.showTooltip} height={chartHeight} />;
    }
    if (item.type === "pie") {
      return <D3PieChart data={data} color={item.color} showTooltip={item.showTooltip} height={chartHeight} />;
    }
    if (item.type === "table") {
      return (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Período</th><th>Valor</th></tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr key={entry.name}>
                  <td>{entry.name}</td>
                  <td>{entry.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (item.type === "kpi") {
      return (
        <div className="kpi-card">
          <p className="kpi-label">{datasetLabel}</p>
          <h2 className="kpi-value">{kpiValue.toLocaleString("pt-PT")}</h2>
          <span className="kpi-helper">Valor agregado do dataset selecionado</span>
          <div className="kpi-stats">
            <div className="kpi-stat">
              <span className="kpi-stat-label">Máx</span>
              <span className="kpi-stat-value">{kpiMax.toLocaleString("pt-PT")}</span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Mín</span>
              <span className="kpi-stat-value">{kpiMin.toLocaleString("pt-PT")}</span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Pontos</span>
              <span className="kpi-stat-value">{kpiCount}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  const showColorPicker = item.type === "bar" || item.type === "line" || item.type === "area" || item.type === "pie";

  return (
    <article
      className={`dashboard-card${isDragging ? " is-dragging" : ""}${isDragOver ? " is-drag-over" : ""}`}
      role="region"
      aria-label={item.title}
      draggable={canReorder && !editMode}
      onDragStart={canReorder ? onDragStartItem : undefined}
      onDragEnter={canReorder ? onDragEnterItem : undefined}
      onDragOver={canReorder ? (e) => e.preventDefault() : undefined}
      onDragEnd={canReorder ? onDragEndItem : undefined}
      onDrop={canReorder ? (e) => { e.preventDefault(); onDropItem?.(); } : undefined}
    >
      <div className="card-actions-top">
        {canReorder && (
          <span className="drag-handle" title="Arrastar para reordenar" aria-hidden="true">⠿</span>
        )}
        <button className="icon-btn" onClick={() => setEditMode((v) => !v)} title="Editar" aria-label="Editar componente">✎</button>
        <button className="icon-btn" onClick={onMoveUp} disabled={!canMoveUp} title="Mover para cima" aria-label="Mover para cima">↑</button>
        <button className="icon-btn" onClick={onMoveDown} disabled={!canMoveDown} title="Mover para baixo" aria-label="Mover para baixo">↓</button>
        <button className="icon-btn danger-icon" onClick={onRemove} title="Remover" aria-label="Remover componente">×</button>
      </div>

      <div className="card-header">
        <div className="card-header-top">
          <h3>{item.title}</h3>
          <span className="component-badge">{TYPE_LABELS[item.type] || item.type}</span>
        </div>
        <p className="card-dataset-label">Dataset: {datasetLabel}</p>
        <p className="card-dataset-description">{datasetDescription}</p>
      </div>

      {editMode && (
        <div className="edit-panel">
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Tipo de componente</label>
            <select value={item.type} onChange={(e) => onUpdate(item.id, { type: e.target.value })}>
              <option value="bar">Gráfico de barras</option>
              <option value="line">Gráfico de linha</option>
              <option value="area">Gráfico de área</option>
              <option value="pie">Gráfico circular</option>
              <option value="table">Tabela</option>
              <option value="kpi">KPI Card</option>
            </select>
          </div>
          <div className="form-group">
            <label>Dataset</label>
            <select
              value={item.datasetKey}
              onChange={(e) => onUpdate(item.id, { datasetKey: e.target.value })}
            >
              {datasetOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
          {showColorPicker && (
            <>
              <div className="form-group">
                <label>Cor</label>
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => onUpdate(item.id, { color: e.target.value })}
                />
              </div>
              <div className="form-checkbox">
                <input
                  id={`tooltip-${item.id}`}
                  type="checkbox"
                  checked={item.showTooltip}
                  onChange={(e) => onUpdate(item.id, { showTooltip: e.target.checked })}
                />
                <label htmlFor={`tooltip-${item.id}`}>Mostrar tooltip</label>
              </div>
            </>
          )}
        </div>
      )}

      <div className="card-content">{renderContent()}</div>
    </article>
  );
}

export default DashboardItem;
