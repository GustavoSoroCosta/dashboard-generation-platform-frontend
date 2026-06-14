import { useEffect, useRef } from "react";
import * as d3 from "d3";

function D3BarChart({ data, color, showTooltip, height = 260 }) {
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

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.35);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) * 1.15])
      .range([innerHeight, 0]);

    g.append("g")
      .attr("class", "d3-grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(""))
      .call((g) => g.select(".domain").remove());

    g.append("g")
      .attr("class", "d3-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "d3-axis")
      .call(d3.axisLeft(y).ticks(5));

    const tooltip = d3.select(tooltipRef.current);

    const reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bars = g.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.name))
      .attr("width", x.bandwidth())
      .attr("fill", color)
      .attr("rx", 6)
      .style("cursor", showTooltip ? "pointer" : "default")
      .on("mouseover", showTooltip ? function (event, d) {
        d3.select(this).attr("opacity", 0.75);
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.name}</strong><br/>${d.value}`)
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY - 36}px`);
      } : null)
      .on("mousemove", showTooltip ? function (event) {
        tooltip
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY - 36}px`);
      } : null)
      .on("mouseout", showTooltip ? function () {
        d3.select(this).attr("opacity", 1);
        tooltip.style("opacity", 0);
      } : null);

    if (reduceMotion) {
      bars.attr("y", (d) => y(d.value)).attr("height", (d) => innerHeight - y(d.value));
    } else {
      bars.attr("y", innerHeight).attr("height", 0)
        .transition().duration(650).delay((d, i) => i * 55).ease(d3.easeCubicOut)
        .attr("y", (d) => y(d.value))
        .attr("height", (d) => innerHeight - y(d.value));
    }

    const ro = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      if (newWidth && newWidth !== width) {
        svg.attr("width", newWidth);
        x.range([0, newWidth - margin.left - margin.right]);
        g.selectAll(".bar")
          .attr("x", (d) => x(d.name))
          .attr("width", x.bandwidth());
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

export default D3BarChart;
