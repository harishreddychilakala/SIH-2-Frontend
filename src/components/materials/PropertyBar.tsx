import React from 'react';

interface PropertyBarProps {
  label: string;
  valueText: string;
  percentage: number; // 0 to 100
  color?: string;
  helpText?: string;
}

export const PropertyBar: React.FC<PropertyBarProps> = ({
  label,
  valueText,
  percentage,
  color = 'var(--primary)',
  helpText,
}) => {
  const safePercent = Math.min(100, Math.max(0, percentage));

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace' }}>
          {valueText}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${safePercent}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease-out',
          }}
        />
      </div>
      {helpText && (
        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '0.15rem', display: 'block' }}>
          {helpText}
        </span>
      )}
    </div>
  );
};
