import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  subMessage,
}) => {
  return (
    <div
      style={{
        padding: '4rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Loader2
        size={36}
        style={{
          color: 'var(--primary)',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem',
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>{message}</div>
      {subMessage && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
          {subMessage}
        </div>
      )}
    </div>
  );
};
