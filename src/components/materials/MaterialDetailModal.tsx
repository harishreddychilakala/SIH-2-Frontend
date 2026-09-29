import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { PackagingMaterial } from '../../types';
import { Badge } from '../common/Badge';
import { PropertyBar } from './PropertyBar';
import {
  X,
  Scale,
  ShieldCheck,
  Leaf,
  Layers,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface MaterialDetailModalProps {
  material: PackagingMaterial | null;
  onClose: () => void;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  material,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!material) return null;

  const handleCompare = () => {
    onClose();
    navigate(`/compare?mat1=${material.id}`);
  };

  const getOTRScore = (val: number | null) => {
    if (val === null) return 0;
    if (val <= 1) return 98;
    if (val <= 20) return 85;
    if (val <= 400) return 60;
    if (val <= 2000) return 35;
    return 15;
  };

  const getWVTRScore = (val: number | null) => {
    if (val === null) return 0;
    if (val <= 0.1) return 98;
    if (val <= 2) return 85;
    if (val <= 10) return 60;
    if (val <= 30) return 40;
    return 20;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {material.name}
              </h2>
              <Badge variant="teal">{material.category}</Badge>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace' }}>
              Code: {material.code} {material.layerStructure && `| Structure: ${material.layerStructure}`}
            </div>
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
              <strong>Source:</strong> {material.sourceAttribution}. Permeability values are illustrative laboratory reference benchmarks for typical film gauges. Certified test curves (ASTM D3985 / ASTM F1249) are required for specific grade converters.
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
            {material.description}
          </p>

          {/* Barrier Properties Section */}
          <div className="card" style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={16} style={{ color: 'var(--primary)' }} /> Barrier & Permeation Parameters
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div>
                <PropertyBar
                  label="Oxygen Barrier (OTR)"
                  valueText={
                    material.otr.value !== null
                      ? `${material.otr.value} ${material.otr.unit}`
                      : 'Unknown / Not tested'
                  }
                  percentage={getOTRScore(material.otr.value)}
                  helpText={`Classification: ${material.otr.level} (Measured at 23°C, 0% RH)`}
                />
              </div>

              <div>
                <PropertyBar
                  label="Water Vapor Barrier (WVTR)"
                  valueText={
                    material.wvtr.value !== null
                      ? `${material.wvtr.value} ${material.wvtr.unit}`
                      : 'Unknown / Not tested'
                  }
                  percentage={getWVTRScore(material.wvtr.value)}
                  color="var(--teal-600)"
                  helpText={`Classification: ${material.wvtr.level} (Measured at 38°C, 90% RH)`}
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.8125rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Gauge / Thickness</span>
                <strong>{material.thicknessRangeMicrons.min} - {material.thicknessRangeMicrons.max} µm</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block' }}>
                  (Typ: {material.thicknessRangeMicrons.typical} µm)
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Sealability</span>
                <strong>{material.sealability}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Tensile / Puncture</span>
                <strong>{material.mechanicalStrength.tensileRating} / {material.mechanicalStrength.punctureResistance}</strong>
              </div>
            </div>
          </div>

          {/* Sustainability & Commercial */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
            }}
          >
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <Leaf size={16} style={{ color: 'var(--accent-green)' }} />
                Sustainability Profile
              </div>
              <ul style={{ listStyle: 'none', fontSize: '0.8125rem', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>• Classification: <strong>{material.sustainability.type}</strong></li>
                <li>• Recyclability: <strong>{material.sustainability.recyclabilityRating}</strong></li>
                {material.sustainability.recyclingCode && (
                  <li>• Resin ID Code: <strong>{material.sustainability.recyclingCode}</strong></li>
                )}
                <li style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.78rem' }}>
                  {material.sustainability.carbonFootprintNote}
                </li>
              </ul>
            </div>

            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={16} style={{ color: 'var(--teal-600)' }} />
                Commercial & Food Safety
              </div>
              <ul style={{ listStyle: 'none', fontSize: '0.8125rem', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>• Cost Category: <strong>{material.indicativeCostTier}</strong></li>
                <li>• Indicative Price Range: <strong>{material.indicativePricePerKgRange}</strong></li>
                <li>• Food Contact Status: <strong>FDA / FSSAI Compliant polymer resin</strong></li>
              </ul>
            </div>
          </div>

          {/* Applications and Limitations */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--primary)' }} /> Typical Applications
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
              {material.typicalApplications.map((app, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                  }}
                >
                  {app}
                </span>
              ))}
            </div>

            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={15} style={{ color: 'var(--warning-text)' }} /> Key Limitations & Boundary Conditions
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
              {material.keyLimitations.map((lim, idx) => (
                <li key={idx} style={{ marginBottom: '0.2rem' }}>
                  {lim}
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
          <button type="button" className="btn btn-primary btn-sm" onClick={handleCompare}>
            <Scale size={14} />
            <span>Compare with Other Materials</span>
          </button>
        </div>
      </div>
    </div>
  );
};
