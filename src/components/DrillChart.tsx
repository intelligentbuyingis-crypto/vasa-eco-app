"use client";
import type { SampleRow } from "@/types/forms";

type Props = { samples: SampleRow[] };

const SOIL_COLORS: Record<string, string> = {
  "חרסית": "#c4874a",
  "חרסית שמנה": "#a0632a",
  "חמרה": "#d4a666",
  "לס": "#e8d5a3",
  "כורכר": "#f0e6c8",
  "חול": "#f5ead0",
  "מצעים": "#9db8a0",
  "אחר": "#b0b0b0",
  "": "#e0e0e0",
};

const SMELL_DOT: Record<string, string> = {
  "אין": "#22c55e",
  "קל": "#f59e0b",
  "חזק": "#ef4444",
  "": "#d1d5db",
};

function groupByDrill(samples: SampleRow[]): Record<string, SampleRow[]> {
  const map: Record<string, SampleRow[]> = {};
  samples.forEach(s => {
    if (!map[s.drillNum]) map[s.drillNum] = [];
    map[s.drillNum].push(s);
  });
  // Sort each group by depth
  Object.values(map).forEach(arr =>
    arr.sort((a, b) => parseFloat(a.depth || "0") - parseFloat(b.depth || "0"))
  );
  return map;
}

export default function DrillChart({ samples }: Props) {
  const groups = groupByDrill(samples);
  const drills = Object.keys(groups);

  if (drills.length === 0) return (
    <div className="card text-center py-8 text-gray-400 text-sm">אין דגימות להצגה</div>
  );

  // Find max depth across all drills
  const maxDepth = Math.max(
    1,
    ...samples.map(s => parseFloat(s.depth || "0") + 0.5)
  );

  const COL_W = 100;
  const SCALE = 40; // px per meter
  const HEIGHT = Math.ceil(maxDepth) * SCALE + 60;
  const WIDTH = drills.length * (COL_W + 20) + 60;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="section-title mb-0">חתך ליתולוגי — ויזואליזציה</p>
        <span className="text-xs text-gray-400">{drills.length} קידוחים</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(SOIL_COLORS).filter(([k]) => k && samples.some(s => s.soilType === k)).map(([soil, color]) => (
          <div key={soil} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border border-gray-200 flex-shrink-0" style={{ background: color }} />
            <span className="text-xs text-gray-600">{soil}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mb-4">
        <span className="text-xs text-gray-500">ריח:</span>
        {[["אין","#22c55e"],["קל","#f59e0b"],["חזק","#ef4444"]].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{ display: "block", fontFamily: "inherit" }}
        >
          {/* Y-axis depth labels */}
          {Array.from({ length: Math.ceil(maxDepth) + 1 }, (_, i) => (
            <g key={i}>
              <line x1="40" y1={40 + i * SCALE} x2={WIDTH} y2={40 + i * SCALE}
                stroke="#f0f0f0" strokeWidth="1" />
              <text x="36" y={44 + i * SCALE} textAnchor="end" fontSize="10" fill="#9ca3af">
                {i}מ'
              </text>
            </g>
          ))}

          {/* Ground surface line */}
          <line x1="40" y1="40" x2={WIDTH} y2="40" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4,2"/>
          <text x="42" y="36" fontSize="9" fill="#6b7280">פני קרקע</text>

          {drills.map((drillNum, di) => {
            const x = 50 + di * (COL_W + 20);
            const drillSamples = groups[drillNum];

            return (
              <g key={drillNum}>
                {/* Drill label */}
                <text x={x + COL_W / 2} y="18" textAnchor="middle" fontSize="12" fontWeight="500" fill="#1f2937">
                  {drillNum}
                </text>
                <text x={x + COL_W / 2} y="30" textAnchor="middle" fontSize="9" fill="#6b7280">
                  {drillSamples.length} דגימות
                </text>

                {/* Borehole outline */}
                <rect x={x} y="40" width={COL_W} height={HEIGHT - 60}
                  fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" rx="3" />

                {/* Sample blocks */}
                {drillSamples.map((s, si) => {
                  const depthNum = parseFloat(s.depth || "0");
                  const nextDepth = si < drillSamples.length - 1
                    ? parseFloat(drillSamples[si + 1].depth || "0")
                    : depthNum + 0.5;
                  const y = 40 + depthNum * SCALE;
                  const blockH = Math.max((nextDepth - depthNum) * SCALE - 2, 8);
                  const soilColor = SOIL_COLORS[s.soilType] ?? SOIL_COLORS[""];
                  const smellColor = SMELL_DOT[s.smell] ?? SMELL_DOT[""];
                  const pidVal = parseFloat(s.pid || "0");

                  return (
                    <g key={s.id}>
                      {/* Soil block */}
                      <rect x={x + 1} y={y + 1} width={COL_W - 2} height={blockH}
                        fill={soilColor} rx="2" opacity="0.85" />

                      {/* Sample number */}
                      {blockH >= 14 && (
                        <text x={x + 6} y={y + blockH / 2 + 4} fontSize="9" fill="#374151" fontWeight="500">
                          {s.sampleNum || `#${si+1}`}
                        </text>
                      )}

                      {/* Depth label on right side */}
                      <text x={x + COL_W - 4} y={y + 10} textAnchor="end" fontSize="8" fill="#6b7280">
                        {s.depth ? `${s.depth}מ'` : ""}
                      </text>

                      {/* Smell dot */}
                      <circle cx={x + COL_W - 8} cy={y + blockH / 2} r="4"
                        fill={smellColor} opacity="0.9" />

                      {/* PID bar — mini bar on left edge */}
                      {pidVal > 0 && (
                        <>
                          <rect x={x} y={y + 1} width={Math.min(pidVal / 10, COL_W * 0.15)} height={blockH}
                            fill="#ef4444" opacity="0.25" rx="2" />
                          {blockH >= 14 && (
                            <text x={x + 4} y={y + blockH - 3} fontSize="7" fill="#b91c1c">
                              {pidVal}
                            </text>
                          )}
                        </>
                      )}
                    </g>
                  );
                })}

                {/* Bottom cap */}
                <line x1={x} y1={40 + maxDepth * SCALE} x2={x + COL_W} y2={40 + maxDepth * SCALE}
                  stroke="#9ca3af" strokeWidth="2" />
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        לחץ על הדגימות בשלב הקודם לעדכון · הגרף מתעדכן אוטומטית
      </p>
    </div>
  );
}
