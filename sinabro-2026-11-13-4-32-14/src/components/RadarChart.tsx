import React from 'react';
import type { CharacterRadarStats } from '../types/archive';

interface RadarChartProps {
  stats: CharacterRadarStats;
  size?: number;
  accentColor?: string;
}

const AXES: { key: keyof CharacterRadarStats; label: string }[] = [
  { key: 'combat', label: '전투력' },
  { key: 'intellect', label: '지략' },
  { key: 'charm', label: '매력' },
  { key: 'willpower', label: '의지' },
  { key: 'agility', label: '민첩' },
];

export const RadarChart: React.FC<RadarChartProps> = ({
  stats,
  size = 240,
  accentColor = '#006194',
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.34;
  const levels = [0.25, 0.5, 0.75, 1];

  const getPoint = (index: number, ratio: number) => {
    const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * maxR * ratio,
      y: cy + Math.sin(angle) * maxR * ratio,
    };
  };

  const dataPolygon = AXES.map((axis, idx) => {
    const value = Math.max(5, Math.min(100, stats[axis.key] ?? 50)) / 100;
    const pt = getPoint(idx, value);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        role="img"
        aria-label="캐릭터 능력치 오각형 레이더 차트"
      >
        {levels.map((lvl) => {
          const pts = AXES.map((_, idx) => {
            const pt = getPoint(idx, lvl);
            return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          }).join(' ');
          return (
            <polygon
              key={lvl}
              points={pts}
              fill={lvl === 1 ? 'rgba(0, 97, 148, 0.03)' : 'none'}
              stroke="#dfe4ea"
              strokeWidth={1}
            />
          );
        })}

        {AXES.map((_, idx) => {
          const outer = getPoint(idx, 1);
          return (
            <line
              key={idx}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="#dfe4ea"
              strokeWidth={1}
            />
          );
        })}

        <polygon
          points={dataPolygon}
          fill={accentColor}
          fillOpacity={0.18}
          stroke={accentColor}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {AXES.map((axis, idx) => {
          const value = Math.max(5, Math.min(100, stats[axis.key] ?? 50)) / 100;
          const pt = getPoint(idx, value);
          const labelPt = getPoint(idx, 1.25);
          return (
            <g key={axis.key}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={3.5}
                fill="#ffffff"
                stroke={accentColor}
                strokeWidth={2}
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-ink-muted text-[11px] font-medium"
              >
                {axis.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-5 gap-2 w-full mt-2 pt-3 border-t border-hairline text-center">
        {AXES.map((axis) => (
          <div key={axis.key} className="flex flex-col">
            <span className="text-[11px] text-ink-subtle">{axis.label}</span>
            <span className="text-xs font-semibold text-ink tabular-nums">
              {stats[axis.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
