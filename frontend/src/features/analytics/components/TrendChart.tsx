import { useMemo } from "react";
import type { TrendPoint } from "../types/analytics.types";

interface TrendChartProps {
  data: TrendPoint[];
}

const MONTH_LABELS = [
  "Jan","Feb","Mar","Apr","May",
  "Jun","Jul","Aug","Sep","Oct","Nov","Dec",
];

const W   = 600;
const H   = 260; // taller viewBox — fills the space
const PAD = { top: 24, right: 16, bottom: 36, left: 36 };

export const TrendChart = ({ data }: TrendChartProps) => {
  const max   = Math.max(...data.map((d) => d.count), 1);
  const count = data.length;

  const points = useMemo(() => {
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top  - PAD.bottom;
    return data.map((d, i) => ({
      ...d,
      x: PAD.left + (count > 1 ? (i / (count - 1)) * chartW : chartW / 2),
      y: PAD.top  + chartH - (d.count / max) * chartH,
    }));
  }, [data, max, count]);

  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    if (points.length === 1)
      return `M ${points[0].x} ${points[0].y}`;
    return points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpX  = (prev.x + p.x) / 2;
      return `${acc} C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
    }, "");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const bottomY = PAD.top + (H - PAD.top - PAD.bottom);
    const first   = points[0];
    const last    = points[points.length - 1];
    const line    = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpX  = (prev.x + p.x) / 2;
      return `${acc} C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
    }, "");
    return `${line} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [points]);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: Math.round(max * f),
    y:     PAD.top + (H - PAD.top - PAD.bottom) * (1 - f),
  }));

  return (
    // w-full h-full — stretches to fill flex-1 container
    <div className="w-full h-full min-h-[160px]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"
              stopColor="var(--chart-1)" stopOpacity="0.2" />
            <stop offset="100%"
              stopColor="var(--chart-1)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Gridlines + Y-axis labels */}
        {yTicks.map(({ value, y }) => (
          <g key={value}>
            <line
              x1={PAD.left} y1={y}
              x2={W - PAD.right} y2={y}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={PAD.left - 6} y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="currentColor"
              opacity="0.4"
            >
              {value}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#areaGrad)"
          className="transition-all duration-700"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-700"
        />

        {/* Points + labels + hover tooltips */}
        {points.map((p) => {
          const label = MONTH_LABELS[p.month - 1];
          return (
            <g key={`${p.year}-${p.month}`} className="group">
              {/* Invisible wider hit area */}
              <rect
                x={p.x - 18} y={PAD.top}
                width={36}
                height={H - PAD.top - PAD.bottom}
                fill="transparent"
                className="cursor-default"
              />

              {/* Vertical hover rule */}
              <line
                x1={p.x} y1={PAD.top}
                x2={p.x} y2={H - PAD.bottom}
                stroke="currentColor"
                strokeOpacity="0.15"
                strokeWidth="1"
                strokeDasharray="3 3"
                className="opacity-0 group-hover:opacity-100
                           transition-opacity duration-150"
              />

              {/* Dot */}
              <circle
                cx={p.x} cy={p.y}
                r="4"
                fill="var(--chart-1)"
                stroke="var(--card)"
                strokeWidth="2.5"
                className="transition-all duration-150
                           group-hover:r-[6]"
              />

              {/* Tooltip box */}
              <g className="opacity-0 group-hover:opacity-100
                            transition-opacity pointer-events-none">
                <rect
                  x={p.x - 30} y={p.y - 34}
                  width={60} height={22}
                  rx="4"
                  fill="currentColor"
                  opacity="0.85"
                />
                <text
                  x={p.x} y={p.y - 19}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="var(--card)"
                >
                  {p.count} req{p.count !== 1 ? "s" : ""}
                </text>
              </g>

              {/* X-axis month label */}
              <text
                x={p.x} y={H - 8}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
                opacity="0.45"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};