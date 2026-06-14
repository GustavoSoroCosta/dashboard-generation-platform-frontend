import { useEffect, useRef } from "react";
import * as d3 from "d3";

function D3PieChart({ data, color, showTooltip, height = 260 }) {
  const containerRef = useRef();
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 300;
    const radius = Math.min(width, height) / 2 - 24;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    const baseHsl = d3.hsl(color);
    const colorScale = d3.scaleOrdinal()
      .domain(data.map((d) => d.name))
      .range(
        data.map((_, i) => {
          const h = (baseHsl.h + (i * 360) / data.length) % 360;
          return d3.hsl(h, 0.65, 0.55).toString();
        })
      );

    const pie = d3.pie().value((d) => d.value).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.42).outerRadius(radius);
    const arcHover = d3.arc().innerRadius(radius * 0.42).outerRadius(radius * 1.07);
    const total = d3.sum(data, (d) => d.value);

    const tooltip = d3.select(tooltipRef.current);

    g.selectAll(".slice")
      .data(pie(data))
      .join("path")
      .attr("class", "slice")
      .attr("d", arc)
      .attr("fill", (d) => colorScale(d.data.name))
      .attr("stroke", "var(--bg-card-solid, #111827)")
      .attr("stroke-width", 2)
      .style("cursor", showTooltip ? "pointer" : "default")
      .on("mouseover", showTooltip ? function (event, d) {
        d3.select(this).transition().duration(120).attr("d", arcHover);
        const pct = ((d.data.value / total) * 100).toFixed(1);
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.data.name}</strong><br/>${d.data.value} (${pct}%)`)
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY - 36}px`);
      } : null)
      .on("mouseout", showTooltip ? function () {
        d3.select(this).transition().duration(120).attr("d", arc);
        tooltip.style("opacity", 0);
      } : null);

    g.selectAll(".pie-label")
      .data(pie(data))
      .join("text")
      .attr("class", "pie-label d3-label")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text((d) => (d.endAngle - d.startAngle > 0.4 ? d.data.name : ""));

    const ro = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      if (newWidth && newWidth !== width) {
        svg.attr("width", newWidth);
        g.attr("transform", `translate(${newWidth / 2},${height / 2})`);
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [data, color, showTooltip, height]);

  return (
    <div ref={containerRef} className="chart-wrapper" style={{ position: "relative", height }}>
      <svg ref={svgRef} style={{ width: "100%", height, display: "block" }} />
      <div ref={tooltipRef} className="chart-tooltip" />
    </div>
  );
}

export default D3PieChart;
