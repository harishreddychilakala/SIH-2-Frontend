import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Edit2, Sparkles, Loader2, X } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchInput } from '../components/common/SearchInput';
import { FilterDropdown } from '../components/common/FilterDropdown';
import { CommodityCard } from '../components/commodities/CommodityCard';
import { CommodityDetailModal } from '../components/commodities/CommodityDetailModal';
import { CommodityFormModal } from '../components/commodities/CommodityFormModal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { useToast } from '../components/common/Toast';
import { commodityService } from '../services/commodityService';
import type { Commodity, CommodityCategory } from '../types';

const SYSTEM_COMMODITY_IDS = new Set(
  Array.from({ length: 29 }, (_, i) => `comm-${i + 1}`)
);

export const CommoditiesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [filteredCommodities, setFilteredCommodities] = useState<Commodity[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'moisture' | 'shelfLife'>('name');
  const [activeCommodity, setActiveCommodity] = useState<Commodity | null>(null);

  // AI Research state
  const [isAiResearching, setIsAiResearching] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalInput, setAiModalInput] = useState('');
  const [aiModalCategory, setAiModalCategory] = useState<string>('Fresh Produce');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [commodityToEdit, setCommodityToEdit] = useState<Commodity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Commodity | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await commodityService.getAll();
      setCommodities(list);
    } catch (err: any) {
      showToast(err.message || 'Failed to load commodities from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = [...commodities];

    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.scientificName && c.scientificName.toLowerCase().includes(q)) ||
          c.description.toLowerCase().includes(q) ||
          c.primarySpoilageRisks.some((r) => r.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'moisture') {
      result.sort((a, b) => b.moisturePercent.typical - a.moisturePercent.typical);
    } else if (sortBy === 'shelfLife') {
      result.sort(
        (a, b) => a.recommendedStorage.typicalShelfLifeDays - b.recommendedStorage.typicalShelfLifeDays
      );
    }

    setFilteredCommodities(result);
  }, [searchQuery, selectedCategory, sortBy, commodities]);

  const handleCreateNew = () => {
    setCommodityToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (comm: Commodity, e: React.MouseEvent) => {
    e.stopPropagation();
    setCommodityToEdit(comm);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (comm: Commodity, e: React.MouseEvent) => {
    e.stopPropagation();
    if (SYSTEM_COMMODITY_IDS.has(comm.id)) {
      showToast('Predefined benchmark commodities cannot be deleted.', 'info');
      return;
    }
    setDeleteTarget(comm);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await commodityService.delete(deleteTarget.id);
      setCommodities((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showToast(`Commodity '${deleteTarget.name}' deleted successfully.`, 'info');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete commodity.', 'error');
    }
  };

  const handleSavedCommodity = (saved: Commodity) => {
    setCommodities((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      if (exists) {
        return prev.map((c) => (c.id === saved.id ? saved : c));
      }
      return [saved, ...prev];
    });
    showToast(`Commodity '${saved.name}' saved to database.`, 'success');
  };

  // Dual-AI research food matrix specifications online
  const handleAiResearch = async (queryParam?: string, categoryParam?: string) => {
    const q = (queryParam || aiModalInput || searchQuery).trim();
    if (!q) {
      showToast('Please provide a food commodity name to research.', 'info');
      return;
    }

    const cat = categoryParam || (selectedCategory !== 'All' ? selectedCategory : aiModalCategory);
    setIsAiResearching(true);
    try {
      const researched = await commodityService.researchCommodityWithAI(q, cat);
      if (researched) {
        setCommodities((prev) => {
          const already = prev.find((c) => c.name.toLowerCase() === researched.name.toLowerCase());
          if (already) return prev;
          return [researched, ...prev];
        });
        showToast(`✨ Gemini & Groq researched post-harvest specs for "${researched.name}"!`, 'success');
        setIsAiModalOpen(false);
        setAiModalInput('');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to research food commodity via AI.', 'error');
    } finally {
      setIsAiResearching(false);
    }
  };

  // Save AI researched commodity permanently to database catalog
  const handleSaveAiCommodityToDb = async (comm: Commodity) => {
    try {
      const payload: Omit<Commodity, 'id'> = {
        name: comm.name,
        scientificName: comm.scientificName,
        category: comm.category as CommodityCategory,
        description: comm.description,
        moisturePercent: comm.moisturePercent,
        fatOilPercent: comm.fatOilPercent,
        typicalPh: comm.typicalPh,
        respirationRate: comm.respirationRate,
        ethyleneSensitivity: comm.ethyleneSensitivity,
        recommendedStorage: comm.recommendedStorage,
        primarySpoilageRisks: comm.primarySpoilageRisks,
        keyPackagingConsiderations: comm.keyPackagingConsiderations,
        isVerified: false,
      };

      const saved = await commodityService.create(payload);
      setCommodities((prev) => prev.map((c) => (c.id === comm.id ? saved : c)));
      showToast(`Food Commodity '${saved.name}' permanently saved to catalog database!`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to save commodity to catalog.', 'error');
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <PageHeader
        title="Food Commodities Scientific Catalog"
        description="Comprehensive post-harvest physicochemical database for fresh produce, grains, fats, dairy, and marine matrixes."
        badgeText={`${commodities.length} Food Matrixes Available`}
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
              title="Search and synthesize physicochemical properties for any unlisted food commodity using Gemini & Groq"
            >
              <Sparkles size={15} /> AI Matrix Research
            </button>

            <button type="button" className="btn btn-primary btn-sm" onClick={handleCreateNew}>
              <Plus size={15} /> Add Custom Commodity
            </button>
          </div>
        }
      />

      {/* Search, Filter & Sort Toolbar */}
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
        <div style={{ flex: '1 1 300px', maxWidth: '420px' }}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search food by name, Latin binomial, or spoilage factor..."
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterDropdown
            label="Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[
              { label: 'All Food Categories', value: 'All' },
              { label: 'Fresh Produce', value: 'Fresh Produce' },
              { label: 'Dairy & Processed', value: 'Dairy & Processed' },
              { label: 'Meat & Marine', value: 'Meat & Marine' },
              { label: 'Fat-Rich & Oils', value: 'Fat-Rich & Oils' },
              { label: 'Dry Grains & Pulses', value: 'Dry Grains & Pulses' },
              { label: 'Bakery & Confectionery', value: 'Bakery & Confectionery' },
              { label: 'Noodles & Pasta', value: 'Noodles & Pasta' },
            ]}
          />

          <FilterDropdown
            label="Sort By"
            value={sortBy}
            onChange={(val) => setSortBy(val as any)}
            options={[
              { label: 'Alphabetical (A-Z)', value: 'name' },
              { label: 'Moisture Content (High-Low)', value: 'moisture' },
              { label: 'Shelf Life (Shortest First)', value: 'shelfLife' },
            ]}
          />
        </div>
      </div>

      {/* Grid of Commodity Cards or AI Fallback Prompt */}
      {loading ? (
        <LoadingState message="Loading food commodities from database..." />
      ) : filteredCommodities.length === 0 ? (
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
              Food Commodity "{searchQuery}" Not Found in Local Database
            </h3>
            <p style={{ color: '#15803d', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
              Would you like Gemini & Groq AI to research post-harvest respiration, moisture %, lipid oxidation risks, and storage conditions for <strong>"{searchQuery}"</strong> online?
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
            title="No commodities match your criteria"
            description="Try clearing your search query or switching to 'All Food Categories'."
            action={{
              label: 'Reset Filters',
              onClick: () => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSortBy('name');
              },
            }}
          />
        )
      ) : (
        <div className="grid-3">
          {filteredCommodities.map((comm) => {
            const isCustom = !SYSTEM_COMMODITY_IDS.has(comm.id) && !comm.id.startsWith('ai-comm-');
            return (
              <div key={comm.id} style={{ position: 'relative' }}>
                <CommodityCard
                  commodity={comm}
                  onViewDetails={(item) => setActiveCommodity(item)}
                  onSaveAiCommodity={comm.id.startsWith('ai-comm-') ? handleSaveAiCommodityToDb : undefined}
                />

                {/* Edit / Delete overlay buttons for custom commodities */}
                {isCustom && (
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
                      onClick={(e) => handleEdit(comm, e)}
                      title="Edit commodity properties"
                    >
                      <Edit2 size={12} style={{ color: 'var(--primary)' }} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.2rem 0.4rem', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}
                      onClick={(e) => handleDeletePrompt(comm, e)}
                      title="Delete custom commodity"
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

      {/* On-Demand Dual-AI Food Matrix Research Modal */}
      {isAiModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
          onClick={() => !isAiResearching && setIsAiModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '1.75rem',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} style={{ color: '#16a34a' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  AI Food Science Matrix Research
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => !isAiResearching && setIsAiModalOpen(false)}
                style={{ padding: '0.35rem' }}
                disabled={isAiResearching}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Enter any food commodity, produce variety, specialty cheese, exotic fruit, or processed food.
              Gemini and Groq will retrieve its physicochemical properties, respiration rate, and packaging directives.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAiResearch(aiModalInput, aiModalCategory);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className="form-group">
                <label className="form-label">Food Commodity Name *</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. French Green Beans, Dragonfruit, Oat Milk Powder, Smoked Salmon"
                  value={aiModalInput}
                  onChange={(e) => setAiModalInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Category</label>
                <select
                  className="select-control"
                  value={aiModalCategory}
                  onChange={(e) => setAiModalCategory(e.target.value)}
                >
                  <option value="Fresh Produce">Fresh Produce</option>
                  <option value="Dairy & Processed">Dairy & Processed</option>
                  <option value="Meat & Marine">Meat & Marine</option>
                  <option value="Fat-Rich & Oils">Fat-Rich & Oils</option>
                  <option value="Dry Grains & Pulses">Dry Grains & Pulses</option>
                  <option value="Bakery & Confectionery">Bakery & Confectionery</option>
                  <option value="Noodles & Pasta">Noodles & Pasta</option>
                  <option value="Other Processed Foods">Other Processed Foods</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsAiModalOpen(false)}
                  disabled={isAiResearching}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isAiResearching || !aiModalInput.trim()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {isAiResearching ? <Loader2 size={14} className="spin-animation" /> : <Sparkles size={14} />}
                  <span>{isAiResearching ? 'Synthesizing with AI...' : 'Research & Load Matrix'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Commodity Detail Modal */}
      <CommodityDetailModal
        commodity={activeCommodity}
        onClose={() => setActiveCommodity(null)}
      />

      {/* Add / Edit Form Modal */}
      <CommodityFormModal
        isOpen={isFormOpen}
        commodityToEdit={commodityToEdit}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSavedCommodity}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteTarget !== null}
        title={`Delete '${deleteTarget?.name}'?`}
        message="Are you sure you want to delete this custom food commodity from the database? This cannot be undone."
        confirmLabel="Delete Commodity"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

