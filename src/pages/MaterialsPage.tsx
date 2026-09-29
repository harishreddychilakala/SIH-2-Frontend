import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Plus, Edit2, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchInput } from '../components/common/SearchInput';
import { FilterDropdown } from '../components/common/FilterDropdown';
import { MaterialCard } from '../components/materials/MaterialCard';
import { MaterialDetailModal } from '../components/materials/MaterialDetailModal';
import { MaterialFormModal } from '../components/materials/MaterialFormModal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { useToast } from '../components/common/Toast';
import { materialService } from '../services/materialService';
import type { PackagingMaterial } from '../types';

const SYSTEM_MATERIAL_IDS = new Set(
  Array.from({ length: 12 }, (_, i) => `mat-${i + 1}`)
);

export const MaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<PackagingMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSustainability, setSelectedSustainability] = useState<string>('All');
  const [activeMaterial, setActiveMaterial] = useState<PackagingMaterial | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Material Research states
  const [isAiResearching, setIsAiResearching] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalInput, setAiModalInput] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<PackagingMaterial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PackagingMaterial | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await materialService.getAll();
      setMaterials(list);
    } catch (err: any) {
      showToast(err.message || 'Failed to load materials from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = [...materials];
    if (selectedCategory !== 'All') {
      result = result.filter((m) => m.category === selectedCategory);
    }
    if (selectedSustainability !== 'All') {
      result = result.filter((m) => m.sustainability.type === selectedSustainability);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.typicalApplications.some((a) => a.toLowerCase().includes(q))
      );
    }
    setFilteredMaterials(result);
  }, [searchQuery, selectedCategory, selectedSustainability, materials]);

  const handleCompareToggle = (mat: PackagingMaterial) => {
    if (compareList.includes(mat.id)) {
      setCompareList(compareList.filter((id) => id !== mat.id));
    } else {
      if (compareList.length >= 4) {
        setCompareList([...compareList.slice(1), mat.id]);
      } else {
        setCompareList([...compareList, mat.id]);
      }
    }
  };

  const handleLaunchCompare = () => {
    const params = compareList.map((id, idx) => `mat${idx + 1}=${id}`).join('&');
    navigate(`/compare?${params}`);
  };

  const handleCreateNew = () => {
    setMaterialToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (mat: PackagingMaterial, e: React.MouseEvent) => {
    e.stopPropagation();
    setMaterialToEdit(mat);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (mat: PackagingMaterial, e: React.MouseEvent) => {
    e.stopPropagation();
    if (SYSTEM_MATERIAL_IDS.has(mat.id)) {
      showToast('Predefined benchmark substrates cannot be deleted.', 'info');
      return;
    }
    setDeleteTarget(mat);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await materialService.delete(deleteTarget.id);
      setMaterials((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setCompareList((prev) => prev.filter((id) => id !== deleteTarget.id));
      showToast(`Material '${deleteTarget.name}' deleted successfully.`, 'info');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete material.', 'error');
    }
  };

  const handleSavedMaterial = (saved: PackagingMaterial) => {
    setMaterials((prev) => {
      const exists = prev.some((m) => m.id === saved.id);
      if (exists) {
        return prev.map((m) => (m.id === saved.id ? saved : m));
      }
      return [saved, ...prev];
    });
    showToast(`Material '${saved.name}' saved to database.`, 'success');
  };

  // Perform AI material research via Gemini/Groq
  const handleAiResearch = async (nameToResearch: string) => {
    const q = nameToResearch.trim();
    if (!q) return;

    setIsAiResearching(true);
    try {
      const cat = selectedCategory !== 'All' ? selectedCategory : undefined;
      const researched = await materialService.researchMaterialWithAI(q, cat);
      if (researched) {
        setMaterials((prev) => {
          const already = prev.find((m) => m.name.toLowerCase() === researched.name.toLowerCase() || m.code === researched.code);
          if (already) return prev;
          return [researched, ...prev];
        });
        showToast(`✨ Gemini & Groq successfully researched specifications for "${researched.name}"!`, 'success');
        setIsAiModalOpen(false);
        setAiModalInput('');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to research material via AI.', 'error');
    } finally {
      setIsAiResearching(false);
    }
  };

  // Save AI researched material to permanent database
  const handleSaveAiMaterialToDb = async (mat: PackagingMaterial) => {
    try {
      const payload: Omit<PackagingMaterial, 'id'> = {
        name: mat.name,
        code: mat.code,
        layerStructure: mat.layerStructure,
        category: mat.category as any,
        description: mat.description,
        otr: mat.otr,
        wvtr: mat.wvtr,
        thicknessRangeMicrons: mat.thicknessRangeMicrons,
        sealability: mat.sealability,
        mechanicalStrength: mat.mechanicalStrength,
        sustainability: mat.sustainability,
        indicativeCostTier: mat.indicativeCostTier,
        indicativePricePerKgRange: mat.indicativePricePerKgRange,
        typicalApplications: mat.typicalApplications,
        idealCommodityCategories: mat.idealCommodityCategories,
        keyLimitations: mat.keyLimitations,
        isVerified: false,
        sourceAttribution: `${mat.sourceAttribution || 'Dual-AI Analysis'} (Saved by user)`,
      };

      const saved = await materialService.create(payload);
      setMaterials((prev) => prev.map((m) => (m.id === mat.id ? saved : m)));
      showToast(`Material '${saved.name}' permanently saved to catalog database!`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to save material to catalog.', 'error');
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <PageHeader
        title="Packaging Substrates & Barrier Materials"
        description="Comprehensive technical library of flexible films, barrier laminates, mono-materials, and circular biopolymers."
        badgeText={`${materials.length} Substrates Available`}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAiModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--primary-light)',
                borderColor: 'var(--primary-border)',
                color: 'var(--primary)',
                fontWeight: 600,
              }}
              title="Search and synthesize barrier properties for any custom or unlisted polymer using Gemini & Groq"
            >
              <Sparkles size={15} /> AI Substrate Research
            </button>

            {compareList.length > 0 && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleLaunchCompare}>
                <Scale size={15} /> Compare ({compareList.length}/4)
              </button>
            )}

            <button type="button" className="btn btn-primary btn-sm" onClick={handleCreateNew}>
              <Plus size={15} /> Add Custom Material
            </button>
          </div>
        }
      />

      {/* Floating Compare Matrix Bar */}
      {compareList.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {compareList.length} substrate{compareList.length > 1 ? 's' : ''} selected for comparison
          </span>
          <button
            type="button"
            className="btn btn-sm"
            style={{ backgroundColor: '#fff', color: 'var(--primary)', fontWeight: 700 }}
            onClick={handleLaunchCompare}
          >
            Launch Matrix
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 300px', maxWidth: '450px' }}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by polymer name, resin code, or barrier property..."
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterDropdown
            label="Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[
              { label: 'All Categories', value: 'All' },
              { label: 'Polyolefins', value: 'Polyolefins' },
              { label: 'Barrier Films', value: 'Barrier Films' },
              { label: 'Foil & Metalized', value: 'Foil & Metalized Laminates' },
              { label: 'Bio-based & Compostable', value: 'Bio-based & Compostable' },
              { label: 'Speciality MAP Films', value: 'Speciality MAP Films' },
            ]}
          />

          <FilterDropdown
            label="Sustainability"
            value={selectedSustainability}
            onChange={setSelectedSustainability}
            options={[
              { label: 'All Sustainability Types', value: 'All' },
              { label: 'Recyclable Mono-material', value: 'Recyclable Mono-material' },
              { label: 'Bio-based Compostable', value: 'Bio-based Compostable' },
              { label: 'Fibre Hybrid', value: 'Fibre Hybrid' },
              { label: 'Conventional Plastic', value: 'Conventional Plastic' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading packaging substrate library..." />
      ) : filteredMaterials.length === 0 ? (
        searchQuery.trim().length > 0 ? (
          <div
            className="card"
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#f0fdf4',
              border: '1.5px dashed #86efac',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <Sparkles size={24} style={{ color: '#16a34a' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
              Substrate "{searchQuery}" Not Found in Local Database
            </h3>
            <p style={{ color: '#15803d', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
              Would you like Gemini & Groq AI to research and extract ASTM OTR / WVTR permeabilities, layer structure, tensile ratings, and circularity for <strong>"{searchQuery}"</strong>?
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleAiResearch(searchQuery)}
              disabled={isAiResearching}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', fontWeight: 700 }}
            >
              {isAiResearching ? <Loader2 size={16} className="spin-animation" /> : <Sparkles size={16} />}
              <span>{isAiResearching ? `Researching "${searchQuery}" with AI...` : `Research "${searchQuery}" with AI`}</span>
            </button>
          </div>
        ) : (
          <EmptyState
            title="No materials match your filters"
            description="Try broadening your search or resetting category filters."
            action={{
              label: 'Reset Filters',
              onClick: () => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedSustainability('All');
              },
            }}
          />
        )
      ) : (
        <div className="grid-3">
          {filteredMaterials.map((mat) => {
            const isCustom = !SYSTEM_MATERIAL_IDS.has(mat.id);
            return (
              <div key={mat.id} style={{ position: 'relative' }}>
                <MaterialCard
                  material={mat}
                  onViewDetails={(item) => setActiveMaterial(item)}
                  onCompareToggle={(item) => handleCompareToggle(item)}
                  isSelectedForCompare={compareList.includes(mat.id)}
                  onSaveToDb={mat.id.startsWith('ai-mat-') ? handleSaveAiMaterialToDb : undefined}
                />

                {/* Edit / Delete buttons for custom substrates */}
                {isCustom && !mat.id.startsWith('ai-mat-') && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      display: 'flex',
                      gap: '0.35rem',
                      zIndex: 5,
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.2rem 0.4rem', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}
                      onClick={(e) => handleEdit(mat, e)}
                      title="Edit material specifications"
                    >
                      <Edit2 size={12} style={{ color: 'var(--primary)' }} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.2rem 0.4rem', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}
                      onClick={(e) => handleDeletePrompt(mat, e)}
                      title="Delete custom material"
                    >
                      <Trash2 size={12} style={{ color: 'var(--danger-text)' }} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Material Research Modal */}
      {isAiModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAiModalOpen(false)}>
          <div
            className="modal-container"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>AI Substrate Research</h3>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsAiModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                Enter any commercial, experimental, or bio-polymer substrate name (e.g. <em>Polyhydroxyalkanoate, SiOx-Coated PET, Chitosan Film, PVDC-BOPP, PEF Bio-Polyester</em>). Gemini & Groq will synthesize complete barrier metrics, ASTM standards, and circularity ratings.
              </p>

              <div className="form-group">
                <label className="form-label">Substrate / Polymer Name *</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Polyhydroxyalkanoate (PHA) Marine-Biodegradable Film"
                  value={aiModalInput}
                  onChange={(e) => setAiModalInput(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsAiModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAiResearch(aiModalInput)}
                  disabled={isAiResearching || !aiModalInput.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  {isAiResearching ? <Loader2 size={14} className="spin-animation" /> : <Sparkles size={14} />}
                  <span>{isAiResearching ? 'Synthesizing with AI...' : 'Research Substrate'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Material Detail Modal */}
      <MaterialDetailModal
        material={activeMaterial}
        onClose={() => setActiveMaterial(null)}
      />

      {/* Custom Material Form Modal */}
      <MaterialFormModal
        isOpen={isFormOpen}
        materialToEdit={materialToEdit}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSavedMaterial}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteTarget !== null}
        title={`Delete '${deleteTarget?.name}'?`}
        message="Are you sure you want to delete this custom packaging material from the database? This action cannot be undone."
        confirmLabel="Delete Material"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
