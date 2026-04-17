import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { Brain, ArrowLeft } from "lucide-react";
import * as d3 from "d3";

const COLORS = {
  gap: "#EF476F",
  partial: "#FFD166",
  mastered: "#06D6A0",
  default: "#C8B6FF",
};

const SUBJECT_COLORS = {
  mathematics: "#FFD166",
  science: "#06D6A0",
};

export default function KnowledgeGraphPage() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { concepts, mastery, setConcepts, setMastery } = useAppStore();
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentGrade, setStudentGrade] = useState(null);
  const [filterSubject, setFilterSubject] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, mRes] = await Promise.all([
          api.get("/knowledge-graph"),
          api.get("/knowledge-graph/mastery").catch(() => ({ data: { mastery: [] } })),
        ]);
        setConcepts(cRes.data.concepts || []);
        setMastery(mRes.data.mastery || []);
        if (cRes.data.student_grade) setStudentGrade(cRes.data.student_grade);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [setConcepts, setMastery]);

  useEffect(() => {
    if (!concepts.length || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 600;
    const masteryMap = {};
    mastery.forEach((m) => { masteryMap[m.concept_id] = m.score; });

    const getColor = (id) => {
      const score = masteryMap[id];
      if (score === undefined) return COLORS.default;
      if (score >= 70) return COLORS.mastered;
      if (score >= 40) return COLORS.partial;
      return COLORS.gap;
    };

    // Filter by subject if selected
    const filteredConcepts = filterSubject === "all"
      ? concepts
      : concepts.filter((c) => c.subject === filterSubject);

    const nodes = filteredConcepts.map((c) => ({
      id: c.id, name: c.name, subject: c.subject, grade: c.grade,
      score: masteryMap[c.id]
    }));

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = [];
    filteredConcepts.forEach((c) => {
      (c.prerequisites || []).forEach((p) => {
        if (nodeIds.has(p)) {
          links.push({ source: p, target: c.id });
        }
      });
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g");

    // Zoom
    const zoom = d3.zoom().scaleExtent([0.3, 3]).on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Links
    const link = g.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", "#94a3b8").attr("stroke-width", 2).attr("stroke-opacity", 0.5)
      .attr("marker-end", "url(#arrow)");

    // Arrow marker
    svg.append("defs").append("marker").attr("id", "arrow").attr("viewBox", "0 0 10 10")
      .attr("refX", 20).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6)
      .attr("orient", "auto-start-reverse")
      .append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "#94a3b8");

    // Nodes
    const node = g.append("g").selectAll("g").data(nodes).join("g")
      .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    node.append("circle")
      .attr("r", 18)
      .attr("fill", (d) => getColor(d.id))
      .attr("stroke", (d) => SUBJECT_COLORS[d.subject] || "#0F172A")
      .attr("stroke-width", 3)
      .style("cursor", "pointer");

    node.append("text")
      .text((d) => d.name.length > 10 ? d.name.slice(0, 10) + "..." : d.name)
      .attr("text-anchor", "middle")
      .attr("dy", 32)
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .attr("fill", "#0F172A")
      .attr("font-family", "Nunito, sans-serif");

    // Grade label below name
    node.append("text")
      .text((d) => d.grade?.replace("class_", "Cl.") || "")
      .attr("text-anchor", "middle")
      .attr("dy", 44)
      .attr("font-size", "9px")
      .attr("fill", "#64748B")
      .attr("font-family", "Nunito, sans-serif");

    node.on("click", (event, d) => {
      setSelected({ ...d, mastery_score: masteryMap[d.id] });
    });

    simulation.on("tick", () => {
      link.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event) { if (!event.active) simulation.alphaTarget(0.3).restart(); event.subject.fx = event.subject.x; event.subject.fy = event.subject.y; }
    function dragged(event) { event.subject.fx = event.x; event.subject.fy = event.y; }
    function dragended(event) { if (!event.active) simulation.alphaTarget(0); event.subject.fx = null; event.subject.fy = null; }

    return () => simulation.stop();
  }, [concepts, mastery]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="knowledge-graph-page">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-[#334155] hover:text-[#0F172A]" data-testid="kg-back-link">
            <ArrowLeft className="w-5 h-5" /> Dashboard
          </Link>
          <h1 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <Brain className="w-5 h-5 inline mr-1" /> Knowledge Graph
            {studentGrade && (
              <span className="ml-2 text-xs font-bold text-[#118AB2] bg-[#118AB2]/10 px-2 py-0.5 rounded-full border border-[#118AB2]">
                {studentGrade.replace("_", " ")}
              </span>
            )}
          </h1>
          {/* Subject filter */}
          <div className="flex gap-2">
            {["all", "mathematics", "science"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterSubject(s)}
                className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all ${
                  filterSubject === s
                    ? s === "mathematics" ? "bg-[#FFD166] border-[#0F172A]"
                    : s === "science" ? "bg-[#06D6A0]/30 border-[#0F172A]"
                    : "bg-[#0F172A] text-white border-[#0F172A]"
                    : "bg-white border-[#e2e8f0] text-[#64748B]"
                }`}
              >
                {s === "all" ? "All" : s === "mathematics" ? "Math" : "Science"}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main id="main-content" className="relative" ref={containerRef} style={{ height: 'calc(100vh - 56px)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <svg ref={svgRef} className="w-full h-full" data-testid="knowledge-graph-svg" />

            {/* Legend */}
            <div className="absolute top-4 left-4 neura-card p-4 space-y-2" data-testid="kg-legend">
              <p className="font-bold text-sm text-[#0F172A]">Mastery Level</p>
              {[
                { color: COLORS.mastered, label: "Mastered (70%+)" },
                { color: COLORS.partial, label: "Partial (40-69%)" },
                { color: COLORS.gap, label: "Gap (<40%)" },
                { color: COLORS.default, label: "Not attempted" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-[#0F172A]" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-semibold text-[#334155]">{item.label}</span>
                </div>
              ))}
              <div className="border-t border-[#e2e8f0] pt-2 mt-2">
                <p className="font-bold text-xs text-[#0F172A] mb-1">Subject (border)</p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-[3px]" style={{ borderColor: SUBJECT_COLORS.mathematics, backgroundColor: 'white' }} />
                  <span className="text-xs text-[#334155]">Mathematics</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 rounded-full border-[3px]" style={{ borderColor: SUBJECT_COLORS.science, backgroundColor: 'white' }} />
                  <span className="text-xs text-[#334155]">Science</span>
                </div>
              </div>
              <p className="text-xs text-[#94a3b8] pt-1">{concepts.length} concepts shown</p>
            </div>

            {/* Selected concept detail */}
            {selected && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 neura-card p-5" data-testid="kg-concept-detail">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>{selected.name}</h3>
                  <button onClick={() => setSelected(null)} className="text-[#64748B] hover:text-[#0F172A]" data-testid="kg-close-detail" aria-label="Close detail">
                    &times;
                  </button>
                </div>
                <div className="space-y-1 text-sm text-[#334155]">
                  <p><span className="font-bold">Subject:</span> {selected.subject}</p>
                  <p><span className="font-bold">Grade:</span> {selected.grade?.replace("_", " ")}</p>
                  <p><span className="font-bold">Mastery:</span> {selected.mastery_score !== undefined ? `${selected.mastery_score}%` : 'Not attempted'}</p>
                </div>
                <Link to={`/lesson/lesson_${selected.id?.replace("math_", "").replace("sci_", "")}_1`}>
                  <button className="neura-btn bg-[#118AB2] text-white w-full mt-3 text-sm h-10" data-testid="kg-start-lesson-btn">
                    Start Lesson
                  </button>
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
