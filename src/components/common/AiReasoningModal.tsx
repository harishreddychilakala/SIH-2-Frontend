import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Cpu,
  Layers,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface AiReasoningModalProps {
  commodityName?: string;
  category?: string;
}

export const AiReasoningModal: React.FC<AiReasoningModalProps> = ({
  commodityName,
  category,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Validating Food Matrix & Storage Boundary',
      desc: commodityName
        ? `Preserving exact request parameters for ${commodityName} (${category || 'Food Item'}).`
        : 'Preserving exact user parameters, temperature, humidity, and target shelf life.',
      icon: <Search size={18} />,
    },
    {
      title: 'Modeling Degradation Kinetics & Moisture Equilibrium',
      desc: 'Evaluating water activity (Aw), lipid auto-oxidation risk, and critical microbial boundaries.',
      icon: <Cpu size={18} />,
    },
    {
      title: 'Screening Candidate Substrates (ASTM D3985 / ASTM F1249)',
      desc: 'Benchmarking barrier performance (OTR, WVTR) against 42 verified substrate catalog entries.',
      icon: <Layers size={18} />,
    },
    {
      title: 'Simulating Headspace Modified Atmosphere (MAP)',
      desc: 'Calculating gas flush dynamics (N₂, CO₂, O₂) and anti-fog condensation control.',
      icon: <ShieldCheck size={18} />,
    },
    {
      title: 'Compiling Evidence-Based Dossier (Sections A–G)',
      desc: 'Formulating candidate solutions, circularity trade-offs, and accredited laboratory validation plan.',
      icon: <FileText size={18} />,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);
    return () => clearInterval(stepTimer);
  }, [steps.length]);

  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '2rem auto',
        padding: '2.5rem 2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      {/* Header with ChatGPT style pulsing badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#125438',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(18, 84, 56, 0.25)',
            }}
          >
            <Sparkles size={22} className="spin-pulse" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              PackSmart AI Reasoning Engine
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Evaluating barrier physics, food safety & sustainability criteria
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#334155',
          }}
        >
          <Loader2 size={13} className="spin" style={{ color: '#125438' }} />
          <span>{seconds}s elapsed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>
          <span>Multi-Criteria Reasoning Pipeline</span>
          <span>{Math.round(((activeStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${((activeStep + 1) / steps.length) * 100}%`,
              height: '100%',
              backgroundColor: '#125438',
              borderRadius: '3px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Progressive Step Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {steps.map((st, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                backgroundColor: isCurrent ? '#f0fdf4' : isDone ? '#f8fafc' : '#ffffff',
                border: `1px solid ${isCurrent ? '#86efac' : isDone ? '#e2e8f0' : '#f1f5f9'}`,
                opacity: isDone ? 0.8 : isCurrent ? 1 : 0.4,
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  marginTop: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? '#dcfce7' : isCurrent ? '#125438' : '#e2e8f0',
                  color: isDone ? '#15803d' : isCurrent ? '#ffffff' : '#94a3b8',
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={16} />
                ) : isCurrent ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  st.icon
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: isCurrent ? 700 : 600,
                    color: isCurrent ? '#0f172a' : '#334155',
                    marginBottom: '0.2rem',
                  }}
                >
                  {st.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                  {st.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748b',
        }}
      >
        <span>Smart India Hackathon · SIH26236 Decision Support System</span>
        <span style={{ fontWeight: 600, color: '#125438' }}>ASTM D3985 / ASTM F1249 Protocols</span>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spinPulse {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        .spin-pulse {
          animation: spinPulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
