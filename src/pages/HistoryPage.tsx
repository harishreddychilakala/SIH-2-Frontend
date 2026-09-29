import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  Trash2,
  Sparkles,
  Download,
  RotateCcw,
  FileJson,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchInput } from '../components/common/SearchInput';
import { FilterDropdown } from '../components/common/FilterDropdown';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { useToast } from '../components/common/Toast';
import { recommendationService } from '../services/recommendationService';
import type { RecommendationHistoryItem } from '../types';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [costFilter, setCostFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'shelfLife'>('newest');
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        const list = await recommendationService.getHistory();
        setHistory(list);
      } catch (err: any) {
        showToast('Failed to load recommendation history from database.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [showToast]);

  const filteredHistory = useMemo(() => {
    let result = [...history];

    if (categoryFilter !== 'All') {
      result = result.filter((h) => h.category === categoryFilter);
    }

    if (costFilter !== 'All') {
      result = result.filter((h) => h.costTier?.toLowerCase().includes(costFilter.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.commodityName.toLowerCase().includes(q) ||
          h.primaryMaterialName.toLowerCase().includes(q) ||
          h.storageConditionSummary.toLowerCase().includes(q) ||
          h.category.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return (b.id || '').localeCompare(a.id || '');
      if (sortBy === 'oldest') return (a.id || '').localeCompare(b.id || '');
      if (sortBy === 'name') return a.commodityName.localeCompare(b.commodityName);
      if (sortBy === 'shelfLife') return (a.shelfLifeTarget || '').localeCompare(b.shelfLifeTarget || '');
      return 0;
    });

    return result;
  }, [history, categoryFilter, costFilter, searchQuery, sortBy]);

  // Derived statistics
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const categories = new Set(history.map((h) => h.category));
    const materialCounts: Record<string, number> = {};
    history.forEach((h) => {
      materialCounts[h.primaryMaterialName] = (materialCounts[h.primaryMaterialName] || 0) + 1;
    });
    const topMaterial = Object.entries(materialCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      total: history.length,
      categoriesCount: categories.size,
      topMaterial,
    };
  }, [history]);

  const handleDeleteItem = async () => {
    if (!deleteTargetId) return;
    try {
      await recommendationService.deleteHistoryItem(deleteTargetId);
      setHistory((prev) => prev.filter((item) => item.id !== deleteTargetId));
      setDeleteTargetId(null);
      showToast('Recommendation record removed from Neon database.', 'info');
    } catch (err: any) {
      showToast('Error removing record: ' + err.message, 'error');
    }
  };

  const handleClearAll = async () => {
    try {
      await recommendationService.clearAllHistory();
      setHistory([]);
      setShowClearAllDialog(false);
      showToast('All recommendation history erased from database.', 'info');
    } catch (err: any) {
      showToast('Error clearing history: ' + err.message, 'error');
    }
  };

  const handleExportSingleJSON = async (id: string, commodityName: string) => {
    try {
      const fullDoc = await recommendationService.getById(id);
      if (!fullDoc) {
        showToast('Could not fetch full dossier for export.', 'error');
        return;
      }
      const blob = new Blob([JSON.stringify(fullDoc, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PackSmart_Evaluation_${commodityName.replace(/\s+/g, '_')}_${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported dossier for ${commodityName}.`, 'success');
    } catch (err: any) {
      showToast('Export failed: ' + err.message, 'error');
    }
  };

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return;
    const headers = ['ID', 'Date', 'Commodity', 'Category', 'Storage Conditions', 'Recommended Substrate', 'Substrate Category', 'Target Shelf Life', 'Cost Tier', 'Sustainability Tier'];
    const rows = filteredHistory.map((h) => [
      `"${h.id}"`,
      `"${h.date}"`,
      `"${h.commodityName.replace(/"/g, '""')}"`,
      `"${h.category}"`,
      `"${h.storageConditionSummary.replace(/"/g, '""')}"`,
      `"${h.primaryMaterialName.replace(/"/g, '""')}"`,
      `"${h.materialCategory || 'Standard'}"`,
      `"${h.shelfLifeTarget}"`,
      `"${h.costTier}"`,
      `"${h.sustainabilityTier || 'Standard'}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PackSmart_Recommendations_Ledger_${Date.now()}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredHistory.length} evaluations as CSV.`, 'success');
  };

  const handleExportAllJSON = () => {
    if (filteredHistory.length === 0) return;
    const blob = new Blob([JSON.stringify(filteredHistory, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PackSmart_Evaluations_History_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredHistory.length} history records as JSON.`, 'success');
  };

  const handleReevaluate = async (item: RecommendationHistoryItem) => {
    try {
      const fullDoc = await recommendationService.getById(item.id);
      if (fullDoc && fullDoc.input) {
        navigate('/recommend', { state: { prefillInput: fullDoc.input } });
      } else {
        navigate('/recommend');
      }
    } catch {
      navigate('/recommend');
    }
  };

  return (
    <div>
      <PageHeader
        title="Recommendation History"
        description="Audit ledger of past food packaging barrier evaluations, technical specifications, and MAP gas recommendations saved in Neon PostgreSQL."
        badgeText={`${history.length} Saved Evaluations`}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {history.length > 0 && (
              <>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportCSV} title="Export filtered records to CSV">
                  <Download size={14} /> Export CSV
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportAllJSON} title="Export records to JSON">
                  <FileJson size={14} /> Export JSON
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setShowClearAllDialog(true)}
                  title="Clear all saved history"
                >
                  <Trash2 size={14} /> Clear Ledger
                </button>
              </>
            )}
            <Link to="/recommend" className="btn btn-primary btn-sm">
              <Sparkles size={14} /> New Evaluation
            </Link>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.total}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evaluations Recorded</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.categoriesCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Food Categories Covered</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }} title={stats.topMaterial}>
                {stats.topMaterial}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Leading Recommended Substrate</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
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
        <div style={{ flex: '1 1 280px', maxWidth: '400px' }}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by commodity, substrate, or regime..."
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: 'All Categories', value: 'All' },
              { label: 'Fresh Produce', value: 'Fresh Produce' },
              { label: 'Dairy & Processed', value: 'Dairy & Processed' },
              { label: 'Meat & Marine', value: 'Meat & Marine' },
              { label: 'Bakery', value: 'Bakery' },
              { label: 'Dry Grains & Pulses', value: 'Dry Grains & Pulses' },
              { label: 'Fat-Rich & Oils', value: 'Fat-Rich & Oils' },
            ]}
          />

          <FilterDropdown
            label="Cost Tier"
            value={costFilter}
            onChange={setCostFilter}
            options={[
              { label: 'All Tiers', value: 'All' },
              { label: 'Low Cost (₹120-220/kg)', value: 'Low' },
              { label: 'Moderate (₹220-360/kg)', value: 'Moderate' },
              { label: 'High / Premium (₹350-550/kg)', value: 'High' },
            ]}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              className="select-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name">Sort: Commodity A-Z</option>
              <option value="shelfLife">Sort: Target Shelf Life</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Connecting to database and retrieving evaluation history..." />
      ) : filteredHistory.length === 0 ? (
        <EmptyState
          title={history.length === 0 ? 'No Saved Evaluations' : 'No matching evaluations found'}
          description={
            history.length === 0
              ? 'You have not generated any packaging barrier evaluations yet. Run an evaluation to benchmark substrate barrier kinetics.'
              : 'Try adjusting your search criteria or resetting the category and cost filters.'
          }
          action={
            history.length === 0
              ? {
                  label: 'Generate First Evaluation',
                  onClick: () => navigate('/recommend'),
                }
              : {
                  label: 'Reset Filters',
                  onClick: () => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                    setCostFilter('All');
                  },
                }
          }
        />
      ) : (
        <div className="card" style={{ padding: '0.5rem 0' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Commodity & Dossier ID</th>
                  <th>Category</th>
                  <th>Storage Regime</th>
                  <th>Recommended Substrate</th>
                  <th>Target Shelf Life</th>
                  <th>Evaluation Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {item.commodityName}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {item.id}
                      </span>
                    </td>
                    <td>
                      <Badge variant="teal">{item.category}</Badge>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-body)' }}>{item.storageConditionSummary}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                        {item.primaryMaterialName}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {item.materialCategory || 'Polymer Barrier'} • {item.costTier}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                        <Clock size={12} style={{ color: 'var(--primary)' }} />
                        {item.shelfLifeTarget}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <Calendar size={12} />
                        {item.date}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <Link
                          to={`/recommendation/${item.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.55rem' }}
                          title="Open full scientific dossier"
                        >
                          <Eye size={13} /> View
                        </Link>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.25rem 0.45rem', color: 'var(--primary)' }}
                          onClick={() => handleReevaluate(item)}
                          title="Re-evaluate with saved inputs"
                        >
                          <RotateCcw size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.25rem 0.45rem', color: 'var(--text-muted)' }}
                          onClick={() => handleExportSingleJSON(item.id, item.commodityName)}
                          title="Export raw JSON record"
                        >
                          <FileJson size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.25rem 0.45rem', color: 'var(--danger-text)' }}
                          onClick={() => setDeleteTargetId(item.id)}
                          title="Delete from database"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={deleteTargetId !== null}
        title="Delete Recommendation Dossier"
        message="Are you sure you want to delete this packaging recommendation from the database? This action is permanent."
        confirmLabel="Delete Record"
        isDestructive={true}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteTargetId(null)}
      />

      <ConfirmationDialog
        isOpen={showClearAllDialog}
        title="Clear Entire History Ledger"
        message="Are you sure you want to permanently erase all saved packaging recommendations from the database? This cannot be undone."
        confirmLabel="Clear All Evaluations"
        isDestructive={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearAllDialog(false)}
      />
    </div>
  );
};
