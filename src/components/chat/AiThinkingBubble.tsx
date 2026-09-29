import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Cpu,
  Layers,
  ShieldCheck,
  Search,
  FileText,
} from 'lucide-react';

interface AiThinkingBubbleProps {
  commodityName?: string;
  isCompleted?: boolean;
}

interface ThinkingStep {
  id: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
}

export const AiThinkingBubble: React.FC<AiThinkingBubbleProps> = ({
  commodityName,
  isCompleted = false,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps: ThinkingStep[] = [
    {
      id: 'step-1',
      label: commodityName
        ? `Analyzing physiology & composition for ${commodityName}`
        : 'Parsing query & extracting food matrix parameters',
      detail: 'Assessing moisture content, lipid fraction, pH, and physiological respiration demands...',
      icon: <Search size={14} />,
    },
    {
      id: 'step-2',
      label: 'Modeling spoilage kinetics & environmental vulnerability',
      detail: 'Simulating lipid peroxidation, moisture sorption isotherms, and microbial pathways...',
      icon: <Cpu size={14} />,
    },
    {
      id: 'step-3',
      label: 'Screening barrier polymer substrates (ASTM D3985 & F1249)',
      detail: 'Matching oxygen transmission rate (OTR) and water vapor transmission rate (WVTR)...',
      icon: <Layers size={14} />,
    },
    {
      id: 'step-4',
      label: 'Optimizing MAP headspace & seal hermeticity parameters',
      detail: 'Simulating N₂/CO₂ gas flush equilibria and anti-fog condensation control...',
      icon: <ShieldCheck size={14} />,
    },
    {
      id: 'step-5',
      label: 'Synthesizing evidence-based recommendation & candidate dossier',
      detail: 'Benchmarking recyclability (RIC codes), economic feasibility, and validation CCPs...',
      icon: <FileText size={14} />,
    },
  ];

  // Timer counter
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Progressive steps animation
  useEffect(() => {
    if (isCompleted) {
      setActiveStepIndex(steps.length);
      return;
    }

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isCompleted, steps.length]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '680px',
        margin: '0.25rem 0',
      }}
    >
      {/* ChatGPT-style Thinking Pill/Accordion */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Thinking Header Bar */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.95rem',
            backgroundColor: isExpanded ? '#f1f5f9' : '#f8fafc',
            border: 'none',
            borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                backgroundColor: '#125438',
                color: '#ffffff',
              }}
            >
              <Sparkles size={14} className={isCompleted ? '' : 'spin-pulse'} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 650,
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                {isCompleted ? 'Thought process complete' : 'Thinking...'}
              </span>

              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  backgroundColor: '#ffffff',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '999px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                {!isCompleted && <Loader2 size={10} className="spin" />}
                {seconds > 0 ? `${seconds}s` : 'reasoning'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
              {isExpanded ? 'Hide process' : 'Show reasoning'}
            </span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* Collapsible Reasoning Trace */}
        {isExpanded && (
          <div
            style={{
              padding: '0.85rem 1rem 0.95rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              backgroundColor: '#ffffff',
            }}
          >
            {/* Shimmer / Progress indicator line */}
            <div
              style={{
                height: '3px',
                width: '100%',
                backgroundColor: '#e2e8f0',
                borderRadius: '2px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, ((activeStepIndex + 1) / steps.length) * 100)}%`,
                  backgroundColor: '#125438',
                  borderRadius: '2px',
                  transition: 'width 0.4s ease',
                  position: 'relative',
                }}
              />
            </div>

            {/* Step list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.2rem' }}>
              {steps.map((step, idx) => {
                const isStepDone = idx < activeStepIndex || isCompleted;
                const isStepCurrent = idx === activeStepIndex && !isCompleted;

                return (
                  <div
                    key={step.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      opacity: isStepDone ? 0.75 : isStepCurrent ? 1 : 0.45,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <div
                      style={{
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: isStepDone
                          ? '#dcfce7'
                          : isStepCurrent
                          ? '#e0f2fe'
                          : '#f1f5f9',
                        color: isStepDone
                          ? '#15803d'
                          : isStepCurrent
                          ? '#0284c7'
                          : '#94a3b8',
                        flexShrink: 0,
                      }}
                    >
                      {isStepDone ? (
                        <CheckCircle2 size={13} />
                      ) : isStepCurrent ? (
                        <Loader2 size={12} className="spin" />
                      ) : (
                        step.icon
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isStepCurrent ? 700 : 600,
                          color: isStepCurrent ? '#0f172a' : isStepDone ? '#334155' : '#64748b',
                          lineHeight: 1.35,
                        }}
                      >
                        {step.label}
                      </div>
                      {isStepCurrent && (
                        <div
                          style={{
                            fontSize: '0.73rem',
                            color: '#64748b',
                            marginTop: '0.15rem',
                            lineHeight: 1.3,
                            fontStyle: 'italic',
                          }}
                        >
                          {step.detail}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current status note */}
            <div
              style={{
                marginTop: '0.2rem',
                paddingTop: '0.5rem',
                borderTop: '1px dashed #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: '#64748b',
              }}
            >
              <span>PackSmart AI Packaging Science Engine</span>
              <span style={{ fontWeight: 600, color: '#125438' }}>
                ASTM D3985 / ASTM F1249 Aligned
              </span>
            </div>
          </div>
        )}
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
          50% { transform: scale(1.15) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        .spin-pulse {
          animation: spinPulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
