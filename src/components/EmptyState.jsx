function EmptyState({ onAddItem }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📊</div>
      <h2>Dashboard vazio</h2>
      <p>Escolhe um componente abaixo para começar a construir o teu dashboard.</p>
      <div className="empty-state-actions">
        <button className="primary-btn empty-quick-btn" onClick={() => onAddItem("bar")}>▦ Gráfico de Barras</button>
        <button className="primary-btn empty-quick-btn" onClick={() => onAddItem("kpi")}>◈ KPI Card</button>
        <button className="primary-btn empty-quick-btn" onClick={() => onAddItem("pie")}>◔ Circular</button>
      </div>
    </div>
  );
}

export default EmptyState;
