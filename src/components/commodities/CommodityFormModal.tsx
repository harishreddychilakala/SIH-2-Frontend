import React, { useState, useEffect } from 'react';
import type { Commodity, CommodityCategory } from '../../types';
import { X, Save, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { commodityService } from '../../services/commodityService';

interface CommodityFormModalProps {
  isOpen: boolean;
  commodityToEdit?: Commodity | null;
  onClose: () => void;
  onSave: (savedCommodity: Commodity) => void;
}

export const CommodityFormModal: React.FC<CommodityFormModalProps> = ({
  isOpen,
  commodityToEdit,
  onClose,
  onSave,
}) => {
  const isEditing = !!commodityToEdit;

  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState<CommodityCategory>('Fresh Produce');
  const [description, setDescription] = useState('');
  const [isAiResearching, setIsAiResearching] = useState(false);

  // Moisture %
  const [moistureTypical, setMoistureTypical] = useState(85);
  const [moistureMin, setMoistureMin] = useState(80);
  const [moistureMax, setMoistureMax] = useState(90);

  // Fat %
  const [fatTypical, setFatTypical] = useState(0.5);
  const [fatMin, setFatMin] = useState(0.1);
  const [fatMax, setFatMax] = useState(1.0);

  // pH
  const [phTypical, setPhTypical] = useState(6.0);
  const [phMin, setPhMin] = useState(5.5);
  const [phMax, setPhMax] = useState(6.5);

  // Respiration (Produce only)
  const [respirationRate, setRespirationRate] = useState<number | undefined>(15);
  const [respirationLevel, setRespirationLevel] = useState<any>('Moderate');

  // Storage
  const [tempTypical, setTempTypical] = useState(4);
  const [tempMin, setTempMin] = useState(2);
  const [tempMax, setTempMax] = useState(8);
  const [rhTypical, setRhTypical] = useState(85);
  const [rhMin, setRhMin] = useState(80);
  const [rhMax, setRhMax] = useState(90);
  const [shelfLifeDays, setShelfLifeDays] = useState(14);

  // Lists
  const [spoilageRisks, setSpoilageRisks] = useState('Bacterial decay, Moisture loss, Mold');
  const [packagingConsiderations, setPackagingConsiderations] = useState('Anti-fog barrier, Controlled gas exchange, Refrigeration compliance');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAiAutoFill = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a Food Commodity Name first to auto-fill with AI.');
      return;
    }
    setErrorMsg('');
    setIsAiResearching(true);
    try {
      const researched = await commodityService.researchCommodityWithAI(name.trim(), category);
      if (researched) {
        if (researched.name) setName(researched.name);
        if (researched.scientificName) setScientificName(researched.scientificName);
        if (researched.category) setCategory(researched.category as CommodityCategory);
        if (researched.description) setDescription(researched.description);
        if (researched.moisturePercent) {
          setMoistureTypical(researched.moisturePercent.typical ?? 85);
          setMoistureMin(researched.moisturePercent.min ?? 80);
          setMoistureMax(researched.moisturePercent.max ?? 90);
        }
        if (researched.fatOilPercent) {
          setFatTypical(researched.fatOilPercent.typical ?? 0.5);
          setFatMin(researched.fatOilPercent.min ?? 0.1);
          setFatMax(researched.fatOilPercent.max ?? 1.0);
        }
        if (researched.typicalPh) {
          setPhTypical(researched.typicalPh.typical ?? 6.0);
          setPhMin(researched.typicalPh.min ?? 5.5);
          setPhMax(researched.typicalPh.max ?? 6.5);
        }
        if (researched.respirationRate) {
          setRespirationRate(researched.respirationRate.rateAtAmbient ?? 15);
          setRespirationLevel(researched.respirationRate.level || 'Moderate');
        } else {
          setRespirationRate(undefined);
          setRespirationLevel('Non-respiring');
        }
        if (researched.recommendedStorage) {
          setTempTypical(researched.recommendedStorage.tempC?.typical ?? 4);
          setTempMin(researched.recommendedStorage.tempC?.min ?? 2);
          setTempMax(researched.recommendedStorage.tempC?.max ?? 8);
          setRhTypical(researched.recommendedStorage.rhPercent?.typical ?? 85);
          setRhMin(researched.recommendedStorage.rhPercent?.min ?? 80);
          setRhMax(researched.recommendedStorage.rhPercent?.max ?? 90);
          setShelfLifeDays(researched.recommendedStorage.typicalShelfLifeDays ?? 14);
        }
        if (researched.primarySpoilageRisks?.length) {
          setSpoilageRisks(researched.primarySpoilageRisks.join(', '));
        }
        if (researched.keyPackagingConsiderations?.length) {
          setPackagingConsiderations(researched.keyPackagingConsiderations.join(', '));
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'AI food science research failed. You can still fill properties manually.');
    } finally {
      setIsAiResearching(false);
    }
  };

  useEffect(() => {
    if (commodityToEdit) {
      setName(commodityToEdit.name);
      setScientificName(commodityToEdit.scientificName || '');
      setCategory(commodityToEdit.category);
      setDescription(commodityToEdit.description);

      setMoistureTypical(commodityToEdit.moisturePercent.typical);
      setMoistureMin(commodityToEdit.moisturePercent.min);
      setMoistureMax(commodityToEdit.moisturePercent.max);

      setFatTypical(commodityToEdit.fatOilPercent.typical);
      setFatMin(commodityToEdit.fatOilPercent.min);
      setFatMax(commodityToEdit.fatOilPercent.max);

      setPhTypical(commodityToEdit.typicalPh.typical);
      setPhMin(commodityToEdit.typicalPh.min);
      setPhMax(commodityToEdit.typicalPh.max);

      if (commodityToEdit.respirationRate) {
        setRespirationRate(commodityToEdit.respirationRate.rateAtAmbient || 15);
        setRespirationLevel(commodityToEdit.respirationRate.level);
      } else {
        setRespirationRate(undefined);
        setRespirationLevel('Non-respiring');
      }

      setTempTypical(commodityToEdit.recommendedStorage.tempC.typical);
      setTempMin(commodityToEdit.recommendedStorage.tempC.min);
      setTempMax(commodityToEdit.recommendedStorage.tempC.max);
      setRhTypical(commodityToEdit.recommendedStorage.rhPercent.typical);
      setRhMin(commodityToEdit.recommendedStorage.rhPercent.min);
      setRhMax(commodityToEdit.recommendedStorage.rhPercent.max);
      setShelfLifeDays(commodityToEdit.recommendedStorage.typicalShelfLifeDays);

      setSpoilageRisks(commodityToEdit.primarySpoilageRisks.join(', '));
      setPackagingConsiderations(commodityToEdit.keyPackagingConsiderations.join(', '));
    } else {
      // Reset defaults
      setName('');
      setScientificName('');
      setCategory('Fresh Produce');
      setDescription('');
      setMoistureTypical(85);
      setMoistureMin(80);
      setMoistureMax(90);
      setFatTypical(0.5);
      setFatMin(0.1);
      setFatMax(1.0);
      setPhTypical(6.0);
      setPhMin(5.5);
      setPhMax(6.5);
      setRespirationRate(15);
      setRespirationLevel('Moderate');
      setTempTypical(4);
      setTempMin(2);
      setTempMax(8);
      setRhTypical(85);
      setRhMin(80);
      setRhMax(90);
      setShelfLifeDays(14);
      setSpoilageRisks('Bacterial decay, Moisture loss, Mold');
      setPackagingConsiderations('Anti-fog barrier, Controlled gas exchange, Refrigeration compliance');
    }
    setErrorMsg('');
  }, [commodityToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Commodity name is required.');
      return;
    }

    if (moistureMin > moistureMax || moistureTypical < moistureMin || moistureTypical > moistureMax) {
      setErrorMsg('Invalid moisture range. Ensure Min <= Typical <= Max.');
      return;
    }

    if (phMin > phMax || phTypical < phMin || phTypical > phMax) {
      setErrorMsg('Invalid pH range. Ensure Min <= Typical <= Max.');
      return;
    }

    const risksArray = spoilageRisks.split(',').map((s) => s.trim()).filter(Boolean);
    const considerationsArray = packagingConsiderations.split(',').map((s) => s.trim()).filter(Boolean);

    const payload: any = {
      name: name.trim(),
      scientificName: scientificName.trim() || undefined,
      category,
      description: description.trim() || `${name} food matrix evaluated for barrier packaging.`,
      moisturePercent: { min: Number(moistureMin), max: Number(moistureMax), typical: Number(moistureTypical) },
      fatOilPercent: { min: Number(fatMin), max: Number(fatMax), typical: Number(fatTypical) },
      typicalPh: { min: Number(phMin), max: Number(phMax), typical: Number(phTypical) },
      respirationRate: category === 'Fresh Produce' && respirationRate !== undefined
        ? {
            rateAtAmbient: Number(respirationRate),
            unit: 'mg CO₂/kg·h',
            level: respirationLevel || 'Moderate',
          }
        : undefined,
      ethyleneSensitivity: category === 'Fresh Produce' ? 'Moderate' : 'Not Applicable',
      recommendedStorage: {
        tempC: { min: Number(tempMin), max: Number(tempMax), typical: Number(tempTypical) },
        rhPercent: { min: Number(rhMin), max: Number(rhMax), typical: Number(rhTypical) },
        typicalShelfLifeDays: Number(shelfLifeDays),
      },
      primarySpoilageRisks: risksArray.length > 0 ? risksArray : ['Microbial decay'],
      keyPackagingConsiderations: considerationsArray.length > 0 ? considerationsArray : ['Barrier protection'],
      isVerified: false,
    };

    setIsSubmitting(true);
    try {
      let saved: Commodity;
      if (isEditing && commodityToEdit) {
        const { commodityService } = await import('../../services/commodityService');
        saved = await commodityService.update(commodityToEdit.id, payload);
      } else {
        const { commodityService } = await import('../../services/commodityService');
        saved = await commodityService.create(payload);
      }
      onSave(saved);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save commodity record.');
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
          maxWidth: '720px',
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
              {isEditing ? `Edit Commodity: ${commodityToEdit.name}` : 'Add Custom Food Commodity'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Enter physicochemical properties to benchmark for barrier packaging recommendations.
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Commodity Name *</label>
                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={isAiResearching || !name.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#16a34a',
                    backgroundColor: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: '4px',
                    padding: '0.15rem 0.5rem',
                    cursor: isAiResearching || !name.trim() ? 'not-allowed' : 'pointer',
                    opacity: isAiResearching || !name.trim() ? 0.6 : 1,
                  }}
                  title="Auto-fill physicochemical attributes, shelf-life, and storage guidelines using Gemini & Groq AI"
                >
                  {isAiResearching ? <Loader2 size={12} className="spin-animation" /> : <Sparkles size={12} />}
                  <span>{isAiResearching ? 'Synthesizing...' : '✨ Auto-Fill with AI'}</span>
                </button>
              </div>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Alphonso Mango, French Green Beans, Paneer Cubes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Food Category *</label>
              <select
                className="select-control"
                value={category}
                onChange={(e) => setCategory(e.target.value as CommodityCategory)}
              >
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Dairy & Processed">Dairy & Processed</option>
                <option value="Meat & Marine">Meat & Marine</option>
                <option value="Fat-Rich & Oils">Fat-Rich Foods & Snacks</option>
                <option value="Dry Grains & Pulses">Dry Grains & Pulses</option>
                <option value="Bakery & Confectionery">Bakery & Confectionery</option>
                <option value="Noodles & Pasta">Noodles & Pasta</option>
              </select>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Latin / Scientific Name</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Mangifera indica"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Shelf Life (Days)</label>
              <input
                type="number"
                min="1"
                max="730"
                className="input-control"
                value={shelfLifeDays}
                onChange={(e) => setShelfLifeDays(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input-control"
              rows={2}
              placeholder="Physicochemical description and sensitivity context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Moisture, Fat, pH Grid */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: '0.825rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
              Physicochemical Composition (% & pH)
            </strong>
            <div className="grid-3" style={{ gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Moisture Typical / Min / Max (%)</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input type="number" step="0.1" className="input-control" value={moistureTypical} onChange={(e) => setMoistureTypical(Number(e.target.value))} title="Typical %" />
                  <input type="number" step="0.1" className="input-control" value={moistureMin} onChange={(e) => setMoistureMin(Number(e.target.value))} title="Min %" />
                  <input type="number" step="0.1" className="input-control" value={moistureMax} onChange={(e) => setMoistureMax(Number(e.target.value))} title="Max %" />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Fat / Lipids Typical / Min / Max (%)</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input type="number" step="0.1" className="input-control" value={fatTypical} onChange={(e) => setFatTypical(Number(e.target.value))} title="Typical %" />
                  <input type="number" step="0.1" className="input-control" value={fatMin} onChange={(e) => setFatMin(Number(e.target.value))} title="Min %" />
                  <input type="number" step="0.1" className="input-control" value={fatMax} onChange={(e) => setFatMax(Number(e.target.value))} title="Max %" />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Acidity pH Typical / Min / Max</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input type="number" step="0.1" className="input-control" value={phTypical} onChange={(e) => setPhTypical(Number(e.target.value))} title="Typical pH" />
                  <input type="number" step="0.1" className="input-control" value={phMin} onChange={(e) => setPhMin(Number(e.target.value))} title="Min pH" />
                  <input type="number" step="0.1" className="input-control" value={phMax} onChange={(e) => setPhMax(Number(e.target.value))} title="Max pH" />
                </div>
              </div>
            </div>
          </div>

          {/* Respiration & Storage */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: '0.825rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
              Storage & Respiration Parameters
            </strong>
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Optimal Storage Temp Typical / Range (°C)</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input type="number" step="0.5" className="input-control" value={tempTypical} onChange={(e) => setTempTypical(Number(e.target.value))} />
                  <input type="number" step="0.5" className="input-control" value={tempMin} onChange={(e) => setTempMin(Number(e.target.value))} />
                  <input type="number" step="0.5" className="input-control" value={tempMax} onChange={(e) => setTempMax(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Relative Humidity Typical / Range (%)</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input type="number" step="1" className="input-control" value={rhTypical} onChange={(e) => setRhTypical(Number(e.target.value))} />
                  <input type="number" step="1" className="input-control" value={rhMin} onChange={(e) => setRhMin(Number(e.target.value))} />
                  <input type="number" step="1" className="input-control" value={rhMax} onChange={(e) => setRhMax(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {category === 'Fresh Produce' && (
              <div style={{ marginTop: '0.65rem' }}>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Respiration Rate (mg CO₂/kg·h at ambient)</label>
                <input
                  type="number"
                  step="0.5"
                  className="input-control"
                  value={respirationRate || 15}
                  onChange={(e) => setRespirationRate(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Primary Spoilage Risks (comma separated)</label>
            <input
              type="text"
              className="input-control"
              value={spoilageRisks}
              onChange={(e) => setSpoilageRisks(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Packaging Considerations (comma separated)</label>
            <input
              type="text"
              className="input-control"
              value={packagingConsiderations}
              onChange={(e) => setPackagingConsiderations(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? 'Saving...' : isEditing ? 'Update Commodity' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
