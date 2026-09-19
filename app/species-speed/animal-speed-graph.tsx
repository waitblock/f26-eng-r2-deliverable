/* eslint-disable */
"use client";
import { useRef, useEffect, useState  } from "react";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis"; // D3 is a JavaScript library for data visualization: https://d3js.org/
import { csv } from "d3-fetch";

// Example data: Only the first three rows are provided as an example
// Add more animals or change up the style as you desire

interface AnimalDatum  {
  id: number;
  name: string;
  diet: string;
  speed: number;
}


export default function AnimalSpeedGraph() {
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  useEffect(() => {
    csv("/sample_animals.csv").then((rows) => {
      const parsedData = rows.map((row) => ({
        id: Number(row.ID),
        name: row.name ?? "",
        speed: Number(row.speed),
        diet: row.diet ?? "unknown",
      }));
    setAnimalData(parsedData);
  });
  }, []);

    const diets = ["carnivore", "herbivore", "omnivore"];

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (animalData.length === 0) return;

    // Set up chart dimensions and margins
    const containerWidth = graphRef.current?.clientWidth ?? 800;
    const containerHeight = graphRef.current?.clientHeight ?? 500;

    // Set up chart dimensions and margins
    const width = Math.max(containerWidth, 600); // Minimum width of 600px
    const height = Math.max(containerHeight, 400); // Minimum height of 400px
    const margin = { top: 70, right: 60, bottom: 160, left: 100 };

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    const svg = select(graphRef.current!).append<SVGSVGElement>("svg").attr("width", width).attr("height", height);

    // https://github.com/d3/d3-scale#band-scales
    // https://github.com/d3/d3-scale#linear-scales
    // https://github.com/d3/d3-scale#ordinal-scales
    // https://github.com/d3/d3-axis

    const sortedData = [...animalData].sort((a, b) => a.diet.localeCompare(b.diet) || b.speed - a.speed);
    const displayedData = sortedData.filter((_, index) => index % 3 === 1);

    const xScale = scaleBand<number>(
      displayedData.map((animal) => animal.id),
      [margin.left, width - margin.right],
    ).padding(0.2);

    const yScale = scaleLinear(
      [0, max(animalData, animal => animal.speed) ?? 0],
      [height - margin.bottom, margin.top]);

    const colorScale = scaleOrdinal(diets, ["#ef4444", "#22c55e", "#3b82f6"]);

    svg
      .selectAll("rect")
      .data(displayedData)
      .join("rect")
      .attr("x", (animal) => xScale(animal.id)!)
      .attr("y", (animal) => yScale(animal.speed))
      .attr("width", xScale.bandwidth())
      .attr("height", (animal) => yScale(0) - yScale(animal.speed))
      .attr("fill", (animal) => colorScale(animal.diet))
      .append("title")
      .text(animal => `${animal.name}: ${animal.speed} km/h`);

    const namesById = new Map(sortedData.map((animal) => [animal.id, animal.name]));

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(axisBottom(xScale).tickFormat((id) => namesById.get(id) ?? ""))
      .style("font-size", "10px")
      .selectAll("text")
      .attr("transform", "rotate(-60)")
      .attr("text-anchor", "end")
      .attr("dx", "-0.6em")
      .attr("dy", "0.2em");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(axisLeft(yScale))
      .style("font-size", "14px");

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right - 120}, ${margin.top})`);

    legend
      .selectAll("rect")
      .data(diets)
      .join("rect")
      .attr("x", 0)
      .attr("y", (_, index) => index * 24)
      .attr("width", 14)
      .attr("height", 14)
      .attr("fill", (diet) => colorScale(diet));

    legend
      .selectAll("text")
      .data(diets)
      .join("text")
      .attr("x", 22)
      .attr("y", (_, index) => index * 24 + 12)
      .attr("font-size", "14px")
      .text((diet) => diet.charAt(0).toUpperCase() + diet.slice(1));

    svg.append("text")
      .attr("x", (margin.left + width - margin.right) / 2)
      .attr("y", height-40)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .text("Animal");

    svg.append("text")
      .attr(
        "transform",
        `translate(25, ${(margin.top + height - margin.bottom) / 2}) rotate(-90)`
      )
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .text("Speed (km/h)");
  }, [animalData]);

  return (
    <div className="w-full">
      <h1 className="mb-4 text-2xl font-bold">Animal Speeds</h1>
      <div
        ref={graphRef}
        className="h-[600px] w-full"

      />
    </div>
  );
}
