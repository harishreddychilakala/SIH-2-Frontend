import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  RotateCcw,
  Apple,
  Thermometer,
  Layers,
  Zap,
  Wand2,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { AiReasoningModal } from '../components/common/AiReasoningModal';
import { useToast } from '../components/common/Toast';
import { commodityService } from '../services/commodityService';
import { recommendationService } from '../services/recommendationService';
import { API_BASE } from '../services/apiConfig';
import { estimateFoodPropertiesWithProvenance, type PropertyProvenanceItem } from '../services/foodScienceEstimator';
import type {
  Commodity,
  CommodityCategory,
  RecommendationInput,
  StorageType,
  TransportCondition,
  CostPriority,
  SustainabilityPreference,
  MAPRequirement,
} from '../types';

export const ProvenanceBadge: React.FC<{
  status?: string;
  source?: string;
  testStandard?: string;
  confidence?: string;
}> = ({ status = 'User-provided', source, testStandard, confidence }) => {
  const norm = status?.toLowerCase() || 'user-provided';
  let bg = '#eff6ff';
  let border = '#bfdbfe';
  let color = '#1d4ed8';
  let label = 'User-provided';

  if (norm.includes('verified') || norm === 'measured' || norm === 'sourced') {
    bg = '#ecfdf5';
    border = '#a7f3d0';
    color = '#047857';
    label = 'Verified';
  } else if (norm.includes('estimated') || norm === 'calculated') {
    bg = '#fffbeb';
    border = '#fde68a';
    color = '#b45309';
    label = 'Estimated';
  } else if (norm.includes('unavail') || norm.includes('required') || norm.includes('missing')) {
    bg = '#fff1f2';
    border = '#fecdd3';
    color = '#be123c';
    label = 'Requires Validation';
  }

  const tooltip = [
    `Classification: ${label}`,
    source ? `Source: ${source}` : null,
    testStandard ? `Standard: ${testStandard}` : null,
    confidence ? `Confidence: ${confidence}` : null,
  ].filter(Boolean).join(' • ');

  return (
    <span
      title={tooltip}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem',
        fontSize: '0.68rem',
        padding: '0.12rem 0.45rem',
        borderRadius: '9999px',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: color,
        fontWeight: 600,
        marginLeft: '0.45rem',
        verticalAlign: 'middle',
        cursor: 'help',
      }}
    >
      {norm.includes('verified') && '✓ '}{label}
    </span>
  );
};

interface FormState {
  commodityId: string;
  customCommodityName: string;
  category: CommodityCategory;
  moistureContent: number | string;
  oilFatContent: number | string;
  ph: number | string;
  respirationRate: number | string;
  respirationUnit: string;
  storageType: StorageType;
  storageTempC: number | string;
  relativeHumidityPercent: number | string;
  desiredShelfLifeDays: number | string;
  transportCondition: TransportCondition;
  costPriority: CostPriority;
  sustainabilityPreference: SustainabilityPreference;
  mapRequirement: MAPRequirement;
  packagingFormat: string;
  noodleType?: string;
  notes: string;
}

const defaultInput: FormState = {
  commodityId: '',
  customCommodityName: '',
  category: 'Fresh Produce',
  moistureContent: '',
  oilFatContent: '',
  ph: '',
  respirationRate: '',
  respirationUnit: 'mg CO₂/kg·h',
  storageType: 'ambient',
  storageTempC: '',
  relativeHumidityPercent: '',
  desiredShelfLifeDays: '',
  transportCondition: 'local',
  costPriority: 'balanced',
  sustainabilityPreference: 'recyclable',
  mapRequirement: 'consider',
  packagingFormat: 'Flexible Pouch / Pillow Bag',
  noodleType: 'dried',
  notes: '',
};

export const RecommendPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [formData, setFormData] = useState<FormState>(defaultInput);
  const [propertyProvenance, setPropertyProvenance] = useState<Record<string, PropertyProvenanceItem>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCustomMode, setIsCustomMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiResearching, setIsAiResearching] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [autoEstimatedNote, setAutoEstimatedNote] = useState<string | null>(null);

  useEffect(() => {
    async function initCommodities() {
      const list = await commodityService.getAll();
      setCommodities(list);

      const preselectId = searchParams.get('commodityId');
      if (preselectId) {
        const found = list.find((c) => c.id === preselectId);
        if (found) {
          selectCommodity(found);
          return;
        }
      }
      // CRITICAL: Per SIH26236 requirement, do NOT preselect Mangoes or default presets!
      // Start directly on clean food product input.
      setIsCustomMode(true);
    }
    initCommodities();
  }, [searchParams]);

  const selectCommodity = (comm: Commodity) => {
    setIsCustomMode(false);
    setAutoEstimatedNote(null);
    const isProduce = comm.category === 'Fresh Produce';
    setFormData((prev) => ({
      ...prev,
      commodityId: comm.id,
      customCommodityName: comm.name,
      category: comm.category,
      moistureContent: comm.moisturePercent.typical,
      oilFatContent: comm.fatOilPercent.typical,
      ph: comm.typicalPh.typical,
      respirationRate: isProduce ? (comm.respirationRate?.rateAtAmbient || 0) : 0,
      respirationUnit: isProduce ? (comm.respirationRate?.unit || 'mg CO₂/kg·h') : 'Non-respiring',
      storageTempC: comm.recommendedStorage.tempC.typical,
      relativeHumidityPercent: comm.recommendedStorage.rhPercent.typical,
      desiredShelfLifeDays: comm.recommendedStorage.typicalShelfLifeDays,
      storageType: comm.recommendedStorage.tempC.typical < 8 ? 'chilled' : 'ambient',
    }));

    const source = (comm as any).sourceAttribution || 'PackSmart Verified Food Science Database';
    setPropertyProvenance({
      moistureContent: {
        value: `${comm.moisturePercent.typical}%`,
        source,
        status: comm.isVerified ? 'Verified' : 'Estimated',
        testStandard: 'AOAC 934.01',
        confidence: 'High',
      },
      oilFatContent: {
        value: `${comm.fatOilPercent.typical}%`,
        source,
        status: comm.isVerified ? 'Verified' : 'Estimated',
        testStandard: 'AOAC 960.39',
        confidence: 'High',
      },
      ph: {
        value: `${comm.typicalPh.typical}`,
        source,
        status: comm.isVerified ? 'Verified' : 'Estimated',
        testStandard: 'AOAC 981.12',
        confidence: 'High',
      },
      respirationRate: {
        value: isProduce ? `${comm.respirationRate?.rateAtAmbient || 0} mg CO₂/kg·h` : '0.0 mg CO₂/kg·h',
        source: isProduce ? source : 'Empirical Fact (Non-respiring)',
        status: 'Verified',
        testStandard: isProduce ? 'USDA Handbook 66 Respirometry' : 'N/A',
        confidence: 'High',
      },
    });
    setErrors({});
  };

  const triggerAutoEstimation = async (nameOverride?: string) => {
    const rawName = (nameOverride ?? formData.customCommodityName ?? '').trim();
    if (!rawName) return;

    setIsAiResearching(true);
    setAutoEstimatedNote('Querying scientific food databases & AI research engine...');

    try {
      let populated = false;

      // 1. Call the backend dual-AI product research endpoint
      try {
        const response = await fetch(`${API_BASE}/ai/research-product`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: rawName,
            userCategory: formData.category,
          }),
        });

        if (response.ok) {
          const research = await response.json();
          const props = research.properties || {};
          const prov = research.propertyProvenance || {};
          const isProduce = Boolean(research.isFreshProduce);

          setFormData((prev) => ({
            ...prev,
            category: (research.identifiedCategory as CommodityCategory) || prev.category,
            moistureContent: typeof props.moistureContent === 'number' ? props.moistureContent : prev.moistureContent,
            oilFatContent: typeof props.oilFatContent === 'number' ? props.oilFatContent : prev.oilFatContent,
            ph: typeof props.ph === 'number' ? props.ph : prev.ph,
            respirationRate: isProduce ? (typeof props.respirationRate === 'number' ? props.respirationRate : 0) : 0,
            respirationUnit: isProduce ? (props.respirationUnit || 'mg CO₂/kg·h') : 'Non-respiring',
            storageTempC: prev.storageTempC,
            relativeHumidityPercent: prev.relativeHumidityPercent,
            desiredShelfLifeDays: prev.desiredShelfLifeDays,
            storageType: prev.storageType,
          }));

          const frontendProvenance: Record<string, PropertyProvenanceItem> = {
            moistureContent: {
              value: prov.moisture?.value || `${props.moistureContent}%`,
              source: prov.moisture?.source || 'AOAC Vacuum Oven / Codex Alimentarius',
              status: (prov.moisture?.status as any) || (research.isVerifiedFood ? 'Verified' : 'Literature-based'),
              testStandard: prov.moisture?.testStandard || 'AOAC 925.10',
              confidence: prov.moisture?.confidence || 'High',
            },
            oilFatContent: {
              value: prov.oilFat?.value || `${props.oilFatContent}%`,
              source: prov.oilFat?.source || 'AOAC Soxhlet Extraction',
              status: (prov.oilFat?.status as any) || (research.isVerifiedFood ? 'Verified' : 'Literature-based'),
              testStandard: prov.oilFat?.testStandard || 'AOAC 920.39',
              confidence: prov.oilFat?.confidence || 'High',
            },
            ph: {
              value: prov.ph?.value || `${props.ph}`,
              source: prov.ph?.source || 'ASTM E70 Standard Glass Electrode',
              status: (prov.ph?.status as any) || (research.isVerifiedFood ? 'Verified' : 'Literature-based'),
              testStandard: prov.ph?.testStandard || 'ASTM E70',
              confidence: prov.ph?.confidence || 'High',
            },
            respirationRate: {
              value: isProduce ? (prov.respiration?.value || `${props.respirationRate} mg CO₂/kg·h`) : '0.0 mg CO₂/kg·h',
              source: isProduce ? (prov.respiration?.source || 'USDA ARS Handbook 66') : 'Empirical Fact (Non-respiring matrix)',
              status: (prov.respiration?.status as any) || (isProduce ? 'Literature-based' : 'Verified'),
              testStandard: isProduce ? 'ASTM D1434 Respirometry' : 'N/A',
              confidence: 'High',
            },
          };

          setPropertyProvenance(frontendProvenance);
          const sourceTitle = research.sources?.[0]?.documentTitle || 'Codex / USDA / FSSAI Reference Database';
          setAutoEstimatedNote(
            research.isVerifiedFood
              ? `Verified scientific parameters loaded (${sourceTitle}).`
              : `Evidence-based parameters retrieved for ${rawName} (${sourceTitle}).`
          );
          populated = true;
        }
      } catch (err) {
        console.warn('Backend product research query error, using local food science database:', err);
      }

      // 2. Fallback to rich local food science knowledge base if backend didn't populate
      if (!populated) {
        const estimated = estimateFoodPropertiesWithProvenance(rawName, formData.category);
        const isProduce = estimated.category === 'Fresh Produce';

        setFormData((prev) => ({
          ...prev,
          category: estimated.category,
          moistureContent: estimated.moistureContent,
          oilFatContent: estimated.oilFatContent,
          ph: estimated.ph,
          respirationRate: isProduce ? estimated.respirationRate : 0,
          respirationUnit: isProduce ? estimated.respirationUnit : 'Non-respiring',
          storageTempC: prev.storageTempC,
          relativeHumidityPercent: prev.relativeHumidityPercent,
          desiredShelfLifeDays: prev.desiredShelfLifeDays,
          storageType: prev.storageType,
        }));

        setPropertyProvenance(estimated.propertyProvenance);
        setAutoEstimatedNote(
          estimated.isVerifiedFood
            ? `Verified parameters loaded: ${estimated.sourceAttribution}`
            : `Baseline parameters loaded (${estimated.sourceAttribution}). Review and adjust before submitting.`
        );
      }
    } catch (e) {
      console.error('Error during auto estimation:', e);
    } finally {
      setIsAiResearching(false);
    }
  };

  const handleCommoditySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom' || val === '') {
      setIsCustomMode(true);
      setFormData((prev) => ({
        ...prev,
        commodityId: '',
        customCommodityName: '',
      }));
    } else {
      const found = commodities.find((c) => c.id === val);
      if (found) {
        selectCommodity(found);
      }
    }
  };

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, customCommodityName: name }));
    if (errors.customCommodityName) {
      setErrors((prev) => ({ ...prev, customCommodityName: '' }));
    }
  };

  const handleCategoryChange = (cat: CommodityCategory) => {
    const isProduce = cat === 'Fresh Produce';
    setFormData((prev) => ({
      ...prev,
      category: cat,
      respirationRate: isProduce ? prev.respirationRate : 0,
      respirationUnit: isProduce ? (prev.respirationUnit === 'Non-respiring' ? 'mg CO₂/kg·h' : prev.respirationUnit) : 'Non-respiring',
    }));
    if (!isProduce) {
      setPropertyProvenance((prev) => ({
        ...prev,
        respirationRate: {
          value: '0.0 mg CO₂/kg·h',
          source: 'Physically Non-respiring Matrix (Empirical Standard)',
          status: 'Verified',
          testStandard: 'N/A (Zero horticulture respiration)',
          confidence: 'High',
        },
      }));
    }
  };

  const handleMoistureChange = (val: string) => {
    setFormData((prev) => ({ ...prev, moistureContent: val }));
    setPropertyProvenance((prev) => ({
      ...prev,
      moistureContent: {
        value: `${val}%`,
        source: 'User Laboratory Measurement / Manual Input',
        status: 'User-provided',
        testStandard: 'Direct User Input (Not independently verified)',
        confidence: 'User-reported',
      },
    }));
  };

  const handleFatChange = (val: string) => {
    setFormData((prev) => ({ ...prev, oilFatContent: val }));
    setPropertyProvenance((prev) => ({
      ...prev,
      oilFatContent: {
        value: `${val}%`,
        source: 'User Laboratory Measurement / Manual Input',
        status: 'User-provided',
        testStandard: 'Direct User Input (Not independently verified)',
        confidence: 'User-reported',
      },
    }));
  };

  const handlePhChange = (val: string) => {
    setFormData((prev) => ({ ...prev, ph: val }));
    setPropertyProvenance((prev) => ({
      ...prev,
      ph: {
        value: `${val}`,
        source: 'User Laboratory Measurement / Manual Input',
        status: 'User-provided',
        testStandard: 'Direct User Input (Not independently verified)',
        confidence: 'User-reported',
      },
    }));
  };

  const handleRespirationChange = (val: string) => {
    setFormData((prev) => ({ ...prev, respirationRate: val }));
    setPropertyProvenance((prev) => ({
      ...prev,
      respirationRate: {
        value: `${val} ${formData.respirationUnit}`,
        source: 'User Laboratory Measurement / Manual Input',
        status: 'User-provided',
        testStandard: 'Direct User Input (Not independently verified)',
        confidence: 'User-reported',
      },
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.customCommodityName?.trim() && !formData.commodityId) {
      errs.customCommodityName = 'Commodity / Food Product name is required.';
    }

    const moisture = Number(formData.moistureContent);
    if (formData.moistureContent === '' || isNaN(moisture) || moisture < 0 || moisture > 100) {
      errs.moistureContent = 'Moisture content must be a valid percentage between 0% and 100%.';
    }

    const fat = Number(formData.oilFatContent);
    if (formData.oilFatContent === '' || isNaN(fat) || fat < 0 || fat > 100) {
      errs.oilFatContent = 'Oil/Fat content must be a valid percentage between 0% and 100%.';
    }

    // Physical conservation of mass check
    if (!isNaN(moisture) && !isNaN(fat) && moisture + fat > 100) {
      errs.moistureContent = `Moisture (${moisture}%) + Oil/Fat (${fat}%) = ${(moisture + fat).toFixed(1)}%. Total exceeds 100%, violating conservation of mass.`;
    }

    const ph = Number(formData.ph);
    if (formData.ph === '' || isNaN(ph) || ph < 1.0 || ph > 14.0) {
      errs.ph = 'pH must be between 1.0 and 14.0 on standard chemical scale.';
    }

    // Respiration check for non-produce
    const resp = Number(formData.respirationRate);
    if (formData.category !== 'Fresh Produce' && resp > 0) {
      errs.respirationRate = 'Non-produce foods (dairy, snacks, meats, grains) cannot have active post-harvest respiration (> 0).';
    }

    const rawTemp = formData.storageTempC;
    const temp = Number(rawTemp);
    if (rawTemp === '' || rawTemp === undefined || isNaN(temp) || temp < -30 || temp > 60) {
      errs.storageTempC = 'Please enter your storage temperature (-30°C to 60°C).';
    }

    const rawRh = formData.relativeHumidityPercent;
    const rh = Number(rawRh);
    if (rawRh === '' || rawRh === undefined || isNaN(rh) || rh < 10 || rh > 100) {
      errs.relativeHumidityPercent = 'Please enter your relative humidity percentage (10% to 100%).';
    }

    const rawShelfLife = formData.desiredShelfLifeDays;
    const shelfLife = Number(rawShelfLife);
    if (rawShelfLife === '' || rawShelfLife === undefined || isNaN(shelfLife) || shelfLife < 1 || shelfLife > 3650) {
      errs.desiredShelfLifeDays = 'Please enter your desired target shelf life in days (e.g. 14, 30, 90, 180, 365).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix invalid input fields before generating.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const parsedShelfLife = Number(formData.desiredShelfLifeDays);
      const parsedTemp = Number(formData.storageTempC);
      const parsedRh = Number(formData.relativeHumidityPercent);
      const parsedMoisture = Number(formData.moistureContent);
      const parsedFat = Number(formData.oilFatContent);
      const parsedPh = Number(formData.ph);
      const parsedResp = Number(formData.respirationRate);

      const payload: RecommendationInput = {
        commodityId: isCustomMode ? '' : formData.commodityId,
        customCommodityName: isCustomMode ? formData.customCommodityName : undefined,
        category: formData.category,
        moistureContent: !isNaN(parsedMoisture) && parsedMoisture >= 0 ? parsedMoisture : 0,
        oilFatContent: !isNaN(parsedFat) && parsedFat >= 0 ? parsedFat : 0,
        ph: !isNaN(parsedPh) && parsedPh > 0 ? parsedPh : 6.0,
        respirationRate: !isNaN(parsedResp) && parsedResp >= 0 ? parsedResp : 0,
        respirationUnit: formData.respirationUnit,
        storageType: formData.storageType,
        storageTempC: !isNaN(parsedTemp) ? parsedTemp : 20,
        relativeHumidityPercent: !isNaN(parsedRh) && parsedRh > 0 ? parsedRh : 65,
        desiredShelfLifeDays: !isNaN(parsedShelfLife) && parsedShelfLife > 0 ? Math.round(parsedShelfLife) : 14,
        transportCondition: formData.transportCondition,
        costPriority: formData.costPriority,
        sustainabilityPreference: formData.sustainabilityPreference,
        mapRequirement: formData.mapRequirement,
        packagingFormat: formData.packagingFormat,
        noodleType: formData.category === 'Noodles & Pasta' ? (formData.noodleType || 'dried') : formData.noodleType,
        notes: formData.notes,
      };

      const result = await recommendationService.generateRecommendation(payload);
      showToast('Recommendation generated successfully!', 'success');
      navigate(`/recommendation/${result.id}`);
    } catch {
      showToast('Failed to generate recommendation. Please check inputs.', 'error');
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (commodities.length > 0) {
      selectCommodity(commodities[0]);
    } else {
      setFormData(defaultInput);
    }
    setErrors({});
    setAutoEstimatedNote(null);
    setShowResetDialog(false);
    showToast('Form reset to default parameters.', 'info');
  };

  if (isProcessing) {
    return (
      <AiReasoningModal
        commodityName={formData.customCommodityName || formData.commodityId}
        category={formData.category}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Generate Packaging Recommendation"
        description="Enter physicochemical characteristics and distribution parameters to derive optimal barrier structures and modified atmosphere recommendations."
        badgeText="SIH26236 Engine"
      />



      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* SECTION A: Food Details */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: '1.25rem' }}>
                <div className="card-title">
                  <Apple size={18} style={{ color: 'var(--primary)' }} />
                  Section A: Food Matrix & Biological Properties
                </div>
              </div>

              {/* Primary Food Product Input with Prominent Auto-Fill */}
              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.2rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="custom-comm-name" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Food Product / Commodity Name <span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <input
                      id="custom-comm-name"
                      type="text"
                      placeholder="e.g., Curd / Dahi, Alphonso Mango, Potato Chips, Salmon, Paneer, Dried Noodles..."
                      className={`input-control ${errors.customCommodityName ? 'has-error' : ''}`}
                      value={formData.customCommodityName}
                      onChange={handleCustomNameChange}
                      style={{ flex: 1, minWidth: '240px', fontSize: '0.95rem' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => triggerAutoEstimation()}
                      disabled={isAiResearching || !formData.customCommodityName?.trim()}
                      id="autofill-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        minWidth: '175px',
                        justifyContent: 'center',
                      }}
                    >
                      {isAiResearching ? (
                        <>
                          <Loader2 size={16} className="spin" />
                          <span>Auto-filling...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={16} />
                          <span>Auto-Fill Details</span>
                        </>
                      )}
                    </button>
                  </div>
                  {errors.customCommodityName && (
                    <span className="form-error" style={{ display: 'block', marginTop: '0.35rem' }}>{errors.customCommodityName}</span>
                  )}
                  <span className="form-hint" style={{ marginTop: '0.35rem', display: 'block' }}>
                    Type any food commodity name and click <strong>Auto-Fill Details</strong> to retrieve verified scientific properties and provenance.
                  </span>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="category-select">
                      Commodity Category <span className="required">*</span>
                    </label>
                    <select
                      id="category-select"
                      className="select-control"
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value as CommodityCategory)}
                    >
                      <option value="Fresh Produce">Fresh Produce (Horticulture)</option>
                      <option value="Dry Grains & Pulses">Dry Grains & Pulses</option>
                      <option value="Fat-Rich & Oils">Fat-Rich Foods & Snacks</option>
                      <option value="Dairy & Processed">Dairy & Processed Foods</option>
                      <option value="Bakery & Confectionery">Bakery & Confectionery</option>
                      <option value="Meat & Marine">Meat & Marine</option>
                      <option value="Noodles & Pasta">Noodles & Pasta</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="commodity-selector">
                      Or Select from Verified Catalog (Optional)
                    </label>
                    <select
                      id="commodity-selector"
                      className="select-control"
                      value={isCustomMode ? '' : formData.commodityId}
                      onChange={handleCommoditySelectChange}
                    >
                      <option value="">-- Choose from preset database --</option>
                      {commodities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {autoEstimatedNote && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--teal-900)', backgroundColor: 'var(--teal-50)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--teal-200)', lineHeight: 1.45 }}>
                    {autoEstimatedNote}
                  </div>
                )}
              </div>

              {/* Dedicated Noodle Subtype & Processing Flow */}
              {(formData.category === 'Noodles & Pasta' || (formData.customCommodityName && formData.customCommodityName.toLowerCase().includes('noodle'))) && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label className="form-label" htmlFor="noodle-subtype-select" style={{ fontWeight: 700, color: '#166534', margin: 0 }}>
                      🍜 Noodle Processing Subtype & Food Matrix
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>
                      Domain-Specific Preservation Logic
                    </span>
                  </div>
                  <select
                    id="noodle-subtype-select"
                    className="select-control"
                    value={formData.noodleType || 'dried'}
                    onChange={(e) => {
                      const nType = e.target.value;
                      let updatedMoisture = formData.moistureContent;
                      let updatedFat = formData.oilFatContent;
                      let updatedStorageType: StorageType = formData.storageType;
                      let updatedTemp = formData.storageTempC;
                      let updatedShelfLife = formData.desiredShelfLifeDays;

                      if (nType === 'instant_fried') {
                        updatedMoisture = 3.5;
                        updatedFat = 18.0;
                        updatedStorageType = 'ambient';
                        updatedTemp = 25;
                        updatedShelfLife = 270;
                      } else if (nType === 'instant_non_fried') {
                        updatedMoisture = 8.5;
                        updatedFat = 1.5;
                        updatedStorageType = 'ambient';
                        updatedTemp = 25;
                        updatedShelfLife = 240;
                      } else if (nType === 'fresh') {
                        updatedMoisture = 33.0;
                        updatedFat = 1.2;
                        updatedStorageType = 'chilled';
                        updatedTemp = 4;
                        updatedShelfLife = 14;
                      } else if (nType === 'cooked') {
                        updatedMoisture = 65.0;
                        updatedFat = 2.0;
                        updatedStorageType = 'chilled';
                        updatedTemp = 3;
                        updatedShelfLife = 4;
                      } else if (nType === 'frozen') {
                        updatedMoisture = 55.0;
                        updatedFat = 1.5;
                        updatedStorageType = 'frozen';
                        updatedTemp = -18;
                        updatedShelfLife = 180;
                      } else if (nType === 'dried' || nType === 'pasta') {
                        updatedMoisture = 11.0;
                        updatedFat = 1.0;
                        updatedStorageType = 'ambient';
                        updatedTemp = 22;
                        updatedShelfLife = 365;
                      }

                      setFormData((prev) => ({
                        ...prev,
                        noodleType: nType,
                        moistureContent: updatedMoisture,
                        oilFatContent: updatedFat,
                        storageType: updatedStorageType,
                        storageTempC: updatedTemp,
                        desiredShelfLifeDays: updatedShelfLife,
                      }));
                    }}
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <option value="dried">Dried Noodles (Aw &lt; 0.60, Moisture 10-12%, Ambient)</option>
                    <option value="instant_fried">Instant Fried Noodles (Ramen / Maggi, 16-22% Fat, Lipid Rancidity Risk)</option>
                    <option value="instant_non_fried">Instant Air-Dried / Non-Fried Noodles (Low Fat, High Moisture Barrier)</option>
                    <option value="fresh">Fresh Raw / Alkaline Noodles (Udon / Ramen, 30-36% Moisture, Chilled 0-4°C)</option>
                    <option value="cooked">Cooked / Steamed Ready Noodles (60-70% Moisture, Bacillus cereus Hazard, Max 3-5 Chilled Days)</option>
                    <option value="frozen">Frozen Noodles / Dumpling Wrappers (&le; -18°C, Freezer Burn &amp; Cold Crack Defense)</option>
                    <option value="pasta">Dried Durum Wheat Pasta (Extruded Semolina, Aw &lt; 0.55)</option>
                  </select>
                  <div style={{ marginTop: '0.45rem', fontSize: '0.75rem', color: '#166534', lineHeight: 1.4 }}>
                    {formData.noodleType === 'instant_fried' && '⚠️ Evaluates high lipid auto-oxidation barrier (BOPP/Met-CPP opaque light lockout) and inert N₂ flushing per Codex CXS 249-2006.'}
                    {formData.noodleType === 'fresh' && '⚠️ Evaluates high-moisture microbial safety (mold/yeast) and cold chain (0-4°C) with PA/PE barrier film.'}
                    {formData.noodleType === 'cooked' && '🚨 CRITICAL: High Aw starch matrix is susceptible to heat-stable Bacillus cereus emetic toxin if stored > 10°C. Requires strict chilling (≤ 4°C, max 3-5 days).'}
                    {formData.noodleType === 'frozen' && '❄️ Evaluates low-temperature dart impact toughness and moisture vapor barrier at -18°C to prevent ice sublimation (freezer burn).'}
                    {(!formData.noodleType || formData.noodleType === 'dried' || formData.noodleType === 'pasta') && '🌾 Evaluates moisture ingress barrier (BOPP/CPP or HDPE) to maintain crisp texture and prevent mold growth at Aw < 0.65.'}
                  </div>
                </div>
              )}

              {/* Physicochemical Parameters with Granular Provenance Badges */}
              <div className="grid-3" style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="moisture-input">
                    Moisture Content (%) <span className="required">*</span>
                    <ProvenanceBadge
                      status={propertyProvenance.moistureContent?.status || (formData.moistureContent !== '' ? 'User-provided' : undefined)}
                      source={propertyProvenance.moistureContent?.source}
                      testStandard={propertyProvenance.moistureContent?.testStandard}
                      confidence={propertyProvenance.moistureContent?.confidence}
                    />
                  </label>
                  <input
                    id="moisture-input"
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    placeholder="e.g. 86.0"
                    className={`input-control ${errors.moistureContent ? 'has-error' : ''}`}
                    value={formData.moistureContent !== undefined ? formData.moistureContent : ''}
                    onChange={(e) => handleMoistureChange(e.target.value)}
                  />
                  <span className="form-hint">Water activity indicator</span>
                  {errors.moistureContent && (
                    <span className="form-error">{errors.moistureContent}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fat-input">
                    Oil / Fat Content (%) <span className="required">*</span>
                    <ProvenanceBadge
                      status={propertyProvenance.oilFatContent?.status || (formData.oilFatContent !== '' ? 'User-provided' : undefined)}
                      source={propertyProvenance.oilFatContent?.source}
                      testStandard={propertyProvenance.oilFatContent?.testStandard}
                      confidence={propertyProvenance.oilFatContent?.confidence}
                    />
                  </label>
                  <input
                    id="fat-input"
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    placeholder="e.g. 3.8"
                    className={`input-control ${errors.oilFatContent ? 'has-error' : ''}`}
                    value={formData.oilFatContent !== undefined ? formData.oilFatContent : ''}
                    onChange={(e) => handleFatChange(e.target.value)}
                  />
                  <span className="form-hint">Lipid oxidation trigger (&gt;15% requires OTR &lt; 15)</span>
                  {errors.oilFatContent && (
                    <span className="form-error">{errors.oilFatContent}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ph-input">
                    Product pH <span className="required">*</span>
                    <ProvenanceBadge
                      status={propertyProvenance.ph?.status || (formData.ph !== '' ? 'User-provided' : undefined)}
                      source={propertyProvenance.ph?.source}
                      testStandard={propertyProvenance.ph?.testStandard}
                      confidence={propertyProvenance.ph?.confidence}
                    />
                  </label>
                  <input
                    id="ph-input"
                    type="number"
                    step="any"
                    min="1"
                    max="14"
                    placeholder="e.g. 4.4"
                    className={`input-control ${errors.ph ? 'has-error' : ''}`}
                    value={formData.ph !== undefined ? formData.ph : ''}
                    onChange={(e) => handlePhChange(e.target.value)}
                  />
                  <span className="form-hint">Chemical acidity scale (1.0 - 14.0)</span>
                  {errors.ph && <span className="form-error">{errors.ph}</span>}
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="respiration-input">
                    Respiration Rate ({formData.respirationUnit})
                    <ProvenanceBadge
                      status={propertyProvenance.respirationRate?.status || (formData.respirationRate !== '' ? 'User-provided' : undefined)}
                      source={propertyProvenance.respirationRate?.source}
                      testStandard={propertyProvenance.respirationRate?.testStandard}
                      confidence={propertyProvenance.respirationRate?.confidence}
                    />
                  </label>
                  <input
                    id="respiration-input"
                    type="number"
                    min="0"
                    step="any"
                    className="input-control"
                    disabled={formData.category !== 'Fresh Produce'}
                    placeholder={formData.category === 'Fresh Produce' ? 'e.g. 25' : '0.0 (Non-respiring)'}
                    value={formData.category === 'Fresh Produce' ? (formData.respirationRate !== undefined ? formData.respirationRate : '') : 0}
                    onChange={(e) => handleRespirationChange(e.target.value)}
                  />
                  <span className="form-hint">
                    {formData.category === 'Fresh Produce'
                      ? 'Post-harvest metabolic rate of living crop (USDA Handbook 66)'
                      : 'Non-respiring matrix: Respiration applies exclusively to living horticultural produce.'}
                  </span>
                  {errors.respirationRate && (
                    <span className="form-error">{errors.respirationRate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="respiration-unit">
                    Respiration Unit
                  </label>
                  <input
                    id="respiration-unit"
                    type="text"
                    className="input-control"
                    disabled={formData.category !== 'Fresh Produce'}
                    value={formData.category === 'Fresh Produce' ? formData.respirationUnit : 'Non-respiring'}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, respirationUnit: e.target.value }))
                    }
                  />
                  <span className="form-hint">
                    {formData.category === 'Fresh Produce' ? 'mg CO₂/kg·h at reference temperature' : 'Fixed for non-produce matrices'}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION B: Storage Conditions */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: '1.25rem' }}>
                <div className="card-title">
                  <Thermometer size={18} style={{ color: 'var(--primary)' }} />
                  Section B: Storage & Environmental Conditions
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="storage-type">
                    Storage Type <span className="required">*</span>
                  </label>
                  <select
                    id="storage-type"
                    className="select-control"
                    value={formData.storageType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        storageType: e.target.value as StorageType,
                      }))
                    }
                  >
                    <option value="ambient">Ambient (15°C - 35°C)</option>
                    <option value="chilled">Chilled Cold-Chain (0°C - 8°C)</option>
                    <option value="frozen">Deep Frozen (-18°C or lower)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="storage-temp">
                    Storage Temperature (°C) <span className="required">*</span>
                  </label>
                  <input
                    id="storage-temp"
                    type="number"
                    step="any"
                    placeholder="e.g. 4 (chilled) or 22 (ambient)"
                    className={`input-control ${errors.storageTempC ? 'has-error' : ''}`}
                    value={formData.storageTempC !== undefined ? formData.storageTempC : ''}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, storageTempC: e.target.value }));
                      if (errors.storageTempC) {
                        setErrors((prev) => ({ ...prev, storageTempC: '' }));
                      }
                    }}
                  />
                  {errors.storageTempC && (
                    <span className="form-error">{errors.storageTempC}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="storage-rh">
                    Relative Humidity (%) <span className="required">*</span>
                  </label>
                  <input
                    id="storage-rh"
                    type="number"
                    step="any"
                    min="10"
                    max="100"
                    placeholder="e.g. 60 or 90"
                    className={`input-control ${errors.relativeHumidityPercent ? 'has-error' : ''}`}
                    value={formData.relativeHumidityPercent !== undefined ? formData.relativeHumidityPercent : ''}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        relativeHumidityPercent: e.target.value,
                      }));
                      if (errors.relativeHumidityPercent) {
                        setErrors((prev) => ({ ...prev, relativeHumidityPercent: '' }));
                      }
                    }}
                  />
                  {errors.relativeHumidityPercent && (
                    <span className="form-error">{errors.relativeHumidityPercent}</span>
                  )}
                </div>
              </div>

              <div className="grid-2" style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="shelf-life">
                    Target Shelf Life (Days) <span className="required">*</span>
                  </label>
                  <input
                    id="shelf-life"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 14, 30, 90, 180 (Enter desired days)"
                    className={`input-control ${errors.desiredShelfLifeDays ? 'has-error' : ''}`}
                    value={formData.desiredShelfLifeDays !== undefined ? formData.desiredShelfLifeDays : ''}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        desiredShelfLifeDays: e.target.value,
                      }));
                      if (errors.desiredShelfLifeDays) {
                        setErrors((prev) => ({ ...prev, desiredShelfLifeDays: '' }));
                      }
                    }}
                  />
                  <span className="form-hint">Enter your required target shelf life in days for this food product</span>
                  {errors.desiredShelfLifeDays && (
                    <span className="form-error">{errors.desiredShelfLifeDays}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="transport-cond">
                    Transportation & Transit Condition <span className="required">*</span>
                  </label>
                  <select
                    id="transport-cond"
                    className="select-control"
                    value={formData.transportCondition}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        transportCondition: e.target.value as TransportCondition,
                      }))
                    }
                  >
                    <option value="local">Local Urban Distribution (&lt; 100 km)</option>
                    <option value="long_distance">Long Distance Inter-State Transit</option>
                    <option value="refrigerated">Active Refrigerated Reefer Transit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION C: Packaging Preferences */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: '1.25rem' }}>
                <div className="card-title">
                  <Layers size={18} style={{ color: 'var(--primary)' }} />
                  Section C: Packaging & Commercial Preferences
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="cost-priority">
                    Cost Priority
                  </label>
                  <select
                    id="cost-priority"
                    className="select-control"
                    value={formData.costPriority}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        costPriority: e.target.value as CostPriority,
                      }))
                    }
                  >
                    <option value="low">Low Cost / Maximum Economy</option>
                    <option value="balanced">Balanced Cost-Performance</option>
                    <option value="premium">Premium Maximum Protection</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sustainability-pref">
                    Sustainability Focus
                  </label>
                  <select
                    id="sustainability-pref"
                    className="select-control"
                    value={formData.sustainabilityPreference}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sustainabilityPreference: e.target.value as SustainabilityPreference,
                      }))
                    }
                  >
                    <option value="any">Any Compliant Substrate</option>
                    <option value="recyclable">Recyclable Mono-material (RIC 2/4/5)</option>
                    <option value="biodegradable">Bio-based / Industrially Compostable</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="map-req">
                    MAP (Modified Atmosphere)
                  </label>
                  <select
                    id="map-req"
                    className="select-control"
                    value={formData.mapRequirement}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        mapRequirement: e.target.value as MAPRequirement,
                      }))
                    }
                  >
                    <option value="none">Not Required / Standard Air</option>
                    <option value="consider">Consider MAP if Beneficial</option>
                    <option value="required">Mandatory MAP Flush Plan</option>
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="pkg-format">
                    Optional Packaging Format
                  </label>
                  <select
                    id="pkg-format"
                    className="select-control"
                    value={formData.packagingFormat}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, packagingFormat: e.target.value }))
                    }
                  >
                    <option value="Flexible Pouch / Pillow Bag">Flexible Pouch / Pillow Bag</option>
                    <option value="Stand-up Doypack / Zipper">Stand-up Doypack with Zipper</option>
                    <option value="Rigid Tray + Barrier Lidding">Rigid Tray with Barrier Top Film</option>
                    <option value="Thermoform Vacuum Pack">Thermoformed Vacuum Skin Pack</option>
                    <option value="Bulk Bag / Liner (10-25 kg)">Bulk Agro Liner Bag</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="custom-notes">
                    Handling / Special Notes (Optional)
                  </label>
                  <input
                    id="custom-notes"
                    type="text"
                    placeholder="e.g., Export shipping, fragile skin"
                    className="input-control"
                    value={formData.notes || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowResetDialog(true)}
              >
                <RotateCcw size={16} />
                <span>Reset Form</span>
              </button>

              <button type="submit" className="btn btn-primary btn-lg">
                <Sparkles size={18} />
                <span>Generate Recommendation</span>
              </button>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                Evaluation Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Target Food:</span>
                  <strong style={{ color: 'var(--text-main)' }}>
                    {isCustomMode ? formData.customCommodityName || 'Custom' : commodities.find((c) => c.id === formData.commodityId)?.name}
                  </strong>
                </div>

                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                  <span>{formData.category}</span>
                </div>

                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Storage Regime:</span>
                  <span>{formData.storageType.toUpperCase()} ({formData.storageTempC}°C)</span>
                </div>

                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Humidity (RH):</span>
                  <span>{formData.relativeHumidityPercent}% RH</span>
                </div>

                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Target Shelf Life:</span>
                  <strong>{formData.desiredShelfLifeDays} Days</strong>
                </div>

                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Sustainability:</span>
                  <span>{formData.sustainabilityPreference}</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.78rem',
                  color: 'var(--text-body)',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Zap size={14} /> Heuristic Forecast
                </div>
                {Number(formData.oilFatContent) > 15 ? (
                  <span>High lipid content will trigger high-barrier light/oxygen lockout (OTR &lt; 15) to prevent rancidity.</span>
                ) : formData.category === 'Fresh Produce' ? (
                  <span>Respiring horticulture will favor laser micro-perforated or breathable bio-film to avert anoxia.</span>
                ) : Number(formData.relativeHumidityPercent) > 75 ? (
                  <span>High ambient RH will mandate high WVTR moisture barrier to stop moisture uptake.</span>
                ) : (
                  <span>Standard balanced polyolefin or composite film will be prioritized for commercial efficiency.</span>
                )}
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: '1rem',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                SIH Problem Statement SIH26236
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', lineHeight: 1.4 }}>
                Algorithm optimizes post-harvest storage efficiency and guides value-chain stakeholders toward sustainable barrier substrates.
              </p>
            </div>
          </div>
        </div>
      </form>

      <ConfirmationDialog
        isOpen={showResetDialog}
        title="Reset Form Fields"
        message="Are you sure you want to reset all input fields to their default values? Any customized parameters will be cleared."
        confirmLabel="Yes, Reset Form"
        isDestructive={true}
        onConfirm={handleReset}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
};
