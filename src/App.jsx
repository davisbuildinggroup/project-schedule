import { useState, useRef, useEffect } from "react";

const PHASE_COLORS = {
  "Phase 1": { bg: "#8B4513", light: "#C4622D", text: "#fff" },
  "Phase 2": { bg: "#C8860A", light: "#E8A838", text: "#fff" },
  "Phase 3": { bg: "#6A4C93", light: "#9370BB", text: "#fff" },
};

const projects = [
  { name: "5130 Dartmouth Ave N", phases: [{ name: "Phase 1", start: "2025-12-17", end: "2026-02-15" }, { name: "Phase 2", start: "2026-02-16", end: "2026-05-23" }, { name: "Phase 3", start: "2026-04-02", end: "2026-05-27" }], completion: "2026-05-27" },
  { name: "5144 Dartmouth Ave N", phases: [{ name: "Phase 1", start: "2026-02-02", end: "2026-03-31" }, { name: "Phase 2", start: "2026-03-23", end: "2026-06-02" }, { name: "Phase 3", start: "2026-05-07", end: "2026-06-10" }], completion: "2026-06-10" },
  { name: "555 49th Ave N", phases: [{ name: "Phase 1", start: "2026-01-29", end: "2026-03-18" }, { name: "Phase 2", start: "2026-03-18", end: "2026-06-03" }, { name: "Phase 3", start: "2026-04-29", end: "2026-06-15" }], completion: "2026-06-15" },
  { name: "4410 4th Ave S", phases: [{ name: "Phase 1", start: "2026-02-02", end: "2026-04-12" }, { name: "Phase 2", start: "2026-04-13", end: "2026-06-15" }, { name: "Phase 3", start: "2026-05-26", end: "2026-06-26" }], completion: "2026-06-26" },
  { name: "5346 2nd Ave S", phases: [{ name: "Phase 1", start: "2026-02-10", end: "2026-04-22" }, { name: "Phase 2", start: "2026-04-14", end: "2026-06-08" }, { name: "Phase 3", start: "2026-05-28", end: "2026-07-01" }], completion: "2026-07-01" },
  { name: "5124 Dartmouth Ave N", phases: [{ name: "Phase 1", start: "2026-04-01", end: "2026-05-07" }, { name: "Phase 2", start: "2026-05-04", end: "2026-06-19" }, { name: "Phase 3", start: "2026-06-12", end: "2026-07-20" }], completion: "2026-07-20" },
  { name: "131 Kingston St S", phases: [{ name: "Phase 1", start: "2026-04-01", end: "2026-05-21" }, { name: "Phase 2", start: "2026-05-20", end: "2026-07-07" }, { name: "Phase 3", start: "2026-06-25", end: "2026-07-30" }], completion: "2026-07-30" },
  { name: "5314 7th Ave S (Lot 4)", phases: [{ name: "Phase 1", start: "2026-04-21", end: "2026-06-16" }, { name: "Phase 2", start: "2026-06-15", end: "2026-07-27" }, { name: "Phase 3", start: "2026-07-17", end: "2026-08-26" }], completion: "2026-08-26" },
  { name: "5310 7th Ave S (Lot 5)", phases: [{ name: "Phase 1", start: "2026-04-27", end: "2026-06-18" }, { name: "Phase 2", start: "2026-06-17", end: "2026-07-29" }, { name: "Phase 3", start: "2026-07-21", end: "2026-08-28" }], completion: "2026-08-28" },
  { name: "5306 7th Ave S (Lot 6)", phases: [{ name: "Phase 1", start: "2026-04-23", end: "2026-06-23" }, { name: "Phase 2", start: "2026-06-22", end: "2026-08-03" }, { name: "Phase 3", start: "2026-07-24", end: "2026-09-02" }], completion: "2026-09-02" },
  { name: "5302 7th Ave S (Lot 7)", phases: [{ name: "Phase 1", start: "2026-04-30", end: "2026-06-30" }, { name: "Phase 2", start: "2026-06-29", end: "2026-08-10" }, { name: "Phase 3", start: "2026-07-31", end: "2026-09-14" }], completion: "2026-09-14" },
  { name: "2719 13th St North", phases: [{ name: "Phase 1", start: "2026-04-01", end: "2026-06-29" }, { name: "Phase 2", start: "2026-06-30", end: "2026-08-19" }, { name: "Phase 3", start: "2026-08-11", end: "2026-09-18" }], completion: "2026-09-18" },
];

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const today = new Date("2026-05-21");

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toMs(d) { return new Date(d).getTime(); }

function formatDate(d) {
  const dt = new Date(d);
  return `${MONTH_NAMES[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

function formatTick(d) {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

const TICK_DAYS = 5;
const ROW_H = 58;
const NAME_W = 195;
const HEADER_H = 52;

export default function App() {
  const [filter, setFilter] = useState("All");
  const [tooltip, setTooltip] = useState(null);
  const scrollRef = useRef(null);

  const allMs = projects.flatMap(p => p.phases.flatMap(ph => [toMs(ph.start), toMs(ph.end)]));
  const minDate = new Date(Math.min(...allMs));
  const maxDate = new Date(Math.max(...allMs));
  minDate.setDate(minDate.getDate() - 5);
  maxDate.setDate(maxDate.getDate() + 10);

  const totalDays = Math.ceil((maxDate - minDate) / 86400000);
  const PX_PER_DAY = 18;
  const totalW = totalDays * PX_PER_DAY;

  function dayX(d) {
    return Math.round((toMs(d) - minDate) / 86400000) * PX_PER_DAY;
  }

  // Build ticks every TICK_DAYS days
  const ticks = [];
  let cur = new Date(minDate);
  while (cur <= maxDate) {
    ticks.push(new Date(cur));
    cur = addDays(cur, TICK_DAYS);
  }

  // Month label positions
  const monthLabels = [];
  const mc = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  while (mc <= maxDate) {
    if (mc >= minDate) monthLabels.push(new Date(mc));
    mc.setMonth(mc.getMonth() + 1);
  }

  const phases = ["All", "Phase 1", "Phase 2", "Phase 3"];
  const todayX = dayX(today);

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const offset = Math.max(0, todayX - 300);
      scrollRef.current.scrollLeft = offset;
    }
  }, []);

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#0d1117", minHeight: "100vh", color: "#e6edf3" }}>

      {/* Header */}
      <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#e6edf3" }}>Project Schedule Overview</div>
          <div style={{ fontSize: 11, color: "#6e7681", marginTop: 2 }}>288 Beach Dr NE · St. Petersburg, FL · {projects.length} Active Projects</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {phases.map(p => (
            <button key={p} onClick={() => setFilter(p)} style={{
              padding: "5px 14px", borderRadius: 20, border: "1px solid",
              borderColor: filter === p ? "transparent" : "#30363d",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: filter === p ? (p === "All" ? "#1f6feb" : PHASE_COLORS[p]?.bg) : "#21262d",
              color: "#e6edf3", transition: "all 0.15s"
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "7px 20px", display: "flex", gap: 20, alignItems: "center" }}>
        {Object.entries(PHASE_COLORS).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <div style={{ width: 18, height: 11, borderRadius: 3, background: v.bg }} />
            <span style={{ color: "#8b949e" }}>{k}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <div style={{ width: 2, height: 16, background: "#f85149" }} />
          <span style={{ color: "#8b949e" }}>Today — May 21, 2026</span>
        </div>
      </div>

      {/* Main chart */}
      <div style={{ display: "flex", overflow: "hidden" }}>

        {/* Frozen name column */}
        <div style={{ minWidth: NAME_W, width: NAME_W, flexShrink: 0, zIndex: 10, background: "#161b22", borderRight: "1px solid #30363d" }}>
          {/* Header spacer */}
          <div style={{ height: HEADER_H, borderBottom: "1px solid #30363d", background: "#0d1117" }} />
          {projects.map((proj, pi) => (
            <div key={pi} style={{
              height: ROW_H, padding: "0 12px", display: "flex", flexDirection: "column", justifyContent: "center",
              borderBottom: "1px solid #21262d", background: pi % 2 === 0 ? "#161b22" : "#0d1117"
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", lineHeight: 1.3 }}>{proj.name}</div>
              <div style={{ fontSize: 10, color: "#6e7681", marginTop: 3 }}>↓ {formatDate(proj.completion)}</div>
            </div>
          ))}
        </div>

        {/* Scrollable chart area */}
        <div ref={scrollRef} style={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}>
          <div style={{ width: totalW, position: "relative" }}>

            {/* Header: month labels + date ticks */}
            <div style={{ height: HEADER_H, position: "sticky", top: 0, background: "#0d1117", borderBottom: "1px solid #30363d", zIndex: 8 }}>
              {/* Month labels row */}
              {monthLabels.map((m, i) => {
                const x = Math.max(0, dayX(m));
                const nextM = new Date(m.getFullYear(), m.getMonth() + 1, 1);
                const nextX = Math.min(totalW, dayX(nextM));
                return (
                  <div key={i} style={{
                    position: "absolute", left: x, width: nextX - x,
                    top: 0, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#58a6ff",
                    borderRight: "1px solid #30363d", borderBottom: "1px solid #21262d",
                    background: i % 2 === 0 ? "#0d1117" : "#161b22"
                  }}>
                    {MONTH_NAMES[m.getMonth()]} {m.getFullYear()}
                  </div>
                );
              })}
              {/* Date ticks row */}
              {ticks.map((t, i) => {
                const x = dayX(t);
                const nextT = i + 1 < ticks.length ? dayX(ticks[i + 1]) : x + TICK_DAYS * PX_PER_DAY;
                const w = nextT - x;
                const isToday = t.toDateString() === today.toDateString();
                return (
                  <div key={i} style={{
                    position: "absolute", left: x, width: w,
                    top: 22, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: isToday ? "#f85149" : "#6e7681",
                    fontWeight: isToday ? 700 : 400,
                    borderRight: "1px solid #21262d",
                  }}>
                    {formatTick(t)}
                  </div>
                );
              })}
              {/* Today line in header */}
              <div style={{ position: "absolute", left: todayX, top: 0, height: HEADER_H, width: 2, background: "#f85149", zIndex: 10 }} />
            </div>

            {/* Row backgrounds + bars */}
            {projects.map((proj, pi) => {
              const visiblePhases = proj.phases.filter(ph => filter === "All" || ph.name === filter);
              return (
                <div key={pi} style={{
                  position: "relative", height: ROW_H,
                  background: pi % 2 === 0 ? "#161b22" : "#0d1117",
                  borderBottom: "1px solid #21262d"
                }}>
                  {/* Grid lines */}
                  {ticks.map((t, i) => (
                    <div key={i} style={{ position: "absolute", left: dayX(t), top: 0, bottom: 0, width: 1, background: "#1c2128" }} />
                  ))}
                  {/* Today line */}
                  <div style={{ position: "absolute", left: todayX, top: 0, bottom: 0, width: 2, background: "rgba(248,81,73,0.5)", zIndex: 4 }} />

                  {/* Phase bars */}
                  {visiblePhases.map((ph, phi) => {
                    const x = dayX(ph.start);
                    const w = Math.max(dayX(ph.end) - x, 4);
                    const col = PHASE_COLORS[ph.name];
                    const totalBars = filter === "All" ? visiblePhases.length : 1;
                    const barH = filter === "All" ? 14 : 26;
                    const gap = filter === "All" ? 4 : 0;
                    const totalUsed = totalBars * barH + (totalBars - 1) * gap;
                    const topOff = (ROW_H - totalUsed) / 2 + phi * (barH + gap);

                    return (
                      <div
                        key={phi}
                        onMouseEnter={e => setTooltip({ proj: proj.name, phase: ph.name, start: ph.start, end: ph.end, x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          position: "absolute", left: x, width: w,
                          top: topOff, height: barH,
                          background: `linear-gradient(90deg, ${col.bg} 0%, ${col.light} 100%)`,
                          borderRadius: 4, cursor: "pointer", zIndex: 3,
                          boxShadow: `0 0 8px ${col.bg}55`,
                          display: "flex", alignItems: "center", paddingLeft: 6, overflow: "hidden"
                        }}
                      >
                        {w > 50 && <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", letterSpacing: 0.4 }}>{ph.name}</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ padding: "16px 20px", display: "flex", gap: 10 }}>
        {Object.entries(PHASE_COLORS).map(([ph, col]) => {
          const active = projects.filter(p => {
            const phase = p.phases.find(x => x.name === ph);
            return phase && toMs(phase.start) <= today && today <= toMs(phase.end);
          }).length;
          return (
            <div key={ph} style={{ flex: 1, background: "#161b22", border: `1px solid ${col.bg}55`, borderLeft: `3px solid ${col.bg}`, borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6e7681", textTransform: "uppercase", letterSpacing: 0.6 }}>{ph} Active Today</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: col.light, marginTop: 4 }}>{active}</div>
              <div style={{ fontSize: 10, color: "#6e7681" }}>of {projects.length} projects</div>
            </div>
          );
        })}
        <div style={{ flex: 1, background: "#161b22", border: "1px solid #1f6feb55", borderLeft: "3px solid #1f6feb", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6e7681", textTransform: "uppercase", letterSpacing: 0.6 }}>Total Pipeline</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#58a6ff", marginTop: 4 }}>{projects.length}</div>
          <div style={{ fontSize: 10, color: "#6e7681" }}>active projects</div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "fixed", left: tooltip.x + 14, top: tooltip.y - 14,
          background: "#161b22", border: "1px solid #30363d", color: "#e6edf3",
          padding: "9px 13px", borderRadius: 7, fontSize: 12,
          pointerEvents: "none", zIndex: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: "#e6edf3" }}>{tooltip.proj}</div>
          <div style={{ color: PHASE_COLORS[tooltip.phase]?.light, fontWeight: 600 }}>{tooltip.phase}</div>
          <div style={{ color: "#8b949e", marginTop: 3 }}>{formatDate(tooltip.start)}</div>
          <div style={{ color: "#8b949e" }}>→ {formatDate(tooltip.end)}</div>
        </div>
      )}
    </div>
  );
}
