import React from 'react';

const LABELS = { green: 'Routine', yellow: 'Same-day', red: 'Emergency' };

export default function UrgencyBadge({ urgency, size = 'md' }) {
  if (!urgency) return null;
  return (
    <span className={`urgency-badge urgency-${urgency} size-${size}`}>
      <span className="urgency-dot" />
      {LABELS[urgency] || urgency}
    </span>
  );
}
