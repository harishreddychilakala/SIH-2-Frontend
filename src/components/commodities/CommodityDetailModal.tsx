import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Commodity } from '../../types';
import { Badge } from '../common/Badge';
import {
  X,
  Sparkles,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Info,
} from 'lucide-react';

interface CommodityDetailModalProps {
  commodity: Commodity | null;
  onClose: () => void;
}

export const CommodityDetailModal: React.FC<CommodityDetailModalProps> = ({
  commodity,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!commodity) return null;

  const handleStartRecommendation = () => {
    onClose();
    navigate(`/recommend?commodityId=${commodity.id}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '720px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {commodity.name}
              </h2>
              <Badge variant="teal">{commodity.category}</Badge>
            </div>
            {commodity.scientificName && (
              <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Taxonomic classification: {commodity.scientificName}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="alert-box alert-info" style={{ marginBottom: 0, padding: '0.75rem 1rem' }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8125rem' }}>
              Food properties below represent standard post-harvest literature benchmarks. Target values should be adjusted for specific crop varieties and local ambient harvest parameters.
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
              Physicochemical Properties
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
              }}
            >
              <div className="card" style={{ padding: '0.85rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Droplets size={13} /> Moisture Range
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {commodity.moisturePercent.min}% - {commodity.moisturePercent.max}%
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                  Typical: {commodity.moisturePercent.typical}%
                </span>
              </div>

              <div className="card" style={{ padding: '0.85rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fat / Lipid Content</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {commodity.fatOilPercent.min}% - {commodity.fatOilPercent.max}%
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                  Typical: {commodity.fatOilPercent.typical}%
                </span>
              </div>

              <div className="card" style={{ padding: '0.85rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pH Level</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {commodity.typicalPh.min} - {commodity.typicalPh.max}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                  Typical: {commodity.typicalPh.typical}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
            }}
          >
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <Thermometer size={16} style={{ color: 'var(--primary)' }} />
                Recommended Storage
              </div>
              <ul style={{ listStyle: 'none', fontSize: '0.8125rem', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>• Temperature: <strong>{commodity.recommendedStorage.tempC.min}°C to {commodity.recommendedStorage.tempC.max}°C</strong> (Opt: {commodity.recommendedStorage.tempC.typical}°C)</li>
                <li>• Relative Humidity: <strong>{commodity.recommendedStorage.rhPercent.min}% - {commodity.recommendedStorage.rhPercent.max}%</strong></li>
                <li>• Baseline Shelf Life: <strong>~{commodity.recommendedStorage.typicalShelfLifeDays} days</strong></li>
              </ul>
            </div>

            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <FileText size={16} style={{ color: 'var(--teal-600)' }} />
                Respiration & Sensitivity
              </div>
              <ul style={{ listStyle: 'none', fontSize: '0.8125rem', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>• Respiration Class: <strong>{commodity.respirationRate ? commodity.respirationRate.level : 'Non-respiring'}</strong></li>
                {commodity.respirationRate?.rateAtAmbient && (
                  <li>• Ambient Rate: <strong>{commodity.respirationRate.rateAtAmbient} {commodity.respirationRate.unit}</strong></li>
                )}
                <li>• Ethylene Sensitivity: <strong>{commodity.ethyleneSensitivity || 'Unknown / Not evaluated'}</strong></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={15} style={{ color: 'var(--warning-text)' }} /> Primary Spoilage Risks
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {commodity.primarySpoilageRisks.map((risk, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: 'var(--warning-bg)',
                    color: 'var(--warning-text)',
                    border: '1px solid var(--warning-border)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                  }}
                >
                  {risk}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--primary)' }} /> Key Packaging Design Principles
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
              {commodity.keyPackagingConsiderations.map((note, idx) => (
                <li key={idx} style={{ marginBottom: '0.25rem' }}>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleStartRecommendation}
          >
            <Sparkles size={14} />
            <span>Generate Recommendation for this Food</span>
          </button>
        </div>
      </div>
    </div>
  );
};
