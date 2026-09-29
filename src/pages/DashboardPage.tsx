import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Apple,
  Layers,
  History as HistoryIcon,
  Scale,
  ArrowRight,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { commodityService } from '../services/commodityService';
import { materialService } from '../services/materialService';
import { recommendationService } from '../services/recommendationService';
import type { Commodity, PackagingMaterial, RecommendationHistoryItem } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      const [cList, mList, hList] = await Promise.all([
        commodityService.getAll(),
        materialService.getAll(),
        recommendationService.getHistory(),
      ]);
      setCommodities(cList);
      setMaterials(mList);
      setHistory(hList);
    }
    loadDashboardData();
  }, []);

  const categoryColors: Record<string, string> = {
    'Polyolefins': '#125438',
    'Barrier Films': '#0d9488',
    'Foil & Metalized Laminates': '#0284c7',
    'Bio-based & Compostable': '#16a34a',
    'Speciality MAP Films': '#ca8a04',
    'Paper & Cellulosic': '#854d0e',
  };

  const materialCategories = React.useMemo(() => {
    if (materials.length === 0) return [];
    const counts: Record<string, number> = {};
    materials.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      share: `${Math.round((count / materials.length) * 100)}%`,
      color: categoryColors[name] || '#0d9488',
    }));
  }, [materials]);

  return (
    <div>
      {/* Top Banner & Welcome */}
      <div
        style={{
          background: 'linear-gradient(135deg, #125438 0%, #0d9488 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            <ShieldCheck size={14} /> Smart Packaging Decision Support System
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            PackSmart AI Decision Support Engine
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Automated food packaging material recommendation system designed for farmers, food processors, agritech startups, and packaging engineers to eliminate post-harvest losses through precision barrier matching.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/chat"
            state={{ newChat: Date.now() }}
            className="btn btn-lg"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontWeight: 700,
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span>💬 Ask PackBot AI</span>
          </Link>
          <Link
            to="/recommend"
            className="btn btn-lg"
            style={{
              backgroundColor: '#ffffff',
              color: '#125438',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Sparkles size={18} />
            <span>New Recommendation</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Supported Commodities"
          value={commodities.length}
          subtitle="Produce, grains, fats, dairy"
          icon={<Apple size={22} />}
          onClick={() => navigate('/commodities')}
        />
        <StatCard
          title="Packaging Materials"
          value={materials.length}
          subtitle="Barrier films, foils, compostable"
          icon={<Layers size={22} />}
          onClick={() => navigate('/materials')}
        />
        <StatCard
          title="Saved Recommendations"
          value={history.length}
          subtitle="Evaluations in database"
          icon={<HistoryIcon size={22} />}
          onClick={() => navigate('/history')}
        />
        <StatCard
          title="Material Comparator"
          value="Multi-Matrix"
          subtitle="OTR / WVTR differential"
          icon={<Scale size={22} />}
          onClick={() => navigate('/compare')}
        />
      </div>

      {/* Main Grid: Recent Recommendations & Material Categories Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Recent Recommendations Table */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <HistoryIcon size={18} style={{ color: 'var(--primary)' }} />
                Recent Packaging Evaluations
              </div>
              <div className="card-description">
                Latest rule-heuristic recommendations with target storage conditions
              </div>
            </div>
            <Link to="/history" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {history.length === 0 ? (
            <EmptyState
              title="No recommendations yet"
              description="Generate your first food packaging recommendation to see detailed barrier and shelf life analysis."
              action={{
                label: 'Create Recommendation',
                onClick: () => navigate('/recommend'),
              }}
            />
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Commodity</th>
                    <th>Storage Regime</th>
                    <th>Recommended Substrate</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.commodityName}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem' }}>{item.storageConditionSummary}</span>
                      </td>
                      <td>
                        <Badge variant="teal">{item.primaryMaterialName}</Badge>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {item.date}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/recommendation/${item.id}`}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          View Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Visual Material Substrate Distribution */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div>
                <div className="card-title">
                  <BarChart3 size={18} style={{ color: 'var(--teal-600)' }} />
                  Substrate Library Distribution
                </div>
                <div className="card-description">
                  Benchmarked barrier materials categorized by polymer chemistry
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
              {materialCategories.map((cat, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {cat.count} types ({cat.share})
                    </span>
                  </div>
                  <div
                    style={{
                      height: '7px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: cat.share,
                        backgroundColor: cat.color,
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Multi-Substrate Comparison</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Compare OTR & WVTR values side-by-side
              </div>
            </div>
            <Link to="/compare" className="btn btn-primary btn-sm">
              Open Comparator
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works - Scientific 4-Step Pipeline */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div className="card-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              How PackSmart AI Operates
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Deterministic decision tree engine modeled on post-harvest physiology and barrier polymer science
            </p>
          </div>
        </div>

        <div className="grid-4">
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
              }}
            >
              1
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Physicochemical Profiling
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Input commodity moisture %, lipid fraction, respiration index, pH, and ethylene sensitivity.
            </p>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
              }}
            >
              2
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Storage & Transit Constraints
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Define target ambient/chilled temperature, relative humidity gradient, and distribution distance.
            </p>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
              }}
            >
              3
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Barrier Permeation Matching
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Calculates critical OTR (Oxygen Transmission) and WVTR (Water Vapor Transmission) thresholds.
            </p>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
              }}
            >
              4
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Optimal Substrate & MAP Plan
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Outputs primary film structure, trade-off alternatives, sustainability ratings, and MAP gas flushes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
