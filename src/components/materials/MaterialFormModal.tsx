import React, { useState, useEffect } from 'react';
import type { PackagingMaterial, MaterialCategory } from '../../types';
import { X, Save, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { materialService } from '../../services/materialService';

interface MaterialFormModalProps {
  isOpen: boolean;
  materialToEdit?: PackagingMaterial | null;
  onClose: () => void;
  onSave: (savedMaterial: PackagingMaterial) => void;
}

export const MaterialFormModal: React.FC<MaterialFormModalProps> = ({
  isOpen,
  materialToEdit,
  onClose,
  onSave,
}) => {
  const isEditing = !!materialToEdit;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [layerStructure, setLayerStructure] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('Barrier Films');
  const [description, setDescription] = useState('');

  // Barrier OTR & WVTR
  const [otrValue, setOtrValue] = useState<number | ''>(5.0);
  const [otrLevel, setOtrLevel] = useState<any>('High Barrier');
  const [wvtrValue, setWvtrValue] = useState<number | ''>(4.5);
  const [wvtrLevel, setWvtrLevel] = useState<any>('Moderate Barrier');

  // Thickness
  const [thicknessTypical, setThicknessTypical] = useState(65);
  const [thicknessMin, setThicknessMin] = useState(50);
  const [thicknessMax, setThicknessMax] = useState(90);

  // Mechanical & Seal
  const [sealability, setSealability] = useState<any>('Hermetic Heat-Seal');
  const [tensileRating, setTensileRating] = useState<any>('High');
  const [punctureResistance, setPunctureResistance] = useState<any>('High');

  // Sustainability & Economics
  const [sustainabilityType, setSustainabilityType] = useState<any>('Recyclable Mono-material');
  const [recyclingCode, setRecyclingCode] = useState('RIC 4 (LDPE)');
  const [recyclabilityRating, setRecyclabilityRating] = useState<any>('Readily Recyclable (RIC 2/4/5)');
  const [indicativeCostTier, setIndicativeCostTier] = useState<any>('Moderate ($$)');
  const [indicativePriceRange, setIndicativePriceRange] = useState('$3.50 - $5.50 / kg');

  // Applications & Limitations
  const [applications, setApplications] = useState('Vacuum food pouch, Modified atmosphere tray, Meat & seafood liner');
  const [limitations, setLimitations] = useState('Requires specialized converter for hermetic gas flush');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiResearching, setIsAiResearching] = useState(false);

  const handleAiAutoFill = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a Material Name first (e.g. "Polyhydroxyalkanoate", "PVDC-BOPP", "SiOx-PET").');
      return;
    }
    setErrorMsg('');
    setIsAiResearching(true);
    try {
      const researched = await materialService.researchMaterialWithAI(name.trim(), category);
      if (researched) {
        if (researched.code) setCode(researched.code);
        if (researched.layerStructure) setLayerStructure(researched.layerStructure);
        if (researched.category) setCategory(researched.category as any);
        if (researched.description) setDescription(researched.description);
        if (researched.otr?.value !== undefined && researched.otr?.value !== null) {
          setOtrValue(researched.otr.value);
          setOtrLevel(researched.otr.level || 'High Barrier');
        }
        if (researched.wvtr?.value !== undefined && researched.wvtr?.value !== null) {
          setWvtrValue(researched.wvtr.value);
          setWvtrLevel(researched.wvtr.level || 'Moderate Barrier');
        }
        if (researched.thicknessRangeMicrons) {
          setThicknessTypical(researched.thicknessRangeMicrons.typical || 50);
          setThicknessMin(researched.thicknessRangeMicrons.min || 25);
          setThicknessMax(researched.thicknessRangeMicrons.max || 85);
        }
        if (researched.sealability) setSealability(researched.sealability);
        if (researched.mechanicalStrength) {
          setTensileRating(researched.mechanicalStrength.tensileRating || 'High');
          setPunctureResistance(researched.mechanicalStrength.punctureResistance || 'High');
        }
        if (researched.sustainability) {
          setSustainabilityType(researched.sustainability.type || 'Recyclable Mono-material');
          setRecyclingCode(researched.sustainability.recyclingCode || 'RIC 7');
          setRecyclabilityRating(researched.sustainability.recyclabilityRating || 'Recyclable in Specialist Streams');
        }
        if (researched.indicativeCostTier) setIndicativeCostTier(researched.indicativeCostTier);
        if (researched.indicativePricePerKgRange) setIndicativePriceRange(researched.indicativePricePerKgRange);
        if (researched.typicalApplications && researched.typicalApplications.length > 0) {
          setApplications(researched.typicalApplications.join(', '));
        }
        if (researched.keyLimitations && researched.keyLimitations.length > 0) {
          setLimitations(researched.keyLimitations.join(', '));
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'AI material research failed. You can still fill properties manually.');
    } finally {
      setIsAiResearching(false);
    }
  };

  useEffect(() => {
    if (materialToEdit) {
      setName(materialToEdit.name);
      setCode(materialToEdit.code);
      setLayerStructure(materialToEdit.layerStructure || '');
      setCategory(materialToEdit.category);
      setDescription(materialToEdit.description);

      setOtrValue(materialToEdit.otr.value !== null ? materialToEdit.otr.value : '');
      setOtrLevel(materialToEdit.otr.level);
      setWvtrValue(materialToEdit.wvtr.value !== null ? materialToEdit.wvtr.value : '');
      setWvtrLevel(materialToEdit.wvtr.level);

      setThicknessTypical(materialToEdit.thicknessRangeMicrons.typical);
      setThicknessMin(materialToEdit.thicknessRangeMicrons.min);
      setThicknessMax(materialToEdit.thicknessRangeMicrons.max);

      setSealability(materialToEdit.sealability);
      setTensileRating(materialToEdit.mechanicalStrength.tensileRating);
      setPunctureResistance(materialToEdit.mechanicalStrength.punctureResistance);

      setSustainabilityType(materialToEdit.sustainability.type);
      setRecyclingCode(materialToEdit.sustainability.recyclingCode || '');
      setRecyclabilityRating(materialToEdit.sustainability.recyclabilityRating);
      setIndicativeCostTier(materialToEdit.indicativeCostTier);
      setIndicativePriceRange(materialToEdit.indicativePricePerKgRange);

      setApplications(materialToEdit.typicalApplications.join(', '));
      setLimitations(materialToEdit.keyLimitations.join(', '));
    } else {
      setName('');
      setCode('');
      setLayerStructure('');
      setCategory('Barrier Films');
      setDescription('');
      setOtrValue(5.0);
      setOtrLevel('High Barrier');
      setWvtrValue(4.5);
      setWvtrLevel('Moderate Barrier');
      setThicknessTypical(65);
      setThicknessMin(50);
      setThicknessMax(90);
      setSealability('Hermetic Heat-Seal');
      setTensileRating('High');
      setPunctureResistance('High');
      setSustainabilityType('Recyclable Mono-material');
      setRecyclingCode('RIC 4 (LDPE)');
      setRecyclabilityRating('Readily Recyclable (RIC 2/4/5)');
      setIndicativeCostTier('Moderate ($$)');
      setIndicativePriceRange('$3.50 - $5.50 / kg');
      setApplications('Vacuum food pouch, Modified atmosphere tray, Meat & seafood liner');
      setLimitations('Requires specialized converter for hermetic gas flush');
    }
    setErrorMsg('');
  }, [materialToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setErrorMsg('Material name and unique resin code are required.');
      return;
    }

    if (thicknessMin > thicknessMax || thicknessTypical < thicknessMin || thicknessTypical > thicknessMax) {
      setErrorMsg('Invalid thickness range. Ensure Min <= Typical <= Max.');
      return;
    }

    const appsArray = applications.split(',').map((s) => s.trim()).filter(Boolean);
    const limsArray = limitations.split(',').map((s) => s.trim()).filter(Boolean);

    const payload: any = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      layerStructure: layerStructure.trim() || undefined,
      category,
      description: description.trim() || `${name} packaging substrate evaluated for food barrier defense.`,
      otr: {
        value: otrValue !== '' ? Number(otrValue) : null,
        unit: 'cc/m²·24h·atm',
        level: otrLevel,
        isIllustrative: true,
      },
      wvtr: {
        value: wvtrValue !== '' ? Number(wvtrValue) : null,
        unit: 'g/m²·24h',
        level: wvtrLevel,
        isIllustrative: true,
      },
      thicknessRangeMicrons: {
        min: Number(thicknessMin),
        max: Number(thicknessMax),
        typical: Number(thicknessTypical),
      },
      sealability,
      mechanicalStrength: {
        tensileRating,
        punctureResistance,
      },
      sustainability: {
        type: sustainabilityType,
        recyclingCode: recyclingCode.trim() || undefined,
        recyclabilityRating,
        carbonFootprintNote: `Evaluated under standard ${sustainabilityType} life-cycle stream.`,
      },
      indicativeCostTier,
      indicativePricePerKgRange: indicativePriceRange.trim() || '$3.50 - $5.50 / kg',
      typicalApplications: appsArray.length > 0 ? appsArray : ['Flexible food pouch'],
      idealCommodityCategories: ['Fresh Produce', 'Meat & Marine', 'Dairy & Processed'],
      keyLimitations: limsArray.length > 0 ? limsArray : ['Application dependent'],
      isVerified: false,
      sourceAttribution: 'PackSmart Custom Engineering Library',
    };

    setIsSubmitting(true);
    try {
      let saved: PackagingMaterial;
      if (isEditing && materialToEdit) {
        const { materialService } = await import('../../services/materialService');
        saved = await materialService.update(materialToEdit.id, payload);
      } else {
        const { materialService } = await import('../../services/materialService');
        saved = await materialService.create(payload);
      }
      onSave(saved);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save packaging material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {isEditing ? `Edit Material: ${materialToEdit.name}` : 'Add Custom Packaging Substrate'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Configure barrier permeabilities (ASTM D3985 / ASTM F1249), mechanical strength, and circularity.
            </span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0.35rem' }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="alert-box alert-danger" style={{ marginBottom: '1rem', fontSize: '0.825rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Material Name *</label>
                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={isAiResearching || !name.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary-border)',
                    cursor: isAiResearching || !name.trim() ? 'not-allowed' : 'pointer',
                    opacity: isAiResearching || !name.trim() ? 0.6 : 1,
                    transition: 'all var(--transition-fast)',
                  }}
                  title="Auto-populate barrier specs and standard metrics using Gemini & Groq AI"
                >
                  {isAiResearching ? <Loader2 size={12} className="spin-animation" /> : <Sparkles size={12} />}
                  <span>{isAiResearching ? 'Researching...' : 'Auto-Fill with AI'}</span>
                </button>
              </div>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Polyhydroxyalkanoate (PHA) or PVDC-Coated BOPP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Resin / Substrate Code *</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. PET-PVDC-PE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Substrate Category *</label>
              <select
                className="select-control"
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
              >
                <option value="Barrier Films">Barrier Films</option>
                <option value="Polyolefins">Polyolefins</option>
                <option value="Foil & Metalized Laminates">Foil & Metalized Laminates</option>
                <option value="Bio-based & Compostable">Bio-based & Compostable</option>
                <option value="Speciality MAP Films">Speciality MAP Films</option>
                <option value="Paper & Fibre Composites">Paper & Fibre Composites</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Layer Structure</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. PET 12µm / PVDC 3µm / LLDPE 50µm"
                value={layerStructure}
                onChange={(e) => setLayerStructure(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input-control"
              rows={2}
              placeholder="Technical polymer description and functional attributes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Barrier Properties Box */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: '0.825rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
              Barrier Permeation Specifications (ASTM Benchmarks)
            </strong>
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Oxygen Transmission Rate (OTR cc/m²·24h·atm)</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input
                    type="number"
                    step="0.01"
                    className="input-control"
                    placeholder="e.g. 2.5"
                    value={otrValue}
                    onChange={(e) => setOtrValue(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <select
                    className="select-control"
                    value={otrLevel}
                    onChange={(e) => setOtrLevel(e.target.value)}
                  >
                    <option value="Ultra-High Barrier">Ultra-High</option>
                    <option value="High Barrier">High Barrier</option>
                    <option value="Moderate Barrier">Moderate</option>
                    <option value="Very Low Barrier">Low Barrier</option>
                    <option value="High Breathability">Breathable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Water Vapor Transmission (WVTR g/m²·24h)</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input
                    type="number"
                    step="0.01"
                    className="input-control"
                    placeholder="e.g. 1.2"
                    value={wvtrValue}
                    onChange={(e) => setWvtrValue(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <select
                    className="select-control"
                    value={wvtrLevel}
                    onChange={(e) => setWvtrLevel(e.target.value)}
                  >
                    <option value="Ultra-High Barrier">Ultra-High</option>
                    <option value="High Barrier">High Barrier</option>
                    <option value="Moderate Barrier">Moderate</option>
                    <option value="Poor">Low Barrier</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Thickness & Mechanical */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: '0.825rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
              Thickness & Mechanical Durability
            </strong>
            <div className="grid-3" style={{ gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Thickness Typical / Min / Max (µm)</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input type="number" className="input-control" value={thicknessTypical} onChange={(e) => setThicknessTypical(Number(e.target.value))} title="Typical µm" />
                  <input type="number" className="input-control" value={thicknessMin} onChange={(e) => setThicknessMin(Number(e.target.value))} title="Min µm" />
                  <input type="number" className="input-control" value={thicknessMax} onChange={(e) => setThicknessMax(Number(e.target.value))} title="Max µm" />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Heat Sealability</label>
                <select className="select-control" value={sealability} onChange={(e) => setSealability(e.target.value)}>
                  <option value="Hermetic Heat-Seal">Hermetic Heat-Seal</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Moderate">Moderate</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Puncture / Tensile Modulus</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <select className="select-control" value={punctureResistance} onChange={(e) => setPunctureResistance(e.target.value)}>
                    <option value="Superior">Superior</option>
                    <option value="High">High</option>
                    <option value="Good">Good</option>
                    <option value="Moderate">Moderate</option>
                  </select>
                  <select className="select-control" value={tensileRating} onChange={(e) => setTensileRating(e.target.value)}>
                    <option value="Very High">Very High</option>
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sustainability & Pricing */}
          <div className="grid-3" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Sustainability Type</label>
              <select className="select-control" value={sustainabilityType} onChange={(e) => setSustainabilityType(e.target.value)}>
                <option value="Recyclable Mono-material">Recyclable Mono-material</option>
                <option value="Conventional Plastic">Conventional Plastic</option>
                <option value="Bio-based Compostable">Bio-based Compostable</option>
                <option value="Fibre Hybrid">Fibre Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Recycling Designation (RIC)</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. RIC 4 (LDPE), RIC 7"
                value={recyclingCode}
                onChange={(e) => setRecyclingCode(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Indicative Price Range</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. $4.00 - $6.50 / kg"
                value={indicativePriceRange}
                onChange={(e) => setIndicativePriceRange(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Typical Food Packaging Applications (comma separated)</label>
            <input
              type="text"
              className="input-control"
              value={applications}
              onChange={(e) => setApplications(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Engineering Limitations</label>
            <input
              type="text"
              className="input-control"
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? 'Saving...' : isEditing ? 'Update Material' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
