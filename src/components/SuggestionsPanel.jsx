function generateSuggestions(items) {
  const types = items.map((i) => i.type);
  const suggestions = [];

  if (items.length === 0) {
    suggestions.push({
      type: "bar",
      icon: "▦",
      title: "Começa com um gráfico de barras",
      desc: "Um bom ponto de partida para comparar valores.",
    });
    suggestions.push({
      type: "kpi",
      icon: "◎",
      title: "Adiciona um KPI Card",
      desc: "Mostra uma métrica chave em destaque.",
    });
    suggestions.push({
      type: "line",
      icon: "∿",
      title: "Gráfico de linha",
      desc: "Visualiza tendências ao longo do tempo.",
    });
    suggestions.push({
      type: "table",
      icon: "▤",
      title: "Tabela de dados",
      desc: "Explora os dados em detalhe, linha a linha.",
    });
    return suggestions;
  }

  if (!types.includes("kpi")) {
    suggestions.push({
      type: "kpi",
      icon: "◎",
      title: "Adiciona um KPI Card",
      desc: "Já tens dados — destaca o valor total num card.",
    });
  }

  if (!types.includes("bar")) {
    suggestions.push({
      type: "bar",
      icon: "▦",
      title: "Gráfico de barras",
      desc: "Compara valores entre categorias de forma visual.",
    });
  }

  if (!types.includes("line")) {
    suggestions.push({
      type: "line",
      icon: "∿",
      title: "Gráfico de linha",
      desc: "Visualiza a evolução temporal dos teus dados.",
    });
  }

  if (!types.includes("area")) {
    suggestions.push({
      type: "area",
      icon: "⬟",
      title: "Gráfico de Área",
      desc: "Visualiza volume e tendência com área preenchida.",
    });
  }

  if (!types.includes("pie")) {
    suggestions.push({
      type: "pie",
      icon: "◔",
      title: "Gráfico circular",
      desc: "Mostra a proporção entre categorias.",
    });
  }

  if (!types.includes("table")) {
    suggestions.push({
      type: "table",
      icon: "▤",
      title: "Tabela de dados",
      desc: "Explora todos os registos de um dataset.",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: "bar",
      icon: "▦",
      title: "Duplicar gráfico de barras",
      desc: "Compara dois datasets diferentes lado a lado.",
    });
    suggestions.push({
      type: "line",
      icon: "∿",
      title: "Duplicar gráfico de linha",
      desc: "Acompanha duas tendências em simultâneo.",
    });
  }

  return suggestions.slice(0, 4);
}

function SuggestionsPanel({ items, onAddItem, onClose }) {
  const suggestions = generateSuggestions(items);

  return (
    <div className="suggestions-overlay" onClick={onClose}>
      <div className="suggestions-panel" onClick={(e) => e.stopPropagation()}>
        <div className="suggestions-header">
          <h3>Sugestões</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar sugestões">
            ×
          </button>
        </div>
        <p className="suggestions-desc">
          Componentes recomendados com base no teu dashboard atual.
        </p>
        <div className="suggestions-list">
          {suggestions.map((s, i) => (
            <div key={i} className="suggestion-card">
              <div className="suggestion-icon">{s.icon}</div>
              <div className="suggestion-body">
                <p className="suggestion-title">{s.title}</p>
                <p className="suggestion-text">{s.desc}</p>
              </div>
              <button
                className="suggestion-add-btn"
                onClick={() => onAddItem(s.type)}
                aria-label={`Adicionar ${s.title}`}
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SuggestionsPanel;
