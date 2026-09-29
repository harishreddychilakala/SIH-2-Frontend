import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Info,
  RotateCcw,
  HelpCircle,
  X,
  Check,
  Plus,
  Layers,
  Shield,
  FileText,
  Leaf,
  Wind,
  Package,
  SlidersHorizontal,
  Eye,
  AlertCircle,
  LayoutGrid,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { MaterialComparisonTable } from '../components/materials/MaterialComparisonTable';
import { PropertyBar } from '../components/materials/PropertyBar';
import { MaterialDetailModal } from '../components/materials/MaterialDetailModal';
import { FilterDropdown } from '../components/common/FilterDropdown';
import { SearchInput } from '../components/common/SearchInput';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { Badge } from '../components/common/Badge';
import { materialService } from '../services/materialService';
import type { PackagingMaterial, MaterialCategoryItem } from '../types';

// Category icon mapper for visual distinction
const getCategoryIcon = (categoryName: string) => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('polyolefin')) return <Layers size={15} />;
  if (lower.includes('polyester') || lower.includes('pet')) return <Package size={15} />;
  if (lower.includes('aluminium') || lower.includes('metal') || lower.includes('foil')) return <Shield size={15} />;
  if (lower.includes('barrier')) return <Wind size={15} />;
  if (lower.includes('paper') || lower.includes('fibre')) return <FileText size={15} />;
  if (lower.includes('bio') || lower.includes('compost')) return <Leaf size={15} />;
  if (lower.includes('special')) return <Sparkles size={15} />;
  return <LayoutGrid size={15} />;
};

export const ComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Data state
  const [allMaterials, setAllMaterials] = useState<PackagingMaterial[]>([]);
  const [categories, setCategories] = useState<MaterialCategoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Category and filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('Polyolefin Films');
  const [searchQuery, setSearchQuery] = useState('');
  const [sustainabilityFilter, setSustainabilityFilter] = useState('All');

  // Modal inspection state
  const [inspectMaterial, setInspectMaterial] = useState<PackagingMaterial | null>(null);

  // Load materials and dynamic categories from backend
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [matsList, catsList] = await Promise.all([
          materialService.getAll(),
          materialService.getCategories().catch(() => []),
        ]);

        setAllMaterials(matsList);
        setCategories(catsList);

        // Check query params for initial material comparisons
        const m1 = searchParams.get('mat1');
        const m2 = searchParams.get('mat2');
        const m3 = searchParams.get('mat3');

        const initialIds: string[] = [];
        if (m1 && matsList.some((m) => m.id === m1)) initialIds.push(m1);
        if (m2 && matsList.some((m) => m.id === m2)) initialIds.push(m2);
        if (m3 && matsList.some((m) => m.id === m3)) initialIds.push(m3);

        if (initialIds.length >= 2) {
          setSelectedIds(initialIds);
        } else if (matsList.length >= 3) {
          // Preselect 3 diverse substrates across categories as an engaging default
          setSelectedIds([matsList[0].id, matsList[2].id, matsList[4].id]);
        } else if (matsList.length > 0) {
          setSelectedIds(matsList.slice(0, 2).map((m) => m.id));
        }

        // Default to first category if available
        if (catsList.length > 0) {
          setSelectedCategory(catsList[0].name);
        }
      } catch (err) {
        console.error('Failed to load materials comparator data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [searchParams]);

  // Total count across all categories
  const totalSubstrateCount = useMemo(() => {
    return allMaterials.length;
  }, [allMaterials]);

  // Selected material objects (preserved across category switching)
  const selectedMaterials = useMemo(() => {
    return selectedIds
      .map((id) => allMaterials.find((m) => m.id === id))
      .filter((m): m is PackagingMaterial => Boolean(m));
  }, [selectedIds, allMaterials]);

  // Filter substrates belonging to currently selected category + search + sustainability
  const filteredSubstrates = useMemo(() => {
    return allMaterials.filter((m) => {
      // 1. Category Filter
      if (selectedCategory !== 'All') {
        const matCatLower = m.category.toLowerCase();
        const selCatLower = selectedCategory.toLowerCase();

        // Match category exact or canonical group
        const matchesCategory =
          matCatLower === selCatLower ||
          (selCatLower.includes('polyolefin') && matCatLower.includes('polyolefin')) ||
          (selCatLower.includes('polyester') && (matCatLower.includes('polyester') || matCatLower.includes('pet'))) ||
          (selCatLower.includes('aluminium') && (matCatLower.includes('aluminium') || matCatLower.includes('metal') || matCatLower.includes('foil'))) ||
          (selCatLower.includes('barrier') && matCatLower.includes('barrier')) ||
          (selCatLower.includes('paper') && (matCatLower.includes('paper') || matCatLower.includes('fibre'))) ||
          (selCatLower.includes('bio') && (matCatLower.includes('bio') || matCatLower.includes('compost'))) ||
          (selCatLower.includes('special') && matCatLower.includes('special'));

        if (!matchesCategory) return false;
      }

      // 2. Sustainability Filter
      if (sustainabilityFilter !== 'All' && m.sustainability.type !== sustainabilityFilter) {
        return false;
      }

      // 3. Search Query Filter (name, code, description, applications, layers)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesCode = m.code.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesLayers = m.layerStructure ? m.layerStructure.toLowerCase().includes(q) : false;
        const matchesApps = m.typicalApplications.some((a) => a.toLowerCase().includes(q));

        if (!matchesName && !matchesCode && !matchesDesc && !matchesLayers && !matchesApps) {
          return false;
        }
      }

      return true;
    });
  }, [allMaterials, selectedCategory, sustainabilityFilter, searchQuery]);

  // Toggle selection with a strict maximum limit of 4
  const handleToggleMaterial = (id: string) => {
    if (selectedIds.includes(id)) {
      // Remove
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      // Add if under limit
      if (selectedIds.length >= 4) {
        return; // Limit of 4 reached
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Remove directly from persistent summary or table
  const handleRemoveMaterial = (id: string) => {
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  // Reset comparison to default selection
  const handleResetComparison = () => {
    if (allMaterials.length >= 3) {
      setSelectedIds([allMaterials[0].id, allMaterials[2].id, allMaterials[4].id]);
    }
    setSearchQuery('');
    setSustainabilityFilter('All');
    if (categories.length > 0) {
      setSelectedCategory(categories[0].name);
    }
  };

  // Clear all selections
  const handleClearAllSelections = () => {
    setSelectedIds([]);
  };

  // Clear active filters within category
  const handleClearFilters = () => {
    setSearchQuery('');
    setSustainabilityFilter('All');
  };

  // Calculation for OTR visualization percentage
  const getOTRScore = (val: number | null) => {
    if (val === null) return 0;
    if (val <= 1) return 98;
    if (val <= 20) return 80;
    if (val <= 400) return 55;
    if (val <= 2000) return 30;
    return 12;
  };

  // Calculation for WVTR visualization percentage
  const getWVTRScore = (val: number | null) => {
    if (val === null) return 0;
    if (val <= 0.1) return 98;
    if (val <= 2) return 80;
    if (val <= 10) return 55;
    if (val <= 30) return 35;
    return 15;
  };

  // Active category object
  const activeCategoryInfo = categories.find((c) => c.name === selectedCategory);

  if (loading) {
    return <LoadingState message="Loading dynamic substrate library & category catalog..." />;
  }

  return (
    <div style={{ paddingBottom: '3.5rem' }}>
      <PageHeader
        title="Packaging Material Technical Comparator"
        description="Dynamic category-based substrate benchmark comparator. Select up to 4 materials across packaging categories to evaluate gas barriers (ASTM D3985 / ASTM F1249), gauge thickness, and circularity."
        badgeText="Dynamic Category Comparator"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetComparison}
            >
              <RotateCcw size={14} /> Reset Defaults
            </button>
            <Link to="/recommend" className="btn btn-primary btn-sm">
              <Sparkles size={14} /> Evaluate for Food Commodity
            </Link>
          </div>
        }
      />

      {/* Contextual Suitability Guidance Banner */}
      <div className="alert-box alert-info" style={{ marginBottom: '1.25rem' }}>
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
          <strong>Barrier Selection Principle:</strong> High barrier (low OTR/WVTR) is essential for fats and dry bakery, while respiring fresh produce requires tailored permeability or micro-perforated substrates. You can select up to 4 substrates from different categories below to contrast performance side-by-side.
        </div>
      </div>

      {/* ── PERSISTENT SELECTION SUMMARY PANEL (Requirement 5 & 8) ── */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          padding: '1.15rem 1.25rem',
          border: selectedIds.length === 4 ? '1px solid var(--primary)' : '1px solid var(--border)',
          backgroundColor: selectedIds.length > 0 ? 'var(--bg-surface)' : 'var(--bg-app)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: selectedMaterials.length > 0 ? '0.85rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <SlidersHorizontal size={17} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Selected Substrates for Comparison
              </h3>
            </div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: selectedIds.length === 4 ? 'var(--primary)' : 'var(--primary-light)',
                color: selectedIds.length === 4 ? '#ffffff' : 'var(--primary)',
                border: '1px solid var(--primary-border)',
              }}
            >
              {selectedIds.length}/4 Selected
            </span>

            {selectedIds.length === 4 && (
              <span style={{ fontSize: '0.75rem', color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                <AlertCircle size={14} /> Maximum limit of 4 substrates reached.
              </span>
            )}
          </div>

          {selectedMaterials.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleClearAllSelections}
              style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
            >
              Clear All ({selectedIds.length})
            </button>
          )}
        </div>

        {/* Selected Substrate Chips */}
        {selectedMaterials.length === 0 ? (
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
            No substrates currently selected. Click <strong>+ Add</strong> on any material card below to begin comparing. Selections persist as you browse different categories.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
            {selectedMaterials.map((mat) => (
              <div
                key={mat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  border: '1px solid var(--primary-border)',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {mat.name}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {mat.category} · {mat.code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(mat.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '0.2rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--transition-fast)',
                  }}
                  title={`Remove ${mat.name} from comparison`}
                  aria-label={`Remove ${mat.name}`}
                >
                  <X size={15} style={{ color: 'var(--danger-text)' }} />
                </button>
              </div>
            ))}

            {selectedMaterials.length < 2 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '0.25rem' }}>
                (Select at least 2 substrates to unlock the technical comparison matrix below)
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── 1. DYNAMIC CATEGORY SELECTION INTERFACE (Requirement 1 & 8) ── */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Packaging Substrate Categories
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Select a category to browse specific technical substrates. Substrates selected from any category stay active in your comparator.
              </p>
            </div>

            {/* Quick Category Jump Dropdown for responsive accessibility */}
            <div style={{ minWidth: '220px' }}>
              <select
                className="input-control"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem', height: 'auto' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter substrates by packaging category"
              >
                <option value="All">All Categories ({totalSubstrateCount})</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modern Horizontal Category Tab Bar */}
        <div
          role="tablist"
          aria-label="Packaging substrate categories"
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            marginBottom: '1rem',
            scrollbarWidth: 'thin',
          }}
        >
          {/* All Categories Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'All'}
            onClick={() => setSelectedCategory('All')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: selectedCategory === 'All' ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: selectedCategory === 'All' ? 'var(--primary-light)' : 'var(--bg-app)',
              color: selectedCategory === 'All' ? 'var(--primary)' : 'var(--text-main)',
              fontWeight: selectedCategory === 'All' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
            }}
          >
            <LayoutGrid size={15} style={{ color: selectedCategory === 'All' ? 'var(--primary)' : 'var(--text-muted)' }} />
            <span>All Categories</span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: selectedCategory === 'All' ? 'var(--primary)' : 'var(--border)',
                color: selectedCategory === 'All' ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              {totalSubstrateCount}
            </span>
          </button>

          {/* Dynamic Database Categories */}
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-app)',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {getCategoryIcon(cat.name)}
                </span>
                <span>{cat.name}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'var(--primary)' : 'var(--border)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category Description & Filter Toolbar (Requirement 3) */}
        <div
          style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {selectedCategory === 'All' ? 'All Packaging Substrates' : selectedCategory}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ({filteredSubstrates.length} displayed)
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              {selectedCategory === 'All'
                ? 'Displaying all packaging materials across the library. Use category tabs above to focus.'
                : activeCategoryInfo?.description || `Browsing substrates in ${selectedCategory}.`}
            </p>
          </div>

          {/* Search within Category & Sustainability Filter */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ minWidth: '220px' }}>
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={
                  selectedCategory === 'All'
                    ? 'Search all substrates...'
                    : `Search within ${selectedCategory}...`
                }
              />
            </div>

            <FilterDropdown
              label="Sustainability"
              value={sustainabilityFilter}
              onChange={setSustainabilityFilter}
              options={[
                { label: 'All Sustainability Types', value: 'All' },
                { label: 'Recyclable Mono-material', value: 'Recyclable Mono-material' },
                { label: 'Bio-based Compostable', value: 'Bio-based Compostable' },
                { label: 'Fibre Hybrid', value: 'Fibre Hybrid' },
                { label: 'Conventional Plastic', value: 'Conventional Plastic' },
              ]}
            />

            {(searchQuery.trim() || sustainabilityFilter !== 'All') && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClearFilters}
                style={{ fontSize: '0.75rem', color: 'var(--danger-text)' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ── 2. DYNAMIC SUBSTRATE CARDS GRID (Requirement 2 & 4) ── */}
        {filteredSubstrates.length === 0 ? (
          <EmptyState
            title={`No substrates found in ${selectedCategory}`}
            description={
              searchQuery
                ? `No materials matched your search query "${searchQuery}" with the active filters. Try broadening your terms or clear filters.`
                : 'There are currently no substrates cataloged under this criteria.'
            }
            action={{
              label: 'Reset Search Filters',
              onClick: handleClearFilters,
            }}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {filteredSubstrates.map((mat) => {
              const isSelected = selectedIds.includes(mat.id);
              const isLimitReached = selectedIds.length >= 4 && !isSelected;

              return (
                <div
                  key={mat.id}
                  style={{
                    padding: '1rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected
                      ? '2px solid var(--primary)'
                      : isLimitReached
                      ? '1px dashed var(--border)'
                      : '1px solid var(--border)',
                    backgroundColor: isSelected
                      ? 'var(--primary-light)'
                      : 'var(--bg-surface)',
                    boxShadow: isSelected
                      ? '0 2px 6px rgba(18, 84, 56, 0.12)'
                      : '0 1px 3px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)',
                    opacity: isLimitReached ? 0.75 : 1,
                  }}
                >
                  {/* Card Header: Category + Code */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: 'var(--primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {mat.category}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 600,
                        }}
                      >
                        {mat.code}
                      </span>
                    </div>

                    {/* Substrate Name */}
                    <div
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        marginBottom: '0.35rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {mat.name}
                    </div>

                    {/* Short Description (2-line clamped) */}
                    <p
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--text-body)',
                        lineHeight: 1.45,
                        margin: '0 0 0.75rem 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                      title={mat.description}
                    >
                      {mat.description}
                    </p>

                    {/* Quick Metric Chips: OTR, WVTR, Gauge */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          color: 'var(--text-muted)',
                        }}
                        title={`Oxygen Transmission Rate: ${mat.otr.value !== null ? `${mat.otr.value} cc` : 'Breathable'}`}
                      >
                        OTR: <strong>{mat.otr.value !== null ? `${mat.otr.value}` : 'Breathable'}</strong>
                      </span>

                      <span
                        style={{
                          fontSize: '0.68rem',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          color: 'var(--text-muted)',
                        }}
                        title={`Water Vapor Transmission Rate: ${mat.wvtr.value !== null ? `${mat.wvtr.value} g` : 'Variable'}`}
                      >
                        WVTR: <strong>{mat.wvtr.value !== null ? `${mat.wvtr.value}` : 'N/A'}</strong>
                      </span>

                      <span
                        style={{
                          fontSize: '0.68rem',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          color: 'var(--text-muted)',
                        }}
                        title={`Typical gauge: ${mat.thicknessRangeMicrons.typical} µm`}
                      >
                        Gauge: <strong>{mat.thicknessRangeMicrons.typical}µm</strong>
                      </span>
                    </div>
                  </div>

                  {/* Card Actions: View Specs + Add/Selected Button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setInspectMaterial(mat)}
                      className="btn btn-ghost btn-sm"
                      style={{
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                      title="Inspect full engineering ASTM specifications"
                    >
                      <Eye size={13} />
                      <span>Specs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleMaterial(mat.id)}
                      disabled={isLimitReached}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: isLimitReached ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        border: isSelected
                          ? '1px solid var(--primary)'
                          : isLimitReached
                          ? '1px solid var(--border)'
                          : '1px solid var(--primary-border)',
                        backgroundColor: isSelected
                          ? 'var(--primary)'
                          : isLimitReached
                          ? 'var(--bg-app)'
                          : 'transparent',
                        color: isSelected
                          ? '#ffffff'
                          : isLimitReached
                          ? 'var(--text-subtle)'
                          : 'var(--primary)',
                        transition: 'all var(--transition-fast)',
                      }}
                      title={
                        isSelected
                          ? 'Remove from comparison'
                          : isLimitReached
                          ? 'Maximum 4 substrates can be selected. Remove an existing substrate to add this one.'
                          : 'Add to comparison matrix'
                      }
                      aria-pressed={isSelected}
                    >
                      {isSelected ? (
                        <>
                          <Check size={13} />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <Plus size={13} />
                          <span>{isLimitReached ? 'Limit (4)' : 'Add'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 6. COMPARISON MATRIX INTEGRATION (Requirement 6) ── */}
      {/* Visual Barrier & Gauge Differential Bars */}
      {selectedMaterials.length >= 2 && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Visual Barrier & Thickness Differential Comparison
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Comparing {selectedMaterials.length} substrates across categories: {selectedMaterials.map((m) => m.name).join(' vs ')}.
              </p>
            </div>
            <Badge variant="teal">{selectedMaterials.length} Active in Comparator</Badge>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`,
              gap: '1.25rem',
            }}
          >
            {selectedMaterials.map((mat) => (
              <div
                key={mat.id}
                style={{
                  padding: '1.15rem',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.25 }}>
                    {mat.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(mat.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.2rem', color: 'var(--text-subtle)' }}
                    title="Remove from comparison"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.85rem', fontFamily: 'JetBrains Mono, monospace' }}>
                  {mat.category} · {mat.code}
                </div>

                <PropertyBar
                  label="Oxygen Barrier (OTR)"
                  valueText={mat.otr.value !== null ? `${mat.otr.value} cc` : 'Variable (Breathable)'}
                  percentage={getOTRScore(mat.otr.value)}
                  helpText={mat.otr.level}
                />

                <PropertyBar
                  label="Moisture Barrier (WVTR)"
                  valueText={mat.wvtr.value !== null ? `${mat.wvtr.value} g` : 'Variable'}
                  percentage={getWVTRScore(mat.wvtr.value)}
                  color="var(--teal-600)"
                  helpText={mat.wvtr.level}
                />

                <PropertyBar
                  label="Film Thickness (Gauge)"
                  valueText={`${mat.thicknessRangeMicrons.typical} µm`}
                  percentage={Math.min(100, (mat.thicknessRangeMicrons.typical / 120) * 100)}
                  color="#64748b"
                  helpText={`Range: ${mat.thicknessRangeMicrons.min}–${mat.thicknessRangeMicrons.max} µm`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Technical Comparison Table */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Detailed Technical Comparison Matrix
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              Side-by-side ASTM engineering specifications, seal performance, pricing, and circularity profiles.
            </p>
          </div>
          {selectedMaterials.length > 0 && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing {selectedMaterials.length} of 4 maximum
            </span>
          )}
        </div>

        {selectedMaterials.length === 0 ? (
          <EmptyState
            title="No materials selected for comparison"
            description="Select at least one packaging material from the category browser above to view complete technical specifications."
          />
        ) : (
          <MaterialComparisonTable
            materials={selectedMaterials}
            onRemoveMaterial={(id) => handleRemoveMaterial(id)}
          />
        )}
      </div>

      {/* Technical Parameter Guide Accordions */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={18} style={{ color: 'var(--primary)' }} />
          Packaging Engineering Parameter Reference
        </h3>

        <div className="grid-3" style={{ gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>
              Oxygen Transmission Rate (OTR)
            </strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
              Measured in <code>cc/m²·24h·atm</code> via <strong>ASTM D3985</strong>. Evaluates the volume of oxygen gas permeating through the film per day. Essential for preventing lipid oxidation in nuts and spoilage in seafood.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>
              Water Vapor Transmission Rate (WVTR)
            </strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
              Measured in <code>g/m²·24h</code> via <strong>ASTM F1249</strong> at 38°C, 90% RH. Quantifies water vapor barrier efficiency. Critical for preventing soggy crackers or moisture loss in fresh produce.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>
              Circularity & Resin Identification (RIC)
            </strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
              Single-polymer polyolefins (RIC 2 HDPE, RIC 4 LDPE, RIC 5 PP) are widely curbside recyclable. Multi-layer barrier laminates with EVOH or aluminum are designated RIC 7 (Specialized streams).
            </p>
          </div>
        </div>
      </div>

      {/* Complete Specification Inspection Modal */}
      {inspectMaterial && (
        <MaterialDetailModal
          material={inspectMaterial}
          onClose={() => setInspectMaterial(null)}
        />
      )}
    </div>
  );
};
