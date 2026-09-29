import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { PackagingMaterial } from '../../types';
import { Badge } from '../common/Badge';
import { X, Sparkles } from 'lucide-react';

interface MaterialComparisonTableProps {
  materials: PackagingMaterial[];
  onRemoveMaterial?: (materialId: string) => void;
}

export const MaterialComparisonTable: React.FC<MaterialComparisonTableProps> = ({
  materials,
  onRemoveMaterial,
}) => {
  const navigate = useNavigate();

  if (materials.length === 0) return null;

  return (
    <div className="table-container" style={{ margin: '1rem 0' }}>
      <table className="custom-table">
        <thead>
          <tr>
            <th style={{ width: '240px', minWidth: '200px' }}>Specification Parameter</th>
            {materials.map((mat) => (
              <th key={mat.id} style={{ minWidth: '240px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', textTransform: 'none', fontWeight: 700 }}>
                      {mat.name}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {mat.code}
                    </span>
                  </div>
                  {onRemoveMaterial && (
                    <button
                      type="button"
                      onClick={() => onRemoveMaterial(mat.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.25rem', color: 'var(--text-subtle)' }}
                      title="Remove from comparison"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '0.6rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', fontSize: '0.72rem', padding: '0.25rem 0.5rem', justifyContent: 'center' }}
                    onClick={() => navigate(`/recommend?materialCode=${mat.code}`)}
                  >
                    <Sparkles size={12} /> Evaluate with this Film
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Material Category</td>
            {materials.map((m) => (
              <td key={m.id}>
                <Badge variant="teal">{m.category}</Badge>
              </td>
            ))}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Layer Structure</td>
            {materials.map((m) => (
              <td key={m.id} style={{ fontSize: '0.8125rem' }}>
                {m.layerStructure || <span style={{ color: 'var(--text-subtle)' }}>Standard monolayer</span>}
              </td>
            ))}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              <div>Oxygen Transmission Rate (OTR)</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>cc/m²·24h·1atm (ASTM D3985 at 23°C, 0% RH)</span>
            </td>
            {materials.map((m) => (
              <td key={m.id}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.95rem' }}>
                  {m.otr.value !== null ? `${m.otr.value} cc` : 'Variable (Perforation-Dependent)'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {m.otr.level}
                </div>
              </td>
            ))}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              <div>Water Vapor Transmission Rate (WVTR)</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>g/m²·24h (ASTM F1249 at 38°C, 90% RH)</span>
            </td>
            {materials.map((m) => (
              <td key={m.id}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.95rem' }}>
                  {m.wvtr.value !== null ? `${m.wvtr.value} g` : 'Variable / Custom'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {m.wvtr.level}
                </div>
              </td>
            ))}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Film Gauge (Thickness)</td>
            {materials.map((m) => (
              <td key={m.id}>
                <strong>{m.thicknessRangeMicrons.typical} µm</strong>{' '}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  (Range: {m.thicknessRangeMicrons.min}–{m.thicknessRangeMicrons.max} µm)
                </span>
              </td>
            ))}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              <div>MAP Compatibility & Gas Retention</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Headspace O₂ / CO₂ Equilibrium</span>
            </td>
            {materials.map((m) => {
              const code = m.code.toUpperCase();
              let mapText = 'Standard Air Packaging';
              let badgeVariant: 'teal' | 'success' | 'warning' | 'neutral' = 'neutral';
              if (code.includes('PERF')) {
                mapText = 'Equilibrium MAP (Respiring produce only; micro-perforated)';
                badgeVariant = 'teal';
              } else if (code.includes('ALU') || code.includes('MET') || code.includes('EVOH') || code.includes('PA')) {
                mapText = 'High Gas Barrier (N₂ flush & Vacuum compatible; OTR < 25 cc)';
                badgeVariant = 'success';
              } else if (code.includes('BIO') || code.includes('PLA')) {
                mapText = 'High Breathability (Fast gas diffusion; non-barrier)';
                badgeVariant = 'warning';
              }
              return (
                <td key={m.id}>
                  <Badge variant={badgeVariant}>{mapText.split('(')[0].trim()}</Badge>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {mapText.includes('(') ? mapText.slice(mapText.indexOf('(')) : ''}
                  </div>
                </td>
              );
            })}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              <div>Shelf-Life Considerations</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Preservation & Degradation Control</span>
            </td>
            {materials.map((m) => {
              const code = m.code.toUpperCase();
              let shelfNote = 'Requires empirical storage challenge testing';
              if (code.includes('PERF')) {
                shelfNote = 'Delays produce senescence & prevents hypoxia (>2% O₂); 0% guarantee without real-time trials';
              } else if (code.includes('ALU') || code.includes('MET')) {
                shelfNote = 'Extended shelf life (> 180 days for dry/fried snacks); light & O₂ lockout';
              } else if (code.includes('EVOH') || code.includes('PA')) {
                shelfNote = 'Extended cold chain shelf life for perishable proteins; requires continuous chilling';
              } else {
                shelfNote = 'Standard ambient turnover; high gas transmission accelerates lipid oxidation in fatty foods';
              }
              return (
                <td key={m.id} style={{ fontSize: '0.78rem', color: 'var(--text-body)', lineHeight: 1.4 }}>
                  {shelfNote}
                </td>
              );
            })}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Heat Sealability</td>
            {materials.map((m) => (
              <td key={m.id}>
                <Badge variant={m.sealability.includes('Hermetic') || m.sealability.includes('Excellent') || m.sealability.includes('High') ? 'success' : 'neutral'}>
                  {m.sealability}
                </Badge>
              </td>
            ))}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Mechanical Strength</td>
            {materials.map((m) => (
              <td key={m.id} style={{ fontSize: '0.8125rem' }}>
                <div>Tensile Modulus: <strong>{m.mechanicalStrength.tensileRating}</strong></div>
                <div>Puncture Resistance: <strong>{m.mechanicalStrength.punctureResistance}</strong></div>
              </td>
            ))}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Recycling Stream & Classification</td>
            {materials.map((m) => (
              <td key={m.id} style={{ fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {m.sustainability.recyclingCode || m.sustainability.type}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  {m.sustainability.recyclabilityRating}
                </div>
              </td>
            ))}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Indicative Price Tier</td>
            {materials.map((m) => (
              <td key={m.id}>
                <Badge variant={m.indicativeCostTier.includes('Low') ? 'success' : m.indicativeCostTier.includes('Moderate') ? 'teal' : 'warning'}>
                  {m.indicativeCostTier}
                </Badge>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>
                  {m.indicativePricePerKgRange}
                </div>
              </td>
            ))}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Typical Applications</td>
            {materials.map((m) => (
              <td key={m.id}>
                <ul style={{ paddingLeft: '1rem', fontSize: '0.78rem', color: 'var(--text-body)', lineHeight: 1.45, margin: 0 }}>
                  {m.typicalApplications.map((app, idx) => (
                    <li key={idx} style={{ marginBottom: '0.2rem' }}>{app}</li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>

          <tr>
            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Key Engineering Limitations</td>
            {materials.map((m) => (
              <td key={m.id}>
                <ul style={{ paddingLeft: '1rem', fontSize: '0.78rem', color: '#b45309', lineHeight: 1.45, margin: 0 }}>
                  {m.keyLimitations.map((lim, idx) => (
                    <li key={idx} style={{ marginBottom: '0.2rem' }}>{lim}</li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
