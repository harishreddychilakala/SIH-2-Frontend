import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badgeText?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badgeText,
  actions,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1.25rem',
        marginBottom: '2rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontWeight: 800, letterSpacing: '-0.025em' }}>{title}</h1>
          {badgeText && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary-vivid)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--primary-border)',
                letterSpacing: '0.02em',
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
        {description && (
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', maxWidth: '820px', fontSize: '0.9375rem', lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
};
