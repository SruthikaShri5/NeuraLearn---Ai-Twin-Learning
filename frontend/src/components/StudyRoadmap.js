import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useAppStore } from "@/lib/store";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { X, Maximize2, Minimize2 } from "lucide-react";

/**
 * Personalized Study Roadmap - D3 skill tree (Group C #13)
 * Interactive vertical skill tree showing concept progression per subject.
 * Nodes coloured by mastery. Click to navigate to lesson.
 */

const SUBJECT_PATHS = {
  mathematics: {
    color: "#F59E0B",
    nodes: [
      { id: "math_addition",       label: "Addition",         grade: 1, x: 0 },
      { id: "math_subtraction",    label: "Subtraction",      grade: 1, x: 1 },
      { id: "math_multiplication", label: "Multiplication",   grade: 2, x: 0 },
      { id: "math_division",       label: "Division",         grade: 2, x: 1 },
      { id: "math_fractions",      label: "Fractions",        grade: 3, x: 0 },
      { id: "math_decimals",       label: "Decimals",         grade: 4, x: 1 },
      { id: "math_percentages",    label: "Percentages",      grade: 5, x: 0 },
      { id: "math_algebra_basics", label: "Algebra",          grade: 6, x: 1 },
      { id: "math_geometry_basics","label": "Geometry",       grade: 5, x: 2 },
      { id: "math_linear_equations","label":"Linear Eq.",     grade: 7, x: 0 },
      { id: "math_triangles",      label: "Triangles",        grade: 7, x: 2 },
      { id: "math_quadratic",      label: "Quadratics",       grade: 9, x: 0 },
      { id: "math_trigonometry",   label: "Trigonometry",     grade: 10, x: 1 },
      { id: "math_statistics",     label: "Statistics",       grade: 8, x: 2 },
      { id: "math_probability",    label: "Probability",      grade: 8, x: 3 },
      { id: "math_derivatives",    label: "Derivatives",      grade: 12, x: 0 },
      { id: "math_integrals",      label: "Integrals",        grade: 12, x: 1 },
    ],
    edges: [
      ["math_addition","math_multiplication"],["math_subtraction","math_division"],
      ["math_multiplication","math_fractions"],["math_division","math_fractions"],
      ["math_fractions","math_decimals"],["math_decimals","math_percentages"],
      ["math_percentages","math_algebra_basics"],["math_algebra_basics","math_linear_equations"],
      ["math_linear_equations","math_quadratic"],["math_quadratic","math_derivatives"],
      ["math_derivatives","math_integrals"],["math_geometry_basics","math_triangles"],
      ["math_triangles","math_trigonometry"],["math_fractions","math_statistics"],
      ["math_statistics","math_probability"],
    ],
  },
  science: {
    color: "#10B981",
    nodes: [
      { id: "sci_matter",          label: "Matter",           grade: 1, x: 0 },
      { id: "sci_living_things",   label: "Living Things",    grade: 1, x: 1 },
      { id: "sci_plants",          label: "Plants",           grade: 3, x: 1 },
      { id: "sci_animals",         label: "Animals",          grade: 3, x: 2 },
      { id: "sci_energy",          label: "Energy",           grade: 5, x: 0 },
      { id: "sci_force_motion",    label: "Force & Motion",   grade: 4, x: 0 },
      { id: "sci_electricity",     label: "Electricity",      grade: 6, x: 0 },
      { id: "sci_cells",           label: "Cells",            grade: 7, x: 1 },
      { id: "sci_photosynthesis",  label: "Photosynthesis",   grade: 7, x: 2 },
      { id: "sci_atoms",           label: "Atoms",            grade: 8, x: 0 },
      { id: "sci_chemical_reactions","label":"Chem Reactions",grade: 8, x: 1 },
      { id: "sci_newton_laws",     label: "Newton's Laws",    grade: 9, x: 0 },
      { id: "sci_periodic_table",  label: "Periodic Table",   grade: 9, x: 1 },
      { id: "sci_genetics",        label: "Genetics",         grade: 10, x: 2 },
      { id: "sci_organic_chem",    label: "Organic Chem",     grade: 11, x: 1 },
      { id: "sci_electromagnetism","label":"Electromagnetism",grade: 12, x: 0 },
      { id: "sci_quantum",         label: "Quantum",          grade: 12, x: 1 },
    ],
    edges: [
      ["sci_matter","sci_energy"],["sci_living_things","sci_plants"],["sci_living_things","sci_animals"],
      ["sci_plants","sci_cells"],["sci_animals","sci_cells"],["sci_cells","sci_photosynthesis"],
      ["sci_cells","sci_genetics"],["sci_energy","sci_force_motion"],["sci_force_motion","sci_electricity"],
      ["sci_electricity","sci_newton_laws"],["sci_matter","sci_atoms"],["sci_atoms","sci_chemical_reactions"],
      ["sci_chemical_reactions","sci_periodic_table"],["sci_chemical_reactions","sci_organic_chem"],
      ["sci_electricity","sci_electromagnetism"],["sci_atoms","sci_quantum"],
    ],
  },
};

export default function StudyRoadmap({ onClose, subject = "mathematics" }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { mastery } = useAppStore();
  const { isJunior, isSenior } = useGradeTheme();
  const [activeSubject, setActiveSubject] = useState(subject);
  const [selectedNode, setSelectedNode] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  const masteryMap = {};
  mastery.forEach((m) => { masteryMap[m.concept_id] = m.score; });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const path = SUBJECT_PATHS[activeSubject];
    if (!path) return;

    const W = containerRef.current.clientWidth || 500;
    const H = fullscreen ? window.innerHeight - 120 : 420;
    const GRADE_H = 60;
    const COL_W = 110;
    const GRADES = [...new Set(path.nodes.map((n) => n.grade))].sort((a, b) => a - b);
    const gradeY = {};
    GRADES.forEach((g, i) => { gradeY[g] = 40 + i * GRADE_H; });

    const nodePos = {};
    path.nodes.forEach((n) => {
      nodePos[n.id] = { x: 60 + n.x * COL_W, y: gradeY[n.grade] };
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", W).attr("height", H).attr("viewBox", `0 0 ${W} ${H}`);

    const bg = "#FAFAFA";
    const textCol = "#1A1A2E";
    const mutedCol = "#6B7280";
    const borderCol = isSenior ? "rgba(99,102,241,0.3)" : "#1A1A2E";

    svg.append("rect").attr("width", W).attr("height", H).attr("fill", bg);

    // Grade labels
    GRADES.forEach((g) => {
      svg.append("text")
        .attr("x", 8).attr("y", gradeY[g] + 5)
        .attr("font-size", "10px").attr("font-weight", "700")
        .attr("fill", mutedCol).attr("font-family", "Inter, sans-serif")
        .text(`Cl.${g}`);
      svg.append("line")
        .attr("x1", 30).attr("y1", gradeY[g]).attr("x2", W - 10).attr("y2", gradeY[g])
        .attr("stroke", isSenior ? "rgba(99,102,241,0.1)" : "#e5e7eb").attr("stroke-width", 1);
    });

    // Edges
    path.edges.forEach(([src, tgt]) => {
      const s = nodePos[src], t = nodePos[tgt];
      if (!s || !t) return;
      svg.append("path")
        .attr("d", `M${s.x},${s.y} C${s.x},${(s.y + t.y) / 2} ${t.x},${(s.y + t.y) / 2} ${t.x},${t.y}`)
        .attr("fill", "none")
        .attr("stroke", isSenior ? "rgba(99,102,241,0.3)" : "#d1d5db")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,3");
    });

    // Nodes
    const nodeG = svg.selectAll(".node").data(path.nodes).join("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${nodePos[d.id]?.x || 0},${nodePos[d.id]?.y || 0})`)
      .style("cursor", "pointer")
      .on("click", (_, d) => setSelectedNode(d));

    nodeG.append("circle")
      .attr("r", 18)
      .attr("fill", (d) => {
        const score = masteryMap[d.id];
        if (score === undefined) return "#F3F4F6";
        if (score >= 70) return "#10B981";
        if (score >= 40) return "#F59E0B";
        return "#EF4444";
      })
      .attr("stroke", (d) => {
        const score = masteryMap[d.id];
        if (score === undefined) return "#D1D5DB";
        if (score >= 70) return "#059669";
        if (score >= 40) return "#D97706";
        return "#DC2626";
      })
      .attr("stroke-width", 2);

    nodeG.append("text")
      .attr("text-anchor", "middle").attr("dy", 32)
      .attr("font-size", "9px").attr("font-weight", "700")
      .attr("fill", textCol).attr("font-family", "Inter, Nunito, sans-serif")
      .text((d) => d.label.length > 10 ? d.label.slice(0, 9) + "…" : d.label);

    // Score badge
    nodeG.filter((d) => masteryMap[d.id] !== undefined)
      .append("text")
      .attr("text-anchor", "middle").attr("dy", 5)
      .attr("font-size", "8px").attr("font-weight", "800")
      .attr("fill", "white").attr("font-family", "Inter, sans-serif")
      .text((d) => `${masteryMap[d.id]}%`);

    // Zoom
    const zoom = d3.zoom().scaleExtent([0.5, 2.5]).on("zoom", (e) => {
      svg.select("g.zoom-group").attr("transform", e.transform);
    });
    svg.call(zoom);

  }, [activeSubject, mastery, fullscreen, isSenior]); // eslint-disable-line react-hooks/exhaustive-deps

  const path = SUBJECT_PATHS[activeSubject];

  return (
    <div
      className={`fixed z-[100] neura-card flex flex-col ${
        fullscreen
          ? "inset-4"
          : "bottom-4 left-4 w-[520px] max-w-[95vw]"
      } ${"bg-white"}`}
      role="dialog"
      aria-label="Study Roadmap"
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${"border-[#E5E7EB]"}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: path?.color + "20", border: `1px solid ${path?.color}40` }}>
            <div className="w-3 h-3 rounded-full" style={{ background: path?.color }} />
          </div>
          <h2 className={`font-bold text-base ${"text-[#1A1A2E]"}`}
            style={{ fontFamily: isJunior ? "Fredoka, sans-serif" : "Space Grotesk, sans-serif" }}>
            {isJunior ? "🗺️ Your Learning Path" : "Study Roadmap"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Subject tabs */}
          {Object.keys(SUBJECT_PATHS).map((s) => (
            <button key={s} onClick={() => setActiveSubject(s)}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                activeSubject === s
                  ? isSenior ? "bg-indigo-600 text-white border-indigo-500" : "bg-[#1A1A2E] text-white border-[#1A1A2E]"
                  : isSenior ? "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]" : "bg-white text-[#374151] border-[#e5e7eb]"
              }`}>
              {s === "mathematics" ? (isJunior ? "Math" : "Math") : (isJunior ? "Science" : "Science")}
            </button>
          ))}
          <button onClick={() => setFullscreen((v) => !v)} className={`p-1.5 rounded-lg ${isSenior ? "hover:bg-[#F3F4F6] text-[#6B7280]" : "hover:bg-gray-100 text-[#6B7280]"}`}>
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#6B7280] hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2">
        {[
          { color: "#10B981", label: "Mastered (70%+)" },
          { color: "#F59E0B", label: "Partial (40-69%)" },
          { color: "#EF4444", label: "Gap (<40%)" },
          { color: "#F3F4F6", label: "Not started", border: "#D1D5DB" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border" style={{ background: l.color, borderColor: l.border || l.color }} />
            <span className={`text-[10px] font-medium ${"text-[#6B7280]"}`}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* SVG */}
      <div ref={containerRef} className="flex-1 overflow-auto">
        <svg ref={svgRef} className="w-full" />
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <div className={`p-3 border-t flex items-center justify-between gap-3 ${isSenior ? "border-indigo-500/20 bg-[#F3F4F6]/50" : "border-[#e5e7eb] bg-[#f8fafc]"}`}>
          <div>
            <p className={`font-bold text-sm ${"text-[#1A1A2E]"}`}>{selectedNode.label}</p>
            <p className={`text-xs ${"text-[#6B7280]"}`}>
              Class {selectedNode.grade} . {masteryMap[selectedNode.id] !== undefined ? `${masteryMap[selectedNode.id]}% mastery` : "Not attempted"}
            </p>
          </div>
          <a href={`/lesson/lesson_${selectedNode.id.replace("math_","").replace("sci_","")}_1`}
            className={`neura-btn text-xs h-8 px-3 ${isSenior ? "bg-indigo-600 text-white border-indigo-500" : "bg-[#118AB2] text-white"}`}>
            {isJunior ? "Go! 🚀" : "Start Lesson"}
          </a>
        </div>
      )}
    </div>
  );
}
