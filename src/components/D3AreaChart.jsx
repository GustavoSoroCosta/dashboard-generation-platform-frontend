import { useEffect, useRef } from "react";
import * as d3 from "d3";

function D3AreaChart({ data, color, showTooltip, height = 260 }) {
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

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // Gradient definition
    const gradientId = `area-grad-${Math.random().toString(36).slice(2, 8)}`;
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.45);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.02);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(data.map((d) => d.name))
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) * 1.15])
      .range([innerHeight, 0]);

    // Grid
    g.append("g")
      .attr("class", "d3-grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(""))
      .call((g) => g.select(".domain").remove());

    // Axes
    g.append("g")
      .attr("class", "d3-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "d3-axis")
      .call(d3.axisLeft(y).ticks(5));

    // Area path (gradient fill)
    const area = d3.area()
      .x((d) => x(d.name))
      .y0(innerHeight)
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("d", area)
      .attr("fill", `url(#${gradientId})`);

    // Line on top of area
    const line = d3.line()
      .x((d) => x(d.name))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2.5);

    // Tooltip & dots
    const tooltip = d3.select(tooltipRef.current);

    g.selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.name))
      .attr("cy", (d) => y(d.value))
      .attr("r", 4)
      .attr("fill", color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", showTooltip ? "pointer" : "default")
      .on("mouseover", showTooltip ? function (event, d) {
        d3.select(this).attr("r", 7);
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.name}</strong><br/>${d.value}`)
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY - 36}px`);
      } : null)
      .on("mouseout", showTooltip ? function () {
        d3.select(this).attr("r", 4);
        tooltip.style("opacity", 0);
      } : null);

    const ro = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      if (newWidth && newWidth !== width) {
        svg.attr("width", newWidth);
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

export default D3AreaChart;
