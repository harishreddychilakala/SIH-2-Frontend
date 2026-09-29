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
  MessageSquare,
  Search,
  Activity,
  Zap,
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
    'Polyolefins': '#059669',
    'Barrier Films': '#0d9488',
    'Foil & Metalized Laminates': '#0284c7',
    'Bio-based & Compostable': '#10b981',
    'Speciality MAP Films': '#eab308',
    'Paper & Cellulosic': '#b45309',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Top BioTech Hero Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f766e 75%, #0d9488 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2.5rem',
          color: '#ffffff',
          boxShadow: 'var(--shadow-lg), 0 10px 30px -10px rgba(6, 78, 59, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Glow ambient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '30%',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '750px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: '1rem',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#34d399',
                boxShadow: '0 0 8px #34d399',
              }}
            />
            <ShieldCheck size={14} /> Smart Bio-Barrier Decision Engine
          </div>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              color: '#ffffff',
              fontSize: '2.25rem',
              fontWeight: 800,
              marginBottom: '0.75rem',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            Precision Food Packaging & Shelf-Life Optimization
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: '1rem', lineHeight: 1.6, margin: 0, maxWidth: '680px' }}>
            Multi-barrier mathematical modeling engine matching commodity respiration dynamics and transpiration coefficients with optimal mono-materials and modified atmosphere packaging.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#a7f3d0', fontWeight: 600 }}>
              <Zap size={15} /> ASTM D3985 / F1249 Modeled
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#a7f3d0', fontWeight: 600 }}>
              <Activity size={15} /> Real-time MAP Simulation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative', zIndex: 2, minWidth: '220px' }}>
          <Link
            to="/recommend"
            className="btn btn-lg"
            style={{
              backgroundColor: '#ffffff',
              color: '#064e3b',
              fontWeight: 800,
              border: 'none',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              transition: 'all var(--transition-normal)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
            }}
          >
            <Sparkles size={18} style={{ color: '#059669' }} />
            <span>New Recommendation</span>
          </Link>

          <Link
            to="/chat"
            state={{ newChat: Date.now() }}
            className="btn btn-lg"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontWeight: 700,
              border: '1px solid rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-md)',
              padding: '0.8rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
            }}
          >
            <MessageSquare size={17} />
            <span>Consult PackBot AI</span>
          </Link>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid-4">
        <StatCard
          title="Supported Commodities"
          value={commodities.length}
          subtitle="Produce, grains, dairy, fats"
          icon={<Apple size={22} />}
          onClick={() => navigate('/commodities')}
          trend={{ text: 'Active Catalog', isPositive: true }}
        />
        <StatCard
          title="Packaging Materials"
          value={materials.length}
          subtitle="Barrier films, foils, bio-resins"
          icon={<Layers size={22} />}
          onClick={() => navigate('/materials')}
          trend={{ text: 'ASTM Verified', isPositive: true }}
        />
        <StatCard
          title="Saved Recommendations"
          value={history.length}
          subtitle="Database evaluations"
          icon={<HistoryIcon size={22} />}
          onClick={() => navigate('/history')}
          trend={{ text: `${history.length} in ledger`, isPositive: true }}
        />
        <StatCard
          title="Material Comparator"
          value="Multi-Matrix"
          subtitle="OTR / WVTR differential"
          icon={<Scale size={22} />}
          onClick={() => navigate('/compare')}
          trend={{ text: 'Side-by-side', isPositive: true }}
        />
      </div>

      {/* ── Main Grid: Recent Recommendations & Material Categories Breakdown ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.65fr) minmax(0, 1fr)',
          gap: '1.5rem',
        }}
      >
        {/* Recent Recommendations Table */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div className="card-title">
                <HistoryIcon size={20} style={{ color: 'var(--primary-vivid)' }} />
                Recent Packaging Evaluations
              </div>
              <div className="card-description">
                Latest barrier calculations with target storage conditions
              </div>
            </div>
            <Link to="/history" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
              View Ledger <ArrowRight size={14} />
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
            <div className="table-container" style={{ flex: 1 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Commodity</th>
                    <th>Storage Regime</th>
                    <th>Recommended Substrate</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {item.commodityName}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-body)' }}>{item.storageConditionSummary}</span>
                      </td>
                      <td>
                        <Badge variant="teal">{item.primaryMaterialName}</Badge>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {item.date}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/recommendation/${item.id}`}
                          className="btn btn-ghost btn-sm"
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: 'var(--primary-vivid)',
                            backgroundColor: 'var(--primary-light)',
                            borderRadius: 'var(--radius-full)',
                          }}
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
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <div className="card-title">
                  <BarChart3 size={20} style={{ color: 'var(--teal-600)' }} />
                  Substrate Library Distribution
                </div>
                <div className="card-description">
                  Benchmarked barrier materials categorized by polymer chemistry
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
              {materialCategories.map((cat, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
                      {cat.count} types ({cat.share})
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: cat.share,
                        backgroundColor: cat.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.8s ease-in-out',
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
              padding: '1.1rem 1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem' }}>Multi-Substrate Comparator</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Compare OTR & WVTR values side-by-side
              </div>
            </div>
            <Link to="/compare" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
              Open Comparator
            </Link>
          </div>
        </div>
      </div>

      {/* ── Scientific 4-Step Pipeline ── */}
      <div className="card" style={{ padding: '2rem' }}>
        <div className="card-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              How PackSmart AI Operates
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Deterministic decision tree engine modeled on post-harvest physiology and barrier polymer science
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/commodities')}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', gap: '0.4rem' }}
          >
            <Search size={14} /> Explore Database
          </button>
        </div>

        <div className="grid-4">
          <div
            style={{
              padding: '1.35rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--gradient-biotech)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px var(--primary-focus)',
              }}
            >
              1
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.35rem 0 0 0', color: 'var(--text-main)' }}>
              Physicochemical Profiling
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Input commodity moisture %, lipid fraction, respiration index, pH, and ethylene sensitivity.
            </p>
          </div>

          <div
            style={{
              padding: '1.35rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--gradient-biotech)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px var(--primary-focus)',
              }}
            >
              2
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.35rem 0 0 0', color: 'var(--text-main)' }}>
              Storage Constraints
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Define target ambient/chilled temperature, relative humidity gradient, and distribution distance.
            </p>
          </div>

          <div
            style={{
              padding: '1.35rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--gradient-biotech)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px var(--primary-focus)',
              }}
            >
              3
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.35rem 0 0 0', color: 'var(--text-main)' }}>
              Permeation Matching
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Calculates critical OTR (Oxygen Transmission) and WVTR (Water Vapor Transmission) thresholds.
            </p>
          </div>

          <div
            style={{
              padding: '1.35rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--gradient-biotech)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px var(--primary-focus)',
              }}
            >
              4
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.35rem 0 0 0', color: 'var(--text-main)' }}>
              Optimal Substrate Plan
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Outputs primary film structure, trade-off alternatives, sustainability ratings, and MAP gas flushes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
