import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Commodity } from '../../types';
import { Badge } from '../common/Badge';
import { Eye, Sparkles, Thermometer, Droplets, Activity, BookmarkPlus } from 'lucide-react';

interface CommodityCardProps {
  commodity: Commodity;
  onViewDetails: (commodity: Commodity) => void;
  onSaveAiCommodity?: (commodity: Commodity) => void;
}

export const CommodityCard: React.FC<CommodityCardProps> = ({ commodity, onViewDetails, onSaveAiCommodity }) => {
  const navigate = useNavigate();
  const isAiResearched = commodity.id.startsWith('ai-comm-');

  const handleRecommendShortcut = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/recommend?commodityId=${commodity.id}`);
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)',
        border: isAiResearched ? '1.5px solid #86efac' : '1px solid var(--border)',
        backgroundColor: isAiResearched ? '#f0fdf4' : 'var(--bg-card)',
      }}
      onClick={() => onViewDetails(commodity)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {commodity.name}
              </h3>
              {isAiResearched && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                  title="Researched and synthesized by Gemini & Groq dual-AI post-harvest engine"
                >
                  <Sparkles size={11} /> AI Researched
                </span>
              )}
            </div>
            {commodity.scientificName && (
              <span style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                {commodity.scientificName}
              </span>
            )}
          </div>
          <Badge variant="teal">{commodity.category}</Badge>
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
          {commodity.description}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.6rem',
            backgroundColor: isAiResearched ? '#e6f7ec' : 'var(--bg-subtle)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Droplets size={14} style={{ color: 'var(--primary)' }} />
            <span>Moisture: <strong>{commodity.moisturePercent.typical}%</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Thermometer size={14} style={{ color: 'var(--primary)' }} />
            <span>Optimal: <strong>{commodity.recommendedStorage.tempC.typical}°C</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Activity size={14} style={{ color: 'var(--teal-600)' }} />
            <span>pH: <strong>{commodity.typicalPh.typical}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Resp: <strong>{commodity.respirationRate ? commodity.respirationRate.level : 'None'}</strong></span>
          </div>
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
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, minWidth: '95px' }}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(commodity);
          }}
        >
          <Eye size={14} />
          <span>Technical Specs</span>
        </button>

        {isAiResearched && onSaveAiCommodity ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{
              flex: 1,
              minWidth: '95px',
              backgroundColor: '#dcfce7',
              borderColor: '#86efac',
              color: '#166534',
              fontWeight: 600,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSaveAiCommodity(commodity);
            }}
            title="Permanently save this AI-researched commodity to the database catalog"
          >
            <BookmarkPlus size={14} />
            <span>Save to Catalog</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ flex: 1, minWidth: '95px' }}
            onClick={handleRecommendShortcut}
          >
            <Sparkles size={14} />
            <span>Recommend</span>
          </button>
        )}
      </div>
    </div>
  );
};

