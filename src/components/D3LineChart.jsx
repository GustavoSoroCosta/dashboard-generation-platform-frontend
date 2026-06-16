import { useEffect, useRef } from "react";
import * as d3 from "d3";

function D3LineChart({ data, color, showTooltip, height = 260 }) {
  const containerRef = useRef();
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 300;
    const margin = { top: 12, right: 12, bottom: 32, left: 48 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(data.map((d) => d.name)).range([0, innerWidth]);
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.value) * 1.15]).range([innerHeight, 0]);

    g.append("g")
      .attr("class", "d3-grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(""))
      .call((g) => g.select(".domain").remove());

    g.append("g")
      .attr("class", "d3-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    g.append("g").attr("class", "d3-axis").call(d3.axisLeft(y).ticks(5));

    const area = d3.area().x((d) => x(d.name)).y0(innerHeight).y1((d) => y(d.value)).curve(d3.curveMonotoneX);
    const areaPath = g.append("path").datum(data).attr("d", area).attr("fill", color).attr("opacity", 0.15);

    const line = d3.line().x((d) => x(d.name)).y((d) => y(d.value)).curve(d3.curveMonotoneX);
    const linePath = g.append("path").datum(data).attr("d", line)
      .attr("fill", "none").attr("stroke", color).attr("stroke-width", 3);

    const tooltip = d3.select(tooltipRef.current);

    const dots = g.selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.name))
      .attr("cy", (d) => y(d.value))
      .attr("r", 5)
      .attr("fill", "#fff")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .style("cursor", showTooltip ? "pointer" : "default")
      .on("mouseover", showTooltip ? function (event, d) {
        d3.select(this).attr("r", 8);
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.name}</strong><br/>${d.value}`)
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY - 36}px`);
      } : null)
      .on("mouseout", showTooltip ? function () {
        d3.select(this).attr("r", 5);
        tooltip.style("opacity", 0);
      } : null);

    if (!reduceMotion) {
      const total = linePath.node().getTotalLength();
      linePath.attr("stroke-dasharray", total).attr("stroke-dashoffset", total)
        .transition().duration(900).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0);
      areaPath.attr("opacity", 0).transition().delay(250).duration(600).attr("opacity", 0.15);
      dots.attr("opacity", 0).transition().delay(750).duration(350).attr("opacity", 1);
    }

    const ro = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      if (newWidth && newWidth !== width) svg.attr("width", newWidth);
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

export default D3LineChart;
