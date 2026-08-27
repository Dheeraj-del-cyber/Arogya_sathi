import React from 'react';

/**
 * Signature visual: the patient's path through the public-health tiers, drawn as a
 * single winding road with stop markers — the visual thesis of the whole app
 * ("one thread through the healthcare journey"). Used on the referral tracker and
 * the home hero. `stops` is an ordered array of { label, sublabel }; `activeIndex`
 * is the furthest completed stop (-1 = nothing started yet).
 */
export default function JourneyPath({ stops, activeIndex = -1 }) {
  const w = 720;
  const h = 140;
  const pad = 60;
  const n = stops.length;
  const step = (w - pad * 2) / Math.max(n - 1, 1);
  const points = stops.map((_, i) => {
    const x = pad + step * i;
    const y = h / 2 + (i % 2 === 0 ? -18 : 18);
    return { x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const midX = (prev.x + p.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  return (
    <svg className="journey-path" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Patient journey across facility tiers">
      <path d={pathD} className="journey-track" fill="none" />
      <path
        d={pathD}
        className="journey-track-fill"
        fill="none"
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: activeIndex < 0 ? 1000 : 1000 - (1000 * activeIndex) / Math.max(n - 1, 1),
        }}
      />
      {points.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
          <circle r={i <= activeIndex ? 10 : 8} className={`journey-node ${i <= activeIndex ? 'done' : ''} ${i === activeIndex ? 'current' : ''}`} />
          <text y={i % 2 === 0 ? 30 : -22} textAnchor="middle" className="journey-label">{stops[i].label}</text>
          {stops[i].sublabel && (
            <text y={i % 2 === 0 ? 46 : -6} textAnchor="middle" className="journey-sublabel">{stops[i].sublabel}</text>
          )}
        </g>
      ))}
    </svg>
  );
}
