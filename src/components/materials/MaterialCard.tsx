import React from 'react';
import type { PackagingMaterial } from '../../types';
import { Badge } from '../common/Badge';
import { Eye, Scale, Sparkles, BookmarkPlus } from 'lucide-react';

interface MaterialCardProps {
  material: PackagingMaterial;
  onViewDetails: (material: PackagingMaterial) => void;
  onCompareToggle?: (material: PackagingMaterial) => void;
  isSelectedForCompare?: boolean;
  onSaveToDb?: (material: PackagingMaterial) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onViewDetails,
  onCompareToggle,
  isSelectedForCompare = false,
  onSaveToDb,
}) => {
  const isAiGenerated = material.id.startsWith('ai-mat-') || material.sourceAttribution?.includes('AI') || material.sourceAttribution?.includes('Gemini') || material.sourceAttribution?.includes('Groq');
  const getCostBadgeVariant = (tier: string) => {
    if (tier.includes('Low') || tier.includes('Economy')) return 'success';
    if (tier.includes('Moderate')) return 'teal';
    return 'warning';
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        border: isSelectedForCompare
          ? '2px solid var(--primary)'
          : isAiGenerated
          ? '1.5px solid #86efac'
          : '1px solid var(--border)',
        backgroundColor: isSelectedForCompare
          ? 'var(--primary-light)'
          : isAiGenerated
          ? '#fafffb'
          : 'var(--bg-surface)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)',
      }}
      onClick={() => onViewDetails(material)}
      onMouseEnter={(e) => {
        if (!isSelectedForCompare) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelectedForCompare) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {material.name}
              </h3>
              {isAiGenerated && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid #bbf7d0',
                  }}
                  title="Synthesized and validated via Gemini 1.5 Flash & Groq Llama 3.3 70B"
                >
                  <Sparkles size={11} /> AI Researched
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary)', fontWeight: 600 }}>
              {material.code}
            </span>
          </div>
          <Badge variant="teal">{material.category}</Badge>
        </div>

        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {material.description}
        </p>

        {/* Barrier & Specs Quick Pill Table */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem',
            backgroundColor: isSelectedForCompare ? 'rgba(255,255,255,0.7)' : 'var(--bg-subtle)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>OTR Barrier</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{material.otr.level}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>WVTR Barrier</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{material.wvtr.level}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Thickness</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {material.thicknessRangeMicrons.typical} µm
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Tensile Strength</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {material.mechanicalStrength.tensileRating}
            </span>
          </div>
        </div>

        {/* Sustainability & Cost Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <Badge variant={getCostBadgeVariant(material.indicativeCostTier)}>
            Cost: {material.indicativeCostTier}
          </Badge>
          <Badge variant="neutral">
            {material.sustainability.recyclingCode || material.sustainability.type}
          </Badge>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          gap: '0.5rem',
        }}
      >
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ flex: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(material);
          }}
        >
          <Eye size={14} />
          <span>Full Specs</span>
        </button>

        {onCompareToggle && (
          <button
            type="button"
            className={`btn btn-sm ${isSelectedForCompare ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onCompareToggle(material);
            }}
          >
            <Scale size={14} />
            <span>{isSelectedForCompare ? 'Selected' : 'Compare'}</span>
          </button>
        )}

        {isAiGenerated && onSaveToDb && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            onClick={(e) => {
              e.stopPropagation();
              onSaveToDb(material);
            }}
            title="Save this AI-researched material permanently to database"
          >
            <BookmarkPlus size={14} />
            <span>Save</span>
          </button>
        )}
      </div>
    </div>
  );
};
