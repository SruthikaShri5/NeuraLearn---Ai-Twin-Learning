import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { Brain, ArrowLeft, RefreshCw } from "lucide-react";
import * as d3 from "d3";

const COLORS = {
  gap: "#EF476F",
  partial: "#FFD166",
  mastered: "#06D6A0",
  default: "#C8B6FF",
};

const SUBJECT_COLORS = {
  mathematics:      "#F59E0B",
  science:          "#10B981",
  evs:              "#06D6A0",
  english:          "#8B5CF6",
  social_studies:   "#F97316",
  physics:          "#3B82F6",
  chemistry:        "#EF4444",
  biology:          "#22C55E",
  computer_science: "#06B6D4",
  information_tech: "#0EA5E9",
};

const SUBJECT_LABELS = {
  mathematics:      "Math",
  science:          "Science",
  evs:              "EVS",
  english:          "English",
  social_studies:   "Social",
  physics:          "Physics",
  chemistry:        "Chemistry",
  biology:          "Biology",
  computer_science: "CS",
  information_tech: "IT",
};

export default function KnowledgeGraphPage() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { setConcepts, setMastery } = useAppStore();
  const { user } = useAuth();

  const [allConcepts, setAllConcepts] = useState([]);
  const [masteryMap, setMasteryMap] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentGrade, setStudentGrade] = useState(null);
  const [filterSubject, setFilterSubject] = useState("all");
  const [viewMode, setViewMode] = useState("current"); // "current" | "all"
  const [availableSubjects, setAvailableSubjects] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, mRes] = await Promise.all([
        api.get("/knowledge-graph"),
        api.get("/knowledge-graph/mastery").catch(() => ({ data: { mastery: [] } })),
      ]);

      const conceptsData = cRes.data.concepts || [];
      const grade = cRes.data.student_grade || user?.grade_level;
      setStudentGrade(grade);

      const mArr = mRes.data.mastery || [];
      const mMap = {};
      mArr.forEach((m) => { mMap[m.concept_id] = m.score; });
      setMasteryMap(mMap);
      setMastery(mArr);

      setAllConcepts(conceptsData);
      setConcepts(conceptsData);

      const gradeSubjects = [...new Set(
        conceptsData
          .filter((c) => c.grade === grade)
          .map((c) => c.subject)
          .filter(Boolean)
      )];
      setAvailableSubjects(gradeSubjects);
      setFilterSubject("all");
    } catch {
      // silently fail — graph shows empty state
    } finally {
      setLoading(false);
    }
  }, [user?.grade_level, setConcepts, setMastery]);

  // Only fetch once on mount (or when user grade changes)
  useEffect(() => { fetchData(); }, [fetchData]);

  // Derive displayed concepts from allConcepts + viewMode + filterSubject
  const displayedConcepts = (() => {
    let list = allConcepts;
    if (viewMode === "current" && studentGrade) {
      list = list.filter((c) => c.grade === studentGrade);
    }
    if (filterSubject !== "all") {
      list = list.filter((c) => c.subject === filterSubject);
    }
    return list;
  })();

  // Update available subjects whenever viewMode changes
  const subjectsForFilter = (() => {
    const base = viewMode === "current" && studentGrade
      ? allConcepts.filter((c) => c.grade === studentGrade)
      : allConcepts;
    return [...new Set(base.map((c) => c.subject).filter(Boolean))];
  })();

  // D3 render
  useEffect(() => {
    if (!displayedConcepts.length || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    const getColor = (id) => {
      const score = masteryMap[id];
      if (score === undefined) return COLORS.default;
      if (score >= 70) return COLORS.mastered;
      if (score >= 40) return COLORS.partial;
      return COLORS.gap;
    };

    const nodes = displayedConcepts.map((c) => ({
      id: c.id,
      name: c.name,
      subject: c.subject,
      grade: c.grade,
      lesson_id: c.lesson_id,
      score: masteryMap[c.id],
    }));

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = [];
    displayedConcepts.forEach((c) => {
      (c.prerequisites || []).forEach((p) => {
        if (nodeIds.has(p)) links.push({ source: p, target: c.id });
      });
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g");

    // Zoom + pan
    svg.call(
      d3.zoom().scaleExtent([0.3, 3]).on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
    );

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(90))
      .force("charge", d3.forceManyBody().strength(-240))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(32));

    // Arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrow").attr("viewBox", "0 0 10 10")
      .attr("refX", 22).attr("refY", 5)
      .attr("markerWidth", 6).attr("markerHeight", 6)
      .attr("orient", "auto-start-reverse")
      .append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "#94a3b8");

    // Links
    const link = g.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", "#94a3b8").attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.5).attr("marker-end", "url(#arrow)");

    // Node groups
    const node = g.append("g").selectAll("g").data(nodes).join("g")
      .call(
        d3.drag()
          .on("start", (e) => { if (!e.active) simulation.alphaTarget(0.3).restart(); e.subject.fx = e.subject.x; e.subject.fy = e.subject.y; })
          .on("drag",  (e) => { e.subject.fx = e.x; e.subject.fy = e.y; })
          .on("end",   (e) => { if (!e.active) simulation.alphaTarget(0); e.subject.fx = null; e.subject.fy = null; })
      );

    node.append("circle")
      .attr("r", 20)
      .attr("fill", (d) => getColor(d.id))
      .attr("stroke", (d) => SUBJECT_COLORS[d.subject] || "#0F172A")
      .attr("stroke-width", 3)
      .style("cursor", "pointer");

    // Score inside circle
    node.filter((d) => d.score !== undefined)
      .append("text")
      .text((d) => `${d.score}%`)
      .attr("text-anchor", "middle").attr("dy", 4)
      .attr("font-size", "9px").attr("font-weight", "800")
      .attr("fill", "white").attr("font-family", "Inter, sans-serif")
      .style("pointer-events", "none");

    node.append("text")
      .text((d) => d.name.length > 11 ? d.name.slice(0, 10) + "…" : d.name)
      .attr("text-anchor", "middle").attr("dy", 34)
      .attr("font-size", "10px").attr("font-weight", "700")
      .attr("fill", "#0F172A").attr("font-family", "Nunito, sans-serif")
      .style("pointer-events", "none");

    node.append("text")
      .text((d) => d.grade?.replace("class_", "Cl.") || "")
      .attr("text-anchor", "middle").attr("dy", 46)
      .attr("font-size", "9px").attr("fill", "#64748B")
      .attr("font-family", "Nunito, sans-serif")
      .style("pointer-events", "none");

    node.on("click", (_, d) => {
      setSelected({ ...d, mastery_score: masteryMap[d.id] });
    });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [displayedConcepts, masteryMap]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="knowledge-graph-page">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-[#334155] hover:text-[#0F172A] shrink-0" data-testid="kg-back-link">
            <ArrowLeft className="w-5 h-5" /> Dashboard
          </Link>

          <h1 className="text-base font-bold text-[#0F172A] flex items-center gap-2 shrink-0" style={{ fontFamily: "Fredoka, sans-serif" }}>
            <Brain className="w-5 h-5" /> Knowledge Graph
            {studentGrade && (
              <span className="text-xs font-bold text-[#118AB2] bg-[#118AB2]/10 px-2 py-0.5 rounded-full border border-[#118AB2]/30">
                {studentGrade.replace("class_", "Class ")}
              </span>
            )}
          </h1>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* View mode */}
            <div className="flex gap-1">
              {["current", "all"].map((m) => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border-2 transition-all ${
                    viewMode === m
                      ? "bg-[#118AB2] text-white border-[#118AB2]"
                      : "bg-white border-[#e2e8f0] text-[#64748B] hover:border-[#118AB2]"
                  }`}
                  data-testid={`kg-view-${m}`}
                >
                  {m === "current" ? `Class ${studentGrade?.replace("class_", "") || "…"}` : "All Grades"}
                </button>
              ))}
            </div>

            {/* Subject filter — dynamically built from real data */}
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setFilterSubject("all")}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border-2 transition-all ${
                  filterSubject === "all"
                    ? "bg-[#0F172A] text-white border-[#0F172A]"
                    : "bg-white border-[#e2e8f0] text-[#64748B]"
                }`}>
                All
              </button>
              {subjectsForFilter.map((s) => (
                <button key={s} onClick={() => setFilterSubject(s)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border-2 transition-all ${
                    filterSubject === s
                      ? "text-white border-[#0F172A]"
                      : "bg-white border-[#e2e8f0] text-[#64748B]"
                  }`}
                  style={filterSubject === s ? { backgroundColor: SUBJECT_COLORS[s] || "#6366F1" } : {}}
                >
                  {SUBJECT_LABELS[s] || s}
                </button>
              ))}
            </div>

            <button onClick={fetchData} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748B]" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content" className="relative" ref={containerRef} style={{ height: "calc(100vh - 56px)" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedConcepts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center px-8">
            <div>
              <Brain className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
              <p className="font-bold text-lg text-[#0F172A]">No concepts found</p>
              <p className="text-sm text-[#64748B] mt-1">
                {viewMode === "current"
                  ? `No concepts seeded for ${studentGrade?.replace("class_", "Class ")} yet.`
                  : "No concepts available. Try reseeding lessons from the admin panel."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <svg ref={svgRef} className="w-full h-full" data-testid="knowledge-graph-svg" />

            {/* Legend */}
            <div className="absolute top-4 left-4 bg-white neura-card p-4 space-y-2 max-w-[160px]" data-testid="kg-legend">
              <p className="font-bold text-xs text-[#0F172A]">Mastery</p>
              {[
                { color: COLORS.mastered, label: "Mastered (70%+)" },
                { color: COLORS.partial,  label: "Partial (40-69%)" },
                { color: COLORS.gap,      label: "Gap (<40%)" },
                { color: COLORS.default,  label: "Not attempted" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-[#0F172A] shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-semibold text-[#334155]">{item.label}</span>
                </div>
              ))}
              <div className="border-t border-[#e2e8f0] pt-2">
                <p className="font-bold text-[10px] text-[#0F172A] mb-1">Subject (border)</p>
                {subjectsForFilter.slice(0, 5).map((s) => (
                  <div key={s} className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-3 rounded-full border-[3px] shrink-0"
                      style={{ borderColor: SUBJECT_COLORS[s] || "#6366F1", backgroundColor: "white" }} />
                    <span className="text-[10px] text-[#334155]">{SUBJECT_LABELS[s] || s}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#94a3b8]">{displayedConcepts.length} concepts</p>
            </div>

            {/* Selected concept detail */}
            {selected && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white neura-card p-5" data-testid="kg-concept-detail">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-base text-[#0F172A]" style={{ fontFamily: "Fredoka, sans-serif" }}>
                    {selected.name}
                  </h3>
                  <button onClick={() => setSelected(null)} className="text-[#64748B] hover:text-[#0F172A] text-xl leading-none" aria-label="Close">
                    ×
                  </button>
                </div>
                <div className="space-y-1 text-sm text-[#334155] mb-3">
                  <p><span className="font-bold">Subject:</span> {SUBJECT_LABELS[selected.subject] || selected.subject}</p>
                  <p><span className="font-bold">Grade:</span> {selected.grade?.replace("class_", "Class ")}</p>
                  <p>
                    <span className="font-bold">Mastery:</span>{" "}
                    {selected.mastery_score !== undefined
                      ? <span className={`font-bold ${selected.mastery_score >= 70 ? "text-[#06D6A0]" : selected.mastery_score >= 40 ? "text-[#b8860b]" : "text-[#EF476F]"}`}>
                          {selected.mastery_score}%
                        </span>
                      : <span className="text-[#94a3b8]">Not attempted</span>}
                  </p>
                </div>
                {selected.lesson_id ? (
                  <Link to={`/lesson/${selected.lesson_id}`}>
                    <button className="neura-btn bg-[#118AB2] text-white w-full text-sm h-10" data-testid="kg-start-lesson-btn">
                      Start Lesson →
                    </button>
                  </Link>
                ) : (
                  <p className="text-xs text-[#64748B] text-center">No lesson linked to this concept yet.</p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
