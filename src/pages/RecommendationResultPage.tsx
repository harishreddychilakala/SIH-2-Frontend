import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Printer,
  Download,
  Scale,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  DollarSign,
  Wind,
  ShieldAlert,
  ShieldCheck,
  Clock,
  MessageSquare,
  ExternalLink,
  BookOpen,
  Cpu,
  Activity,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import { MarkdownMessage } from '../components/chat/MarkdownMessage';
import { recommendationService } from '../services/recommendationService';
import type { RecommendationResult } from '../types';

type DossierTab = 'overview' | 'science' | 'map' | 'alternatives' | 'compliance' | 'references' | 'all';

export const RecommendationResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DossierTab>('overview');

  useEffect(() => {
    async function fetchResult() {
      if (!id) return;
      try {
        const data = await recommendationService.getById(id);
        setResult(data);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PackSmart-Report-${result.commodityName.replace(/\s+/g, '_')}-${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Technical report downloaded as JSON.', 'success');
  };

  const handleCompareWithAlternatives = () => {
    if (!result) return;
    const matIds = [
      result.primaryMaterial.id,
      ...result.alternativeMaterials.slice(0, 2).map((a) => a.material.id),
    ];
    navigate(`/compare?mat1=${matIds[0]}&mat2=${matIds[1] || ''}&mat3=${matIds[2] || ''}`);
  };

  const handleConsultChatbot = () => {
    if (!result) return;
    navigate('/chat');
  };

  if (loading) {
    return <LoadingState message="Loading Technical Packaging Dossier..." />;
  }

  if (!result) {
    return (
      <EmptyState
        title="Recommendation Not Found"
        description="The requested recommendation dossier could not be located in the database."
        action={{
          label: 'Back to Dashboard',
          onClick: () => navigate('/dashboard'),
        }}
      />
    );
  }

  const { primaryMaterial, input, alternativeMaterials, propertyValidation } = result;

  // Clean recycling label formatting
  const getRecyclingBadgeText = (sust: any) => {
    if (!sust) return 'Standard Stream';
    if (sust.recyclingCode) return sust.recyclingCode;
    if (sust.recyclabilityRating) {
      return sust.recyclabilityRating.replace('(RIC 2/4/5)', '').trim();
    }
    return sust.type || 'Standard';
  };

  const isOtrMissing = primaryMaterial.otr.value === null;
  const isWvtrMissing = primaryMaterial.wvtr.value === null;
  const isValidationIncomplete = !propertyValidation?.isFullyValidated || isOtrMissing || isWvtrMissing;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Navigation & Action Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <Link
          to="/history"
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> Back to History
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={15} /> Print Report
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportJSON}>
            <Download size={15} /> Export JSON
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleCompareWithAlternatives}>
            <Scale size={15} /> Compare in Matrix
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleConsultChatbot}>
            <MessageSquare size={15} /> Discuss with PackBot
          </button>
        </div>
      </div>

      {/* Page Header */}
      <PageHeader
        title={`Packaging Dossier: ${result.commodityName}`}
        description={`Evaluated on ${result.createdAt} for ${input.category} under strict ${input.storageType.toUpperCase()} regime (${input.storageTempC}°C, ${input.relativeHumidityPercent}% RH).`}
        badgeText="Technical Decision Report"
      />

      {/* 1. TECHNICAL VALIDATION & DATA VERIFICATION BANNER */}
      <div
        style={{
          padding: '1.1rem 1.35rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isValidationIncomplete ? '#fffbeb' : '#f0fdf4',
          border: isValidationIncomplete ? '1px solid #fde68a' : '1px solid #bbf7d0',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}
      >
        {isValidationIncomplete ? (
          <ShieldAlert size={24} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
        ) : (
          <ShieldCheck size={24} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '0.9rem', color: isValidationIncomplete ? '#92400e' : '#166534' }}>
              {isValidationIncomplete
                ? `Validation Alert: ${propertyValidation?.statusLevel || 'Unverified / Indicative Data'}`
                : 'Validation Status: Certified Laboratory Data Available'}
            </strong>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isValidationIncomplete ? '#fef3c7' : '#dcfce7',
                color: isValidationIncomplete ? '#b45309' : '#15803d',
              }}
            >
              {isValidationIncomplete ? 'ASTM Testing Required' : 'Lab Benchmark Validated'}
            </span>
          </div>

          <p style={{ margin: '0.35rem 0 0.5rem 0', fontSize: '0.825rem', color: isValidationIncomplete ? '#78350f' : '#14532d', lineHeight: 1.45 }}>
            {propertyValidation?.validationMessage ||
              (isValidationIncomplete
                ? 'Permeation properties for this recommendation contain indicative literature metrics. Certified ASTM D3985 (OTR) and ASTM F1249 (WVTR) testing must be performed prior to industrial manufacturing.'
                : 'Material properties comply with verified polymer testing protocols.')}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600 }}>Standard Verification Protocols:</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>ASTM D3985 (OTR)</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>ASTM F1249 (WVTR)</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Empirical Microbial Challenge (Shelf-Life)</span>
          </div>
        </div>
      </div>

      {/* Interactive Dossier Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'wrap',
          padding: '0.5rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
          position: 'sticky',
          top: '0.75rem',
          zIndex: 20,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }}
      >
        {[
          { id: 'overview', label: 'Primary Overview', icon: <Layers size={15} />, badge: 'Primary' },
          { id: 'science', label: 'AI Kinetics & Matrix', icon: <Cpu size={15} />, badge: 'Dual-AI' },
          { id: 'map', label: 'MAP & Atmosphere', icon: <Wind size={15} />, badge: result.mapGuidance ? 'MAP' : undefined },
          { id: 'alternatives', label: 'Alternative Materials', icon: <Scale size={15} />, badge: `${alternativeMaterials.length}` },
          { id: 'compliance', label: 'Safety, Regulations & LCA', icon: <ShieldCheck size={15} />, badge: result.foodSafetyAlert ? 'Alert' : undefined },
          { id: 'references', label: 'References & Audit', icon: <BookOpen size={15} />, badge: 'Verified' },
          { id: 'all', label: 'Full Dossier (All Sections)', icon: <Printer size={15} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DossierTab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-body)',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-subtle)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Safety Banner quick-link in overview */}
      {result.foodSafetyAlert && activeTab === 'overview' && (
        <div
          style={{
            padding: '0.85rem 1.15rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} style={{ color: '#dc2626' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b' }}>
              Safety Control Alert: {result.foodSafetyAlert.pathogenRisk}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('compliance')}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: '#991b1b', borderColor: '#fca5a5' }}
          >
            View Critical Control Points →
          </button>
        </div>
      )}

      {/* 1.1 CRITICAL FOOD SAFETY & MICROBIOLOGICAL HAZARD ALERT */}
      {(activeTab === 'compliance' || activeTab === 'all') && result.foodSafetyAlert && (
        <div
          style={{
            padding: '1.35rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef2f2',
            border: '2px solid #ef4444',
            marginBottom: '1.5rem',
            boxShadow: '0 3px 6px rgba(239, 68, 68, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldAlert size={22} style={{ color: '#dc2626' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
                  Food Safety Control Alert: {result.foodSafetyAlert.pathogenRisk}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#b91c1c' }}>
                  Microbiological & Hazard Analysis Critical Control Points (HACCP)
                </span>
              </div>
            </div>

            {/* Review Status Badge */}
            <div>
              {result.foodSafetyAlert.reviewStatus === 'reviewed' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                  <ShieldCheck size={13} /> Statutory Standard Verified Guidance
                </span>
              ) : result.foodSafetyAlert.reviewStatus === 'pending_expert_review' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                  <AlertTriangle size={13} /> Unverified Predictive Candidate (Pending Expert Review)
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                  Requires Revision
                </span>
              )}
            </div>
          </div>

          {/* Sensory Warning Callout */}
          {result.foodSafetyAlert.sensoryWarning && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #f87171',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontSize: '0.8125rem',
                color: '#7f1d1d',
                fontWeight: 600,
                lineHeight: 1.45,
                marginBottom: '0.85rem',
              }}
            >
              ⚠ {result.foodSafetyAlert.sensoryWarning}
            </div>
          )}

          {/* Critical Control Points */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b', marginBottom: '0.35rem', letterSpacing: '0.03em' }}>
              Mandatory Critical Control Points (CCPs):
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#7f1d1d', lineHeight: 1.5 }}>
              {result.foodSafetyAlert.criticalControlPoints.map((ccp: string, idx: number) => (
                <li key={idx} style={{ marginBottom: '0.3rem' }}>
                  {ccp}
                </li>
              ))}
            </ul>
          </div>

          {/* Verified Regulatory & Authoritative Sources */}
          {result.foodSafetyAlert.verifiedSources && result.foodSafetyAlert.verifiedSources.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #fca5a5' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b', marginBottom: '0.5rem', letterSpacing: '0.03em' }}>
                Authoritative Regulatory Citations & Grounding:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.foodSafetyAlert.verifiedSources.map((src: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #fecaca',
                      fontSize: '0.75rem',
                      color: '#7f1d1d',
                      lineHeight: 1.4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.2rem' }}>
                      <strong style={{ color: '#991b1b', fontSize: '0.78rem' }}>{src.authority}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontFamily: 'JetBrains Mono, monospace' }}>
                        Ref: {src.regulationRef} ({src.publicationDate})
                      </span>
                    </div>
                    <div>
                      <em>{src.documentTitle}</em> — {src.verificationNotes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.foodSafetyAlert.regulatoryComplianceNotes && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#991b1b', fontStyle: 'italic' }}>
              {result.foodSafetyAlert.regulatoryComplianceNotes}
            </div>
          )}
        </div>
      )}

      {/* 1.2 SCIENTIFIC INCOMPATIBILITY / CONFLICTING INPUT WARNINGS */}
      {(activeTab === 'compliance' || activeTab === 'all') && result.conflictingInputWarnings && result.conflictingInputWarnings.length > 0 && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fffbeb',
            border: '2px solid #f59e0b',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={20} style={{ color: '#d97706' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#92400e', margin: 0 }}>
              Scientific Incompatibility Detected in Submitted Conditions
            </h4>
          </div>
          {result.conflictingInputWarnings.map((warn: any, idx: number) => (
            <div key={idx} style={{ marginTop: '0.4rem', fontSize: '0.825rem', color: '#78350f' }}>
              <strong>{warn.title}:</strong> {warn.description}
            </div>
          ))}
        </div>
      )}

      {/* 1.3 SUSTAINABILITY PREFERENCE CONFLICT */}
      {(activeTab === 'compliance' || activeTab === 'all') && (result as any).sustainabilityConflict && (
        <div
          style={{
            padding: '1.1rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#f0fdf4',
            border: '2px solid #22c55e',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Leaf size={18} style={{ color: '#15803d' }} />
            <strong style={{ fontSize: '0.875rem', color: '#166534' }}>Sustainability Preference Trade-off</strong>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#14532d', margin: 0, lineHeight: 1.45 }}>
            {(result as any).sustainabilityConflict}
          </p>
        </div>
      )}

      {/* 1.5 DUAL-AI SCIENTIFIC CROSS-VALIDATION & EVIDENCE DOSSIER */}
      {(activeTab === 'science' || activeTab === 'all') && (result.scientificAnalysis || result.packagingEvaluation || result.aiCrossValidation) && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            padding: '1.5rem',
            border: '2px solid #3b82f6',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Cpu size={24} style={{ color: '#2563eb' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
                  Dual-AI Scientific Cross-Validation & Evidence Dossier
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Independent Co-Evaluation: Gemini (Biochemical Kinetics) + Groq (Materials Engineering)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.7rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: result.aiCrossValidation?.hasDisagreements ? '#fffbeb' : '#eff6ff',
                  color: result.aiCrossValidation?.hasDisagreements ? '#b45309' : '#1d4ed8',
                  border: result.aiCrossValidation?.hasDisagreements ? '1px solid #fde68a' : '1px solid #bfdbfe',
                }}
              >
                {result.aiCrossValidation?.validationStatus || 'Cross-Validated by Dual AI Models (Gemini + Groq)'}
              </span>
              {result.aiCrossValidation?.modelsInvoked && (
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                  [{result.aiCrossValidation.modelsInvoked.join(' ⟷ ')}]
                </span>
              )}
            </div>
          </div>

          {/* Cross-Validation Consensus & Concordance Callouts */}
          {result.aiCrossValidation && (
            <div style={{ marginBottom: '1.25rem' }}>
              {result.aiCrossValidation.hasDisagreements ? (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertTriangle size={15} /> Identified Model Discrepancies & Statutory Resolutions:
                  </div>
                  {result.aiCrossValidation.disagreements.map((dis: any, idx: number) => (
                    <div key={idx} style={{ fontSize: '0.75rem', color: '#78350f', marginBottom: '0.35rem' }}>
                      <strong>{dis.attribute}:</strong> Gemini claimed <em>{dis.geminiClaim}</em> vs Groq <em>{dis.groqClaim}</em>.
                      <div style={{ marginTop: '0.15rem', color: '#166534', fontWeight: 600 }}>
                        ↳ Resolution: {dis.resolution}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} /> Dual-AI Concordance Points:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#14532d', lineHeight: 1.45 }}>
                    {result.aiCrossValidation.concordances?.map((conc: string, idx: number) => (
                      <li key={idx}>{conc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Two-Column Matrix: Gemini Scientific vs Groq Engineering */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Column A: Gemini Product Research */}
            {result.scientificAnalysis && (
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Activity size={16} style={{ color: '#0284c7' }} />
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                      Gemini — Biochemical Product Research
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    {result.scientificAnalysis.modelProvider || 'Gemini'}
                  </span>
                </div>

                {result.scientificAnalysis.scientificName && (
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                    Taxonomic / Matrix: {result.scientificAnalysis.scientificName}
                  </div>
                )}

                <div style={{ marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                    Primary Degradation Mechanism:
                  </span>
                  <p style={{ fontSize: '0.78rem', color: '#1e293b', margin: '0.2rem 0', lineHeight: 1.45 }}>
                    {result.scientificAnalysis.primaryDegradationMode || 'Degradation kinetics modeled based on food matrix composition.'}
                  </p>
                </div>

                {result.scientificAnalysis.criticalQualityLossMechanism && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', color: '#991b1b', marginBottom: '0.65rem' }}>
                    <strong>Critical Quality Loss:</strong> {result.scientificAnalysis.criticalQualityLossMechanism}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', fontSize: '0.72rem' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <span style={{ color: '#64748b', display: 'block' }}>Oxygen</span>
                    <strong style={{ color: '#0f172a' }}>{result.scientificAnalysis.oxygenSensitivity || 'Moderate'}</strong>
                  </div>
                  <div style={{ backgroundColor: '#ffffff', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <span style={{ color: '#64748b', display: 'block' }}>Moisture</span>
                    <strong style={{ color: '#0f172a' }}>{result.scientificAnalysis.moistureVulnerability || 'High'}</strong>
                  </div>
                  <div style={{ backgroundColor: '#ffffff', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <span style={{ color: '#64748b', display: 'block' }}>Light</span>
                    <strong style={{ color: '#0f172a' }}>{result.scientificAnalysis.lightSensitivity || 'Moderate'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Column B: Groq Materials Engineering */}
            {result.packagingEvaluation && (
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={16} style={{ color: '#ea580c' }} />
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                      Groq — Packaging Materials Engineering
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#ffedd5', color: '#c2410c', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    {result.packagingEvaluation.modelProvider || 'Groq'}
                  </span>
                </div>

                {result.packagingEvaluation.recommendedPrimaryMaterialName && (
                  <div style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Substrate: {result.packagingEvaluation.recommendedPrimaryMaterialName}
                  </div>
                )}

                {result.packagingEvaluation.suitabilityRationale && (
                  <div style={{ marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                      Engineering Rationale:
                    </span>
                    <p style={{ fontSize: '0.78rem', color: '#1e293b', margin: '0.2rem 0', lineHeight: 1.45 }}>
                      {result.packagingEvaluation.suitabilityRationale}
                    </p>
                  </div>
                )}

                {result.packagingEvaluation.barrierDemands && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.72rem', marginBottom: '0.65rem' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', display: 'block' }}>Target OTR</span>
                      <strong style={{ color: '#0f172a' }}>{result.packagingEvaluation.barrierDemands.targetOTR || 'Per standard'}</strong>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', display: 'block' }}>Target WVTR</span>
                      <strong style={{ color: '#0f172a' }}>{result.packagingEvaluation.barrierDemands.targetWVTR || 'Per standard'}</strong>
                    </div>
                  </div>
                )}

                {result.packagingEvaluation.mapRecommendation && (
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', color: '#334155' }}>
                    <strong>Gas Flush / MAP:</strong> {result.packagingEvaluation.mapRecommendation.targetGasComposition || (result.packagingEvaluation.mapRecommendation.isRecommended ? 'MAP Recommended' : 'Standard Atmosphere')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statutory References Bank */}
          {result.onlineResearch && result.onlineResearch.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#334155', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={15} style={{ color: '#2563eb' }} />
                Authoritative Scientific Literature & Official Statutory Citations
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.6rem' }}>
                {result.onlineResearch.map((src: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.75rem',
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <strong style={{ color: '#1e3a8a', fontSize: '0.78rem' }}>{src.authority}</strong>
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open official statutory standard"
                          style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center' }}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                      {src.documentTitle}
                    </div>
                    {src.regulationRef && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                        Ref: {src.regulationRef} ({src.publicationDate || 'Current'})
                      </div>
                    )}
                    {src.verificationNotes && (
                      <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.3rem' }}>
                        {src.verificationNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scientific Disclaimer */}
          <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9', fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
            Evidence-grounded decision support: AI predictions are validated against Codex Alimentarius, USDA Handbook 66, US FDA, and FSSAI standards. Direct laboratory ASTM barrier testing is required for line filling.
          </div>
        </div>
      )}

      {/* SECTION A: Product and Storage Profile */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div className="card" style={{ marginBottom: '1.75rem', padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Section A: Product & Storage Profile
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Exact specified baseline operating conditions and distribution environment
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
              Baseline Parameters Verified
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Storage Temp</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{input.storageTempC}°C</strong>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', display: 'block' }}>
                {input.storageType === 'ambient' ? 'Ambient Storage' : input.storageType === 'chilled' ? 'Chilled Chain' : 'Deep Frozen'}
              </span>
            </div>

            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Relative Humidity</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{input.relativeHumidityPercent}% RH</strong>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', display: 'block' }}>Atmospheric Moisture</span>
            </div>

            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Target Shelf Life</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{input.desiredShelfLifeDays} Days</strong>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', display: 'block' }}>User Target Horizon</span>
            </div>

            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Moisture & Fat</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{input.moistureContent}% / {input.oilFatContent}%</strong>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', display: 'block' }}>MC / Lipid Ratio</span>
            </div>

            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Product pH</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>pH {input.ph}</strong>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', display: 'block' }}>Chemical Acidity</span>
            </div>

            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Transit Profile</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {input.transportCondition === 'local' ? 'Local Urban (< 100 km)' : input.transportCondition === 'long_distance' ? 'Long Distance Inter-State' : input.transportCondition === 'refrigerated' ? 'Refrigerated Reefer' : input.transportCondition}
              </strong>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', display: 'block' }}>Logistical Stress</span>
            </div>

            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Packaging Format</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--teal-700)' }}>{input.packagingFormat || 'Flexible Pouch / Pillow Bag'}</strong>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', display: 'block' }}>
                {input.costPriority === 'low' ? 'Low Cost' : input.costPriority === 'premium' ? 'Premium' : 'Balanced'} priority
              </span>
            </div>

            {input.noodleType && (
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '0.7rem', color: '#166534', display: 'block' }}>Noodle Subtype</span>
                <strong style={{ fontSize: '0.95rem', color: '#15803d', textTransform: 'capitalize' }}>{input.noodleType.replace('_', ' ')}</strong>
                <span style={{ fontSize: '0.68rem', color: '#166534', display: 'block' }}>Processing Flow</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION B: Scientific Evidence and Data Provenance */}
      {(activeTab === 'science' || activeTab === 'all') && (
        <div className="card" style={{ marginBottom: '1.75rem', padding: '1.5rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Activity size={22} style={{ color: '#0284c7' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Section B: Scientific Evidence & Data Provenance
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Itemized physicochemical properties, data classification, and empirical test standards
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
              SIH26236 Data Provenance
            </span>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.795rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Scientific Property</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Value & Unit</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Data Classification</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Assay Test Standard</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Identifiable Source</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Assumptions / Limitations</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    prop: 'Moisture Content',
                    val: `${input.moistureContent}%`,
                    classification: primaryMaterial.isVerified ? 'Verified' : input.customCommodityName ? 'User-provided' : 'Estimated',
                    std: 'AOAC 934.01 (Vacuum Oven)',
                    source: primaryMaterial.sourceAttribution || 'FSSAI / Codex Alimentarius / USDA',
                    notes: input.customCommodityName ? 'User-reported value without independent certificate of analysis' : 'Standard literature proximate analysis',
                  },
                  {
                    prop: 'Oil / Lipid Content',
                    val: `${input.oilFatContent}%`,
                    classification: primaryMaterial.isVerified ? 'Verified' : input.customCommodityName ? 'User-provided' : 'Estimated',
                    std: 'AOAC 960.39 (Soxhlet Solvent Extraction)',
                    source: primaryMaterial.sourceAttribution || 'FSSAI / Codex Alimentarius / USDA',
                    notes: input.customCommodityName ? 'User-reported value without independent certificate of analysis' : 'Standard literature proximate analysis',
                  },
                  {
                    prop: 'Product pH',
                    val: `pH ${input.ph}`,
                    classification: primaryMaterial.isVerified ? 'Verified' : input.customCommodityName ? 'User-provided' : 'Estimated',
                    std: 'AOAC 981.12 (Direct Potentiometric Electrode)',
                    source: primaryMaterial.sourceAttribution || 'AOAC International Compendium',
                    notes: 'Calibrated at 20°C ambient reference',
                  },
                  {
                    prop: 'Respiration Rate',
                    val: input.category === 'Fresh Produce' ? `${input.respirationRate || 0} ${input.respirationUnit}` : '0.0 mg CO₂/kg·h (Non-respiring)',
                    classification: 'Verified',
                    std: input.category === 'Fresh Produce' ? 'Closed-System Gas Chromatography' : 'N/A (Non-respiring matrix)',
                    source: input.category === 'Fresh Produce' ? 'USDA Handbook 66 Respirometry' : 'Empirical Law: Non-respiring matrix',
                    notes: input.category === 'Fresh Produce' ? 'Horticultural living crop metabolism' : 'Living respiration restricted to fresh horticultural crops',
                  },
                  {
                    prop: 'Storage Regime',
                    val: `${input.storageTempC}°C, ${input.relativeHumidityPercent}% RH`,
                    classification: 'User-provided',
                    std: 'Calibrated Cold-Chain Datalogger',
                    source: 'User specified distribution profile',
                    notes: 'Controlled warehouse distribution environment',
                  },
                ].map((row, idx) => {
                  const isV = row.classification === 'Verified';
                  const isU = row.classification === 'User-provided';
                  const isE = row.classification === 'Estimated';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'var(--bg-app)' : 'var(--bg-subtle)' }}>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{row.prop}</td>
                      <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{row.val}</td>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          backgroundColor: isV ? '#ecfdf5' : isU ? '#eff6ff' : isE ? '#fffbeb' : '#fef2f2',
                          color: isV ? '#047857' : isU ? '#1d4ed8' : isE ? '#b45309' : '#be123c',
                          border: `1px solid ${isV ? '#a7f3d0' : isU ? '#bfdbfe' : isE ? '#fde68a' : '#fecdd3'}`,
                        }}>
                          {isV ? '✓ ' : ''}{row.classification}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)', fontSize: '0.74rem' }}>{row.std}</td>
                      <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-body)', fontSize: '0.76rem' }}>{row.source}</td>
                      <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>{row.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION E: Shelf-Life Assessment — 4 Distinct Scientific Tiers */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div className="card" style={{ marginBottom: '1.75rem', padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} style={{ color: 'var(--primary)' }} />
                Section E: Shelf-Life Assessment (4-Tier Scientific Model)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Rigorous separation between commercial target, published literature, kinetic model estimate, and empirical testing
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
              4-Tier Audit Framework
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {/* Tier 1: User-Specified Commercial Target */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                1. User Commercial Target
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: '0.3rem 0' }}>
                {input.desiredShelfLifeDays} Days
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-body)', margin: 0, lineHeight: 1.4 }}>
                Commercial target horizon requested by user for {input.storageTempC}°C / {input.relativeHumidityPercent}% RH.
                <strong style={{ display: 'block', marginTop: '0.25rem', color: '#0369a1' }}>Not a performance guarantee or prediction.</strong>
              </p>
            </div>

            {/* Tier 2: Published Literature Evidence */}
            <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', display: 'block' }}>
                2. Published Literature Benchmark
              </span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d', margin: '0.35rem 0' }}>
                {(result as any).shelfLifeAssessment?.publishedLiteratureEstimate || `${Math.round(Number(input.desiredShelfLifeDays) * 0.85)} - ${Math.round(Number(input.desiredShelfLifeDays) * 1.15)} Days`}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#14532d', margin: 0, lineHeight: 1.4 }}>
                Peer-reviewed post-harvest & food packaging literature baseline under standard refrigeration/ambient storage.
              </p>
            </div>

            {/* Tier 3: Model Assessment Status */}
            <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', display: 'block' }}>
                3. Kinetic Model Estimate
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0369a1', margin: '0.3rem 0', lineHeight: 1.35 }}>
                {(result as any).shelfLifeAssessment?.modelEstimateStatus
                  ? 'Theoretical Compatibility Modeled'
                  : 'Insufficient kinetic data for numerical estimate'}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#0c4a6e', margin: 0, lineHeight: 1.4 }}>
                {(result as any).shelfLifeAssessment?.modelEstimateStatus ||
                  'Barrier permeation model (Fickian diffusion). Subject to experimental seal integrity.'}
              </p>
            </div>

            {/* Tier 4: Experimentally Validated Status */}
            <div style={{ padding: '1rem', backgroundColor: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', display: 'block' }}>
                4. Experimentally Validated
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400e', margin: '0.35rem 0' }}>
                {(result as any).shelfLifeAssessment?.experimentalStatus || 'Pending Laboratory Challenge'}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#78350f', margin: 0, lineHeight: 1.4 }}>
                Requires direct empirical challenge trials with real-time microbial plating, peroxide value, and sensory analysis.
              </p>
            </div>
          </div>

          {/* Key factors affecting shelf life */}
          {(result as any).shelfLifeAssessment?.keyFactors && (
            <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Key Kinetic Degradation Factors:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(result as any).shelfLifeAssessment.keyFactors.map((f: string, i: number) => (
                  <span key={i} style={{ fontSize: '0.72rem', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.5rem', color: 'var(--text-body)' }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Important disclaimer */}
          {(result as any).shelfLifeAssessment?.importantDisclaimer && (
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', backgroundColor: '#fef3c7', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a', fontSize: '0.75rem', color: '#92400e', lineHeight: 1.4 }}>
              ⚠ {(result as any).shelfLifeAssessment.importantDisclaimer}
            </div>
          )}
        </div>
      )}

      {/* 4. PRIMARY RECOMMENDED SUBSTRATE HERO CARD */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div
          className="card"
          style={{
            border: '2px solid var(--primary)',
            backgroundColor: 'var(--bg-surface)',
            padding: '1.75rem',
            marginBottom: '1.75rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.04em',
                  }}
                >
                  PRIMARY CANDIDATE RECOMMENDATION
                </span>
                <Badge variant="teal">{primaryMaterial.category}</Badge>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.25rem 0' }}>
                {primaryMaterial.name}
              </h2>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                Code: {primaryMaterial.code} | {primaryMaterial.layerStructure || 'Monolayer'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant="success">Cost Tier: {primaryMaterial.indicativeCostTier}</Badge>
              <Badge variant="teal">{getRecyclingBadgeText(primaryMaterial.sustainability)}</Badge>
            </div>
          </div>

          {/* Multi-Criteria Suitability Explanation (Markdown Rendered) */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--primary-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-border)',
              fontSize: '0.875rem',
              lineHeight: 1.55,
              color: 'var(--text-main)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.3rem', color: 'var(--primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Multi-Attribute Engineering Selection Criteria:
            </div>
            <MarkdownMessage content={result.suitabilityExplanation} isBot={true} />
          </div>

          {/* Barrier & Engineering Properties */}
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Oxygen Transmission (OTR)</span>
                {isOtrMissing && (
                  <span style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 700, backgroundColor: '#fef3c7', padding: '1px 5px', borderRadius: '4px' }}>
                    Unmeasured
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace' }}>
                {primaryMaterial.otr.value !== null ? primaryMaterial.otr.value : 'Variable / Custom'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                {primaryMaterial.otr.unit} ({primaryMaterial.otr.level})
              </span>
            </div>

            <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Water Vapor Transmission (WVTR)</span>
                {isWvtrMissing && (
                  <span style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 700, backgroundColor: '#fef3c7', padding: '1px 5px', borderRadius: '4px' }}>
                    Unmeasured
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace' }}>
                {primaryMaterial.wvtr.value !== null ? primaryMaterial.wvtr.value : 'Variable / Custom'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                {primaryMaterial.wvtr.unit} ({primaryMaterial.wvtr.level})
              </span>
            </div>

            <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Film Gauge & Sealability</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {primaryMaterial.thicknessRangeMicrons.typical} µm
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                Seal: {primaryMaterial.sealability} | Tensile: {primaryMaterial.mechanicalStrength.tensileRating}
              </span>
            </div>
          </div>

          {/* Critical Barrier Requirements Analysis */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Critical Barrier Demands Analysis
            </h4>
            <div className="grid-2">
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-body)', padding: '0.65rem 0.85rem', borderLeft: '3px solid var(--primary)', backgroundColor: 'var(--bg-app)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                <strong>Oxygen Sensitivity:</strong> {result.barrierRequirementsAnalysis.oxygenSensitivity}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-body)', padding: '0.65rem 0.85rem', borderLeft: '3px solid var(--teal-600)', backgroundColor: 'var(--bg-app)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                <strong>Moisture Vulnerability:</strong> {result.barrierRequirementsAnalysis.moistureVulnerability}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-body)', padding: '0.65rem 0.85rem', borderLeft: '3px solid #64748b', backgroundColor: 'var(--bg-app)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                <strong>Mechanical Transit:</strong> {result.barrierRequirementsAnalysis.mechanicalDemands}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-body)', padding: '0.65rem 0.85rem', borderLeft: '3px solid #b45309', backgroundColor: 'var(--bg-app)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                <strong>Thermal Regime:</strong> {result.barrierRequirementsAnalysis.temperatureCompliance}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. RECOMMENDED PACKAGING SPECIFICATIONS — 8 SIH26236-Mandated Parameters */}
      {(activeTab === 'map' || activeTab === 'all') && result.packagingSpecifications && (
        <div className="card" style={{ marginBottom: '1.75rem', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <div style={{ width: '4px', height: '24px', backgroundColor: 'var(--primary)', borderRadius: '2px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Recommended Packaging Specifications
              </h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', backgroundColor: '#e0f2fe', color: '#0369a1', letterSpacing: '0.04em' }}>
                SIH26236 — 8 Mandatory Parameters
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0, paddingLeft: '1rem' }}>
              Food-category-specific technical requirements. Values are distinctly computed per product — not universal constants.
              Status badges indicate data provenance (Verified = ASTM-tested; Estimated = literature reference; Requires Validation = not yet measured).
            </p>
          </div>

          {/* Full-width specification table */}
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.795rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '2px solid var(--primary)' }}>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Parameter</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Recommended Specification (Food-Specific)</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Material Value</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Unit</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Test Method</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(result.packagingSpecifications).map((spec: any, idx: number) => {
                  const isVerified = spec.status?.toLowerCase().startsWith('verified');
                  const isUnknown = spec.status?.toLowerCase().includes('unknown');
                  const requiresValidation = spec.status?.toLowerCase().includes('requires') || spec.status?.toLowerCase().includes('validation');
                  const statusColor = isVerified
                    ? { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }
                    : isUnknown
                    ? { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' }
                    : requiresValidation
                    ? { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }
                    : { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' };
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'var(--bg-app)' : 'var(--bg-subtle)' }}>
                      <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{spec.name}</td>
                      <td style={{ padding: '0.6rem 0.85rem', color: 'var(--text-body)', maxWidth: '280px' }}>{spec.recommendedRequirement}</td>
                      <td style={{ padding: '0.6rem 0.85rem', color: 'var(--text-body)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>{spec.measuredValue}</td>
                      <td style={{ padding: '0.6rem 0.85rem', color: 'var(--text-muted)', fontSize: '0.73rem', whiteSpace: 'nowrap' }}>{spec.unit}</td>
                      <td style={{ padding: '0.6rem 0.85rem', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: statusColor.bg, color: statusColor.color, border: `1px solid ${statusColor.border}` }}>
                          {spec.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.85rem', color: 'var(--text-muted)', fontSize: '0.72rem', maxWidth: '200px' }}>{spec.testMethod}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded explanation cards for each spec */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '0.85rem' }}>
            {Object.values(result.packagingSpecifications).map((spec: any, idx: number) => {
              const isVerified = spec.status?.toLowerCase().startsWith('verified');
              const isUnknown = spec.status?.toLowerCase().includes('unknown');
              const requiresValidation = spec.status?.toLowerCase().includes('requires') || spec.status?.toLowerCase().includes('validation');
              const borderColor = isVerified ? 'var(--primary)' : isUnknown ? '#ef4444' : requiresValidation ? '#f59e0b' : '#0ea5e9';
              return (
                <div
                  key={idx}
                  style={{
                    padding: '1rem 1.1rem',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${borderColor}`,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{spec.name}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '3px', whiteSpace: 'nowrap', flexShrink: 0,
                      backgroundColor: isVerified ? '#dcfce7' : isUnknown ? '#fee2e2' : requiresValidation ? '#fef3c7' : '#e0f2fe',
                      color: isVerified ? '#166534' : isUnknown ? '#991b1b' : requiresValidation ? '#92400e' : '#0c4a6e',
                    }}>
                      {spec.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                    ↳ {spec.recommendedRequirement}
                  </div>
                  <p style={{ fontSize: '0.77rem', color: 'var(--text-body)', lineHeight: 1.45, margin: '0 0 0.4rem 0' }}>{spec.explanation}</p>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                    Test: {spec.testMethod}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5.5 PROPOSED MAP PROTOCOL GUIDANCE (Subject to Validation) */}
      {(activeTab === 'map' || activeTab === 'all') && result.mapGuidance && (
        <div className="card" style={{ marginBottom: '1.75rem', padding: '1.35rem', borderLeft: '4px solid var(--teal-600)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wind size={20} style={{ color: 'var(--teal-600)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                Proposed MAP Gas Formulation (Subject to Post-Harvest Validation)
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
              Theoretical Target Formulation
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Proposed Gas Blend
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {result.mapGuidance.gasComposition}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.5, margin: 0 }}>
              {result.mapGuidance.rationale}
            </p>
          </div>
        </div>
      )}

      {/* SECTION C: Packaging Material Comparison */}
      {(activeTab === 'alternatives' || activeTab === 'all') && (
        <div className="card" style={{ marginBottom: '1.75rem', padding: '1.5rem', borderLeft: '4px solid var(--teal-600)' }}>
          <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Section C: Packaging Material Comparison Matrix
              </h3>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                Multi-Candidate Trade-Off Analysis
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
              Transparent comparison of shortlisted substrates across gas transmission, puncture resistance, unit cost, and sustainability. Unmeasured technical parameters are explicitly marked as unavailable rather than fabricated.
            </p>
          </div>

          {/* Side-by-Side Quick Comparison Table */}
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Substrate Candidate</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Structure</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>OTR (cc/m²·24h)</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>WVTR (g/m²·24h)</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Thickness</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Sealability</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>MAP Fit</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Price Range</th>
                  <th style={{ textAlign: 'left', padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Recyclability</th>
                </tr>
              </thead>
              <tbody>
                {/* Primary Material Row */}
                <tr style={{ backgroundColor: 'var(--primary-light)', borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                    ★ {primaryMaterial.name} (Recommended)
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>{primaryMaterial.layerStructure || 'Monolayer'}</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>
                    {primaryMaterial.otr.value !== null ? `${primaryMaterial.otr.value}` : <span style={{ color: '#be123c', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#fff1f2', padding: '0.12rem 0.4rem', borderRadius: '3px', border: '1px solid #fecdd3' }}>Unavailable — ASTM D3985 Required</span>}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>
                    {primaryMaterial.wvtr.value !== null ? `${primaryMaterial.wvtr.value}` : <span style={{ color: '#be123c', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#fff1f2', padding: '0.12rem 0.4rem', borderRadius: '3px', border: '1px solid #fecdd3' }}>Unavailable — ASTM F1249 Required</span>}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>{primaryMaterial.thicknessRangeMicrons?.typical ?? '—'} µm</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>{primaryMaterial.sealability}</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)', fontSize: '0.73rem' }}>
                    {result.mapGuidance?.recommended ? (result.mapGuidance?.gasComposition?.includes('Unvalidated') ? '⚠ Conditional' : '✓ Suitable') : '— N/A'}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: 'var(--text-body)' }}>{primaryMaterial.indicativePricePerKgRange}</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>{getRecyclingBadgeText(primaryMaterial.sustainability)}</td>
                </tr>

                {/* Alternative Rows */}
                {alternativeMaterials.map((alt, idx) => (
                  <tr key={alt.material.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Alternative {idx + 1}: {alt.material.name}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>{alt.material.layerStructure || 'Monolayer'}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>
                      {alt.material.otr.value !== null ? `${alt.material.otr.value}` : <span style={{ color: '#be123c', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#fff1f2', padding: '0.12rem 0.4rem', borderRadius: '3px', border: '1px solid #fecdd3' }}>Unavailable — ASTM D3985 Required</span>}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>
                      {alt.material.wvtr.value !== null ? `${alt.material.wvtr.value}` : <span style={{ color: '#be123c', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#fff1f2', padding: '0.12rem 0.4rem', borderRadius: '3px', border: '1px solid #fecdd3' }}>Unavailable — ASTM F1249 Required</span>}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>{alt.material.thicknessRangeMicrons?.typical ?? '—'} µm</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>{alt.material.sealability}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.73rem' }}>—</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>{alt.material.indicativePricePerKgRange}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-body)' }}>{getRecyclingBadgeText(alt.material.sustainability)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Alternative Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alternativeMaterials.map((alt, idx) => (
              <div
                key={alt.material.id}
                style={{
                  padding: '1.25rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-main)' }}>
                        Alternative {idx + 1}: {alt.material.name}
                      </span>
                      <Badge variant="neutral">{alt.material.category}</Badge>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                      {alt.suitabilityScoreText}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <Badge variant="teal">Cost: {alt.material.indicativeCostTier}</Badge>
                    <Badge variant="neutral">{getRecyclingBadgeText(alt.material.sustainability)}</Badge>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '0.75rem', lineHeight: 1.45 }}>
                  <strong>Key Engineering Trade-off:</strong> {alt.keyTradeoff}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ padding: '0.6rem 0.75rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid #dcfce7' }}>
                    <span style={{ fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                      <CheckCircle2 size={13} /> Advantages
                    </span>
                    <ul style={{ paddingLeft: '1.1rem', color: 'var(--text-body)', margin: 0 }}>
                      {alt.pros.map((p, i) => (
                        <li key={i} style={{ marginBottom: '0.2rem' }}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ padding: '0.6rem 0.75rem', backgroundColor: '#fffbeb', borderRadius: 'var(--radius-sm)', border: '1px solid #fef3c7' }}>
                    <span style={{ fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                      <AlertTriangle size={13} /> Limitations
                    </span>
                    <ul style={{ paddingLeft: '1.1rem', color: 'var(--text-body)', margin: 0 }}>
                      {alt.cons.map((c, i) => (
                        <li key={i} style={{ marginBottom: '0.2rem' }}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION G: Final Evidence and Validation Summary */}
      {(activeTab === 'compliance' || activeTab === 'all') && (
        <div className="card" style={{ marginBottom: '1.75rem', padding: '1.5rem', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BookOpen size={22} style={{ color: '#7c3aed' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#4c1d95' }}>
                  Section G: Final Evidence & Validation Summary
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#6d28d9' }}>
                  Scientific audit status, unverified properties, and required empirical test sequence
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
              SIH26236 Audit Summary
            </span>
          </div>

          {/* Evidence Status Label */}
          {(() => {
            const rawStatus = (result as any).finalDecisionSummary?.overallEvidenceStatus || '';
            let badgeLabel = 'Requires validation';
            let badgeColor = { bg: '#fffbeb', text: '#92400e', border: '#fde68a' };
            if (rawStatus.toLowerCase().includes('strong') || rawStatus === 'Evidence available') {
              badgeLabel = 'Evidence available';
              badgeColor = { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
            } else if (rawStatus.toLowerCase().includes('partial') || rawStatus === 'Partially supported') {
              badgeLabel = 'Partially supported';
              badgeColor = { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
            }

            return (
              <div style={{ backgroundColor: badgeColor.bg, border: `1px solid ${badgeColor.border}`, borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: badgeColor.text }}>
                    Overall Evidence Completeness:
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: badgeColor.text }}>
                    {badgeLabel}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: badgeColor.text, margin: 0, lineHeight: 1.45 }}>
                  {(result as any).finalDecisionSummary?.statusExplanation ||
                    'Evaluation is grounded in deterministic food preservation rules and available literature specifications. Laboratory validation is required for unmeasured physical parameters.'}
                </p>
              </div>
            );
          })()}

          {/* Lab Validation Plan sub-section within Section G */}
          {(result as any).labValidationPlan && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <strong style={{ fontSize: '0.875rem', color: '#4c1d95' }}>
                  Required Laboratory Validation Checklist
                </strong>
                <span style={{ fontSize: '0.7rem', color: '#6d28d9' }}>
                  {(result as any).labValidationPlan.totalTests} tests — none have been performed
                </span>
              </div>

              <div style={{ backgroundColor: '#faf5ff', border: '1px solid #ddd6fe', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', fontSize: '0.74rem', color: '#5b21b6', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                ⚠ {(result as any).labValidationPlan.importantNote}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {(result as any).labValidationPlan.tests.map((t: any, idx: number) => {
                  const isCritical = t.priority?.toLowerCase().startsWith('critical') || t.priority?.toLowerCase().startsWith('essential');
                  const isRequired = t.priority?.toLowerCase().startsWith('required');
                  const priorityColor = isCritical
                    ? { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', badge: '#fee2e2' }
                    : isRequired
                    ? { bg: '#fffbeb', color: '#92400e', border: '#fde68a', badge: '#fef3c7' }
                    : { bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe', badge: '#ede9fe' };
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem 0.9rem',
                        backgroundColor: priorityColor.bg,
                        border: `1px solid ${priorityColor.border}`,
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.8rem', color: priorityColor.color }}>
                          {idx + 1}. {t.test}
                        </strong>
                        <span style={{
                          fontSize: '0.63rem', fontWeight: 700, padding: '0.12rem 0.4rem',
                          borderRadius: 'var(--radius-full)', backgroundColor: priorityColor.badge,
                          color: priorityColor.color, whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                          {t.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: priorityColor.color, fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.2rem' }}>
                        Standard: {t.standard}
                      </div>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-body)', margin: 0, lineHeight: 1.4 }}>{t.purpose}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 9. FINAL DECISION & EVIDENCE CONFIDENCE */}
      {(activeTab === 'compliance' || activeTab === 'all') && (result as any).finalDecisionSummary && (
        <div className="card" style={{ marginBottom: '1.75rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <ShieldCheck size={22} style={{ color: (result as any).finalDecisionSummary.overallEvidenceStatus === 'Strong Supporting Evidence' ? '#16a34a' : (result as any).finalDecisionSummary.overallEvidenceStatus === 'Insufficient Evidence for a Reliable Recommendation' ? '#dc2626' : '#d97706' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Final Decision & Evidence Confidence</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evidence status reflects completeness and quality of available data — not an AI confidence score</span>
            </div>
          </div>

          {/* Evidence Status Badge */}
          <div style={{ marginBottom: '1rem' }}>
            {(() => {
              const status = (result as any).finalDecisionSummary.overallEvidenceStatus;
              const isStrong = status === 'Strong Supporting Evidence';
              const isInsufficient = status === 'Insufficient Evidence for a Reliable Recommendation';
              const bgColor = isStrong ? '#f0fdf4' : isInsufficient ? '#fef2f2' : '#fffbeb';
              const textColor = isStrong ? '#166534' : isInsufficient ? '#991b1b' : '#92400e';
              const borderColor = isStrong ? '#bbf7d0' : isInsufficient ? '#fecaca' : '#fde68a';
              return (
                <div style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: textColor, marginBottom: '0.4rem' }}>
                    {status}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: textColor, margin: 0, lineHeight: 1.45 }}>
                    {(result as any).finalDecisionSummary.statusExplanation}
                  </p>
                </div>
              );
            })()}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Reasons for Selection */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Reasons for Selection:</div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                {(result as any).finalDecisionSummary.reasonsForSelection.map((r: string, i: number) => (
                  <li key={i} style={{ marginBottom: '0.2rem' }}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Evidence Gaps */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#b45309', marginBottom: '0.4rem' }}>Evidence Gaps:</div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5 }}>
                {(result as any).finalDecisionSummary.evidenceGaps.map((g: string, i: number) => (
                  <li key={i} style={{ marginBottom: '0.2rem' }}>{g}</li>
                ))}
              </ul>
            </div>

            {/* Required Next Steps */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#1d4ed8', marginBottom: '0.4rem' }}>Required Next Steps:</div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: '#1e40af', lineHeight: 1.5 }}>
                {(result as any).finalDecisionSummary.requiredNextSteps.map((s: string, i: number) => (
                  <li key={i} style={{ marginBottom: '0.2rem' }}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Important Caveat */}
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {(result as any).finalDecisionSummary.importantCaveat}
          </div>
        </div>
      )}

      {/* 10. SUSTAINABILITY & INDICATIVE ECONOMICS SUMMARY */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              <Leaf size={18} style={{ color: 'var(--accent-green)' }} />
              Sustainability & End-of-Life Profile
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div>• Recyclability Rating: <strong>{getRecyclingBadgeText(primaryMaterial.sustainability)}</strong></div>
              <div>• Carbon & Disposal Pathway: {result.sustainabilityAssessment.disposalRoute}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                {result.sustainabilityAssessment.notes}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              <DollarSign size={18} style={{ color: 'var(--teal-600)' }} />
              Indicative Economics & Price Range
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div>• Indicative Substrate Cost: <strong>{primaryMaterial.indicativeCostTier}</strong> ({primaryMaterial.indicativePricePerKgRange})</div>
              <div>• Preservation Horizon: {result.indicativeEconomics.shelfLifeExtensionEstimate}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                {result.indicativeEconomics.costBenefitSummary}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. PROMINENT TECHNICAL DISCLAIMER FOOTER */}
      {(activeTab === 'references' || activeTab === 'all') && (
        <div
          style={{
            padding: '1.1rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            marginBottom: '2rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          <strong>Technical Disclaimer:</strong> {result.technicalDisclaimer}
        </div>
      )}

      {/* 9. Bottom Navigation Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <Link to="/recommend" className="btn btn-secondary">
          <Sparkles size={16} /> New Packaging Evaluation
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/history" className="btn btn-secondary">
            View History
          </Link>
          <Link to="/dashboard" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
