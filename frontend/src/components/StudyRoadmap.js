import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { useAuth } from "@/lib/auth-context";
import { useGradeTheme } from "@/lib/useGradeTheme";
import api from "@/lib/api";
import { X, Maximize2, Minimize2, RefreshCw } from "lucide-react";

// Grade number helper
function gradeNum(g) {
  if (!g) return 0;
  const n = parseInt(g.replace("class_", ""), 10);
  return isNaN(n) ? 0 : n;
}

// Build a simple linear skill tree from real lesson data
function buildRoadmapFromLessons(lessons, masteryMap) {
  const bySubject = {};
  lessons.forEach((l) => {
    const subj = l.subject || "general";
    if (!bySubject[subj]) bySubject[subj] = [];
    bySubject[subj].push(l);
  });

  const result = {};
  Object.entries(bySubject).forEach(([subj, subjLessons]) => {
    const sorted = [...subjLessons].sort((a, b) => {
      const ga = gradeNum(a.grade), gb = gradeNum(b.grade);
      if (ga !== gb) return ga - gb;
      return (a.title || "").localeCompare(b.title || "");
    });

    // Assign columns: max 3 per row, increment row within same grade
    const gradeSlots = {};
    const nodes = sorted.map((l) => {
      const g = gradeNum(l.grade);
      if (!gradeSlots[g]) gradeSlots[g] = 0;
      const col = gradeSlots[g] % 3;
      const row = Math.floor(gradeSlots[g] / 3);
      gradeSlots[g]++;
      return {
        id: l.id,
        label: l.title,
        grade: g,
        gradeLabel: l.grade,
        col,
        row,          // sub-row within same grade
        lessonId: l.id,
        score: masteryMap[l.concept_id || l.id],
      };
    });

    const edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push([nodes[i].id, nodes[i + 1].id]);
    }

    result[subj] = { nodes, edges };
  });

  return result;
}

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

export default function StudyRoadmap({ onClose, userGrade: propGrade }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { user } = useAuth();
  const { isJunior, isSenior } = useGradeTheme();

  const userGrade = propGrade || user?.grade_level;

  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [roadmapData, setRoadmapData] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userGrade) return;
    setLoading(true);
    try {
      const [lessonsRes, masteryRes] = await Promise.all([
        api.get(`/lessons?grade=${userGrade}`),
        api.get("/knowledge-graph/mastery").catch(() => ({ data: { mastery: [] } })),
      ]);

      const lessons = lessonsRes.data.lessons || [];
      const masteryArr = masteryRes.data.mastery || [];
      const masteryMap = {};
      masteryArr.forEach((m) => { masteryMap[m.concept_id] = m.score; });

      const data = buildRoadmapFromLessons(lessons, masteryMap);
      setRoadmapData(data);

      const subjList = Object.keys(data);
      setSubjects(subjList);
      setActiveSubject((prev) => (prev && data[prev] ? prev : subjList[0] || null));
    } catch (e) {
      console.error("StudyRoadmap fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [userGrade]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Draw D3 whenever subject / data / fullscreen changes
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !activeSubject) return;
    const path = roadmapData[activeSubject];
    if (!path || !path.nodes.length) return;

    const W = containerRef.current.clientWidth || 480;
    const ROW_H = 80;   // vertical gap between each node row
    const COL_W = Math.min(140, (W - 50) / 3);
    const NODE_R = 22;
    const LABEL_OFFSET = 36; // px below circle centre for label

    // Build unique Y positions: gradeY[grade][row]
    // Each (grade, row) pair gets its own Y
    const gradeRowMap = {}; // key: `${grade}_${row}` -> sequential index
    path.nodes.forEach((n) => {
      const key = `${n.grade}_${n.row}`;
      if (!(key in gradeRowMap)) gradeRowMap[key] = Object.keys(gradeRowMap).length;
    });

    const nodePos = {};
    path.nodes.forEach((n) => {
      const key = `${n.grade}_${n.row}`;
      const rowIdx = gradeRowMap[key];
      nodePos[n.id] = {
        x: 30 + NODE_R + n.col * COL_W,
        y: 30 + NODE_R + rowIdx * ROW_H,
      };
    });

    const totalRows = Object.keys(gradeRowMap).length;
    const H = Math.max(300, 30 + NODE_R + totalRows * ROW_H + LABEL_OFFSET + 20);

    const nodeIds = new Set(path.nodes.map((n) => n.id));
    const filteredEdges = path.edges.filter(([s, t]) => nodeIds.has(s) && nodeIds.has(t));
    const subjectColor = SUBJECT_COLORS[activeSubject] || "#6366F1";

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", W).attr("height", H).attr("viewBox", `0 0 ${W} ${H}`);

    const wrapper = svg.append("g").attr("class", "zoom-root");

    wrapper.append("rect").attr("width", W).attr("height", H).attr("fill", "#FAFAFA");

    // Grade labels on left edge
    const gradesSeen = new Set();
    path.nodes.forEach((n) => {
      const key = `${n.grade}_${n.row}`;
      if (!gradesSeen.has(n.grade) && n.row === 0) {
        gradesSeen.add(n.grade);
        const rowIdx = gradeRowMap[key];
        wrapper.append("text")
          .attr("x", 2).attr("y", 30 + NODE_R + rowIdx * ROW_H + 4)
          .attr("font-size", "9px").attr("font-weight", "700")
          .attr("fill", "#9CA3AF").attr("font-family", "Inter, sans-serif")
          .text(`Cl.${n.grade}`);
        if (rowIdx > 0) {
          wrapper.append("line")
            .attr("x1", 20).attr("y1", 30 + NODE_R + rowIdx * ROW_H - ROW_H / 2)
            .attr("x2", W - 4).attr("y2", 30 + NODE_R + rowIdx * ROW_H - ROW_H / 2)
            .attr("stroke", "#E5E7EB").attr("stroke-width", 1);
        }
      }
    });

    // Edges
    filteredEdges.forEach(([src, tgt]) => {
      const s = nodePos[src], t = nodePos[tgt];
      if (!s || !t) return;
      wrapper.append("path")
        .attr("d", `M${s.x},${s.y} C${s.x},${(s.y + t.y) / 2} ${t.x},${(s.y + t.y) / 2} ${t.x},${t.y}`)
        .attr("fill", "none")
        .attr("stroke", subjectColor + "70")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,3");
    });

    // Node groups
    const nodeG = wrapper.selectAll(".node").data(path.nodes).join("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${nodePos[d.id]?.x || 0},${nodePos[d.id]?.y || 0})`)
      .style("cursor", "pointer")
      .on("click", (_, d) => setSelectedNode(d));

    nodeG.append("circle")
      .attr("r", NODE_R)
      .attr("fill", (d) => {
        if (d.score === undefined) return "#E5E7EB";
        if (d.score >= 70) return "#10B981";
        if (d.score >= 40) return "#F59E0B";
        return "#EF4444";
      })
      .attr("stroke", subjectColor)
      .attr("stroke-width", 2.5);

    nodeG.filter((d) => d.score !== undefined)
      .append("text")
      .attr("text-anchor", "middle").attr("dy", 4)
      .attr("font-size", "9px").attr("font-weight", "800")
      .attr("fill", "white").attr("font-family", "Inter, sans-serif")
      .text((d) => `${d.score}%`);

    // Label BELOW circle — background rect to prevent overlap
    nodeG.each(function(d) {
      const g = d3.select(this);
      const labelText = d.label.length > 14 ? d.label.slice(0, 13) + "…" : d.label;
      const textW = labelText.length * 5.5 + 6;
      // White bg pill behind label
      g.append("rect")
        .attr("x", -textW / 2).attr("y", NODE_R + 4)
        .attr("width", textW).attr("height", 14)
        .attr("rx", 4).attr("fill", "white").attr("opacity", 0.92);
      g.append("text")
        .attr("text-anchor", "middle").attr("y", NODE_R + 14)
        .attr("font-size", "9px").attr("font-weight", "700")
        .attr("fill", "#1A1A2E").attr("font-family", "Inter, Nunito, sans-serif")
        .text(labelText);
    });

    svg.call(d3.zoom().scaleExtent([0.4, 2.5]).on("zoom", (e) => {
      wrapper.attr("transform", e.transform);
    }));

  }, [activeSubject, roadmapData, fullscreen, isSenior]);

  const subjectColor = SUBJECT_COLORS[activeSubject] || "#6366F1";
  const path = roadmapData[activeSubject];

  return (
    <div
      className={`fixed z-[100] bg-white neura-card flex flex-col ${
        fullscreen ? "inset-4" : "bottom-4 left-4 w-[540px] max-w-[95vw]"
      }`}
      style={{ maxHeight: fullscreen ? "calc(100vh - 32px)" : "520px" }}
      role="dialog"
      aria-label="Study Roadmap"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: subjectColor + "20", border: `1.5px solid ${subjectColor}50` }}>
            <div className="w-3 h-3 rounded-full" style={{ background: subjectColor }} />
          </div>
          <h2 className="font-bold text-sm text-[#1A1A2E]"
            style={{ fontFamily: isJunior ? "Fredoka, sans-serif" : "Space Grotesk, sans-serif" }}>
            {isJunior ? "🗺️ Your Learning Path" : "Study Roadmap"}
            {userGrade && (
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30">
                {userGrade.replace("class_", "Class ")}
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={fetchData} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#6B7280]" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setFullscreen((v) => !v)} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#6B7280]">
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#6B7280] hover:text-red-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subject tabs */}
      {subjects.length > 0 && (
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-b border-[#E5E7EB] shrink-0">
          {subjects.map((s) => (
            <button key={s} onClick={() => { setActiveSubject(s); setSelectedNode(null); }}
              className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border-2 transition-all ${
                activeSubject === s
                  ? "text-white border-[#1A1A2E]"
                  : "bg-white text-[#374151] border-[#e5e7eb] hover:border-[#1A1A2E]"
              }`}
              style={activeSubject === s ? { backgroundColor: SUBJECT_COLORS[s] || "#6366F1", borderColor: SUBJECT_COLORS[s] || "#6366F1" } : {}}
            >
              {SUBJECT_LABELS[s] || s}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-[#E5E7EB] shrink-0">
        {[
          { color: "#10B981", label: "Mastered" },
          { color: "#F59E0B", label: "Partial" },
          { color: "#EF4444", label: "Gap" },
          { color: "#F3F4F6", label: "Not started", border: "#D1D5DB" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full border" style={{ background: l.color, borderColor: l.border || l.color }} />
            <span className="text-[9px] font-semibold text-[#6B7280]">{l.label}</span>
          </div>
        ))}
      </div>

      {/* SVG canvas */}
      <div ref={containerRef} className="flex-1 overflow-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full py-16">
            <div className="w-8 h-8 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !activeSubject || !path?.nodes?.length ? (
          <div className="flex items-center justify-center h-full py-16 text-center px-6">
            <div>
              <p className="text-2xl mb-2">📚</p>
              <p className="text-sm text-[#64748B] font-semibold">No lessons found for {userGrade?.replace("class_", "Class ")}.</p>
              <p className="text-xs text-[#94a3b8] mt-1">Complete some lessons to see your roadmap.</p>
            </div>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full" />
        )}
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <div className="p-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#1A1A2E] truncate">{selectedNode.label}</p>
            <p className="text-xs text-[#6B7280]">
              {selectedNode.gradeLabel?.replace("class_", "Class ")} ·{" "}
              {selectedNode.score !== undefined ? `${selectedNode.score}% mastery` : "Not attempted"}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setSelectedNode(null)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#64748B] hover:bg-[#f1f5f9]">
              Close
            </button>
            <a href={`/lesson/${selectedNode.lessonId}`}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg text-white border-2 border-[#0F172A] ${
                isJunior ? "bg-[#118AB2]" : "bg-indigo-600"
              }`}>
              {isJunior ? "Go! 🚀" : "Start Lesson"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
