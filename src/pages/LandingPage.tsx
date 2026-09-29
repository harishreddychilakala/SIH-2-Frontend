import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Leaf,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Droplets,
  Package,
  Cpu,
  FileText,
  BarChart3,
  Database,
  Truck,
  Building2,
  Microscope,
  Recycle,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'dossier' | 'compare' | 'sustainability' | 'history'>('dossier');

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="landing-page">
      {/* 1. STICKY NAVIGATION BAR */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <Link to="/" className="landing-logo-group">
            <div className="landing-logo-badge">
              <Package size={22} />
            </div>
            <div className="landing-logo-text">
              <span className="landing-logo-title">
                PackSmart <span>AI</span>
              </span>
              <span className="landing-logo-tagline">SIH26236 • Decision Intelligence</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav>
            <ul className="landing-nav-links">
              <li>
                <button type="button" className="landing-nav-link" onClick={() => scrollToSection('hero')}>
                  Home
                </button>
              </li>
              <li>
                <button type="button" className="landing-nav-link" onClick={() => scrollToSection('features')}>
                  Features
                </button>
              </li>
              <li>
                <button type="button" className="landing-nav-link" onClick={() => scrollToSection('how-it-works')}>
                  How It Works
                </button>
              </li>
              <li>
                <button type="button" className="landing-nav-link" onClick={() => scrollToSection('showcase')}>
                  Solutions
                </button>
              </li>
              <li>
                <button type="button" className="landing-nav-link" onClick={() => scrollToSection('sustainability')}>
                  Sustainability
                </button>
              </li>
              <li>
                <button type="button" className="landing-nav-link" onClick={() => scrollToSection('industries')}>
                  Industries
                </button>
              </li>
            </ul>
          </nav>

          {/* Nav Actions */}
          <div className="landing-nav-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="landing-btn-signin">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="landing-btn-signin">
                Sign In
              </Link>
            )}

            <button type="button" className="landing-btn-primary" onClick={handleGetStarted}>
              <span>{isAuthenticated ? 'Open App' : 'Get Started'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="landing-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <button
              type="button"
              style={{ background: 'none', border: 'none', textAlign: 'left', fontWeight: 600, color: '#334155' }}
              onClick={() => scrollToSection('hero')}
            >
              Home
            </button>
            <button
              type="button"
              style={{ background: 'none', border: 'none', textAlign: 'left', fontWeight: 600, color: '#334155' }}
              onClick={() => scrollToSection('features')}
            >
              Features
            </button>
            <button
              type="button"
              style={{ background: 'none', border: 'none', textAlign: 'left', fontWeight: 600, color: '#334155' }}
              onClick={() => scrollToSection('how-it-works')}
            >
              How It Works
            </button>
            <button
              type="button"
              style={{ background: 'none', border: 'none', textAlign: 'left', fontWeight: 600, color: '#334155' }}
              onClick={() => scrollToSection('showcase')}
            >
              Solutions
            </button>
            <button
              type="button"
              style={{ background: 'none', border: 'none', textAlign: 'left', fontWeight: 600, color: '#334155' }}
              onClick={() => scrollToSection('sustainability')}
            >
              Sustainability
            </button>
            <button
              type="button"
              style={{ background: 'none', border: 'none', textAlign: 'left', fontWeight: 600, color: '#334155' }}
              onClick={() => scrollToSection('industries')}
            >
              Industries
            </button>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
              <Link to="/login" className="landing-btn-secondary" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}>
                Sign In
              </Link>
              <button
                type="button"
                className="landing-btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="hero" className="landing-hero">
        <div className="landing-hero-container">
          <div>
            <div className="landing-hero-badge">
              <Sparkles size={14} />
              <span>Smart India Hackathon SIH26236 • AI Packaging Decision Engine</span>
            </div>

            <h1 className="landing-hero-title">
              Smarter Packaging.
              <span className="highlight-green">Less Waste. Longer Freshness.</span>
            </h1>

            <p className="landing-hero-subtitle">
              Transform post-harvest packaging decisions with AI-powered material recommendations,
              scientific decision support, and sustainable packaging insights.
            </p>

            <div className="landing-hero-ctas">
              <button
                type="button"
                className="landing-btn-primary"
                style={{ fontSize: '1rem', padding: '0.85rem 1.6rem' }}
                onClick={() => navigate('/recommend')}
              >
                <span>Explore AI Recommendations</span>
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                className="landing-btn-secondary"
                style={{ fontSize: '1rem', padding: '0.85rem 1.4rem' }}
                onClick={() => scrollToSection('how-it-works')}
              >
                See How It Works
              </button>
            </div>

            <div className="landing-hero-props">
              <div className="landing-prop-item">
                <CheckCircle2 size={16} />
                <span>Intelligent Material Selection</span>
              </div>
              <div className="landing-prop-item">
                <CheckCircle2 size={16} />
                <span>Shelf-Life Decision Support</span>
              </div>
              <div className="landing-prop-item">
                <CheckCircle2 size={16} />
                <span>Sustainable Packaging</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Browser Mockup */}
          <div className="landing-hero-visual">
            <div className="landing-browser-window">
              <div className="landing-browser-header">
                <div className="landing-browser-dots">
                  <div className="landing-dot landing-dot-red" />
                  <div className="landing-dot landing-dot-yellow" />
                  <div className="landing-dot landing-dot-green" />
                </div>
                <div className="landing-browser-url">packsmart.ai/dossier/strawberries-rec-849</div>
              </div>

              <div className="landing-browser-body">
                <div className="landing-hero-img-wrap">
                  <img
                    src="/images/hero_strawberries.jpg"
                    alt="Fresh organic strawberries packaged in micro-perforated sustainable pouch"
                    loading="eager"
                  />
                </div>

                {/* Floating Structured UI Preview */}
                <div className="landing-floating-rec-card">
                  <div className="landing-floating-rec-header">
                    <span className="landing-rec-tag">Recommended Candidate</span>
                    <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} /> High Technical Fit
                    </span>
                  </div>
                  <div className="landing-rec-material-name">
                    Micro-Perforated LDPE Film (RIC 4)
                  </div>
                  <div className="landing-rec-grid">
                    <div className="landing-rec-cell">
                      <span className="landing-rec-label">Target Commodity</span>
                      <span className="landing-rec-val">Fresh Strawberries</span>
                    </div>
                    <div className="landing-rec-cell">
                      <span className="landing-rec-label">Storage Regime</span>
                      <span className="landing-rec-val">2°C • 90% RH</span>
                    </div>
                    <div className="landing-rec-cell">
                      <span className="landing-rec-label">Sustainability</span>
                      <span className="landing-rec-val" style={{ color: '#125438' }}>100% Recyclable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST & VALUE STRIP */}
      <section className="landing-trust-strip">
        <div className="landing-trust-container">
          <div className="landing-trust-card">
            <div className="landing-trust-icon-box">
              <Cpu size={22} />
            </div>
            <div className="landing-trust-info">
              <h4>AI-Assisted Selection</h4>
              <p>Multi-attribute decision rules evaluating respiration, barrier, and climate stress.</p>
            </div>
          </div>

          <div className="landing-trust-card">
            <div className="landing-trust-icon-box">
              <Droplets size={22} />
            </div>
            <div className="landing-trust-info">
              <h4>Food-Specific Analysis</h4>
              <p>Tailored post-harvest profiles for fresh produce, dry grains, lipids, and dairy.</p>
            </div>
          </div>

          <div className="landing-trust-card">
            <div className="landing-trust-icon-box">
              <Scale size={22} />
            </div>
            <div className="landing-trust-info">
              <h4>Material Comparison</h4>
              <p>Objective evaluation of OTR, WVTR, tensile modulus, and unit cost.</p>
            </div>
          </div>

          <div className="landing-trust-card">
            <div className="landing-trust-icon-box">
              <Recycle size={22} />
            </div>
            <div className="landing-trust-info">
              <h4>Sustainability Assessment</h4>
              <p>Standardized RIC codes, industrial compostability (EN 13432), and end-of-life analysis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROBLEM AND SOLUTION SECTION */}
      <section className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-eyebrow">The Challenge & Opportunity</span>
          <h2 className="landing-section-title">Packaging decisions shouldn't be guesswork.</h2>
          <p className="landing-section-desc">
            Agricultural supply chains and food processors lose up to 30% of post-harvest yield due to
            mismatched barrier films, condensation rot, and premature oxidation.
          </p>
        </div>

        <div className="landing-ps-grid">
          {/* Left: The Real-World Problems */}
          <div className="landing-problem-card">
            <div className="landing-problem-header">
              <AlertTriangle size={18} />
              <span>Critical Industry Bottlenecks</span>
            </div>
            <ul className="landing-problem-list">
              <li className="landing-problem-item">
                <X size={16} />
                <span>
                  <strong>Post-Harvest Spoilage Losses:</strong> Millions in losses from mold proliferation and anaerobic fermentation during storage.
                </span>
              </li>
              <li className="landing-problem-item">
                <X size={16} />
                <span>
                  <strong>Ignoring Respiration & Moisture Dynamics:</strong> Packaging selected without accounting for gas exchange ($O_2 / CO_2$) or steep humidity gradients.
                </span>
              </li>
              <li className="landing-problem-item">
                <X size={16} />
                <span>
                  <strong>Cost vs Barrier Compromises:</strong> Unclear trade-offs between expensive high-barrier laminates and low-cost unvented poly bags.
                </span>
              </li>
              <li className="landing-problem-item">
                <X size={16} />
                <span>
                  <strong>Deceptive Eco-Claims:</strong> Confusion around non-recyclable multi-layers vs certified EN 13432 compostables and mono-polyolefins.
                </span>
              </li>
              <li className="landing-problem-item">
                <X size={16} />
                <span>
                  <strong>Fragmented Material Data:</strong> Scattered polymer datasheets with unverified permeation metrics and lack of clear ASTM standards.
                </span>
              </li>
            </ul>
          </div>

          {/* Right: The PackSmart AI Solution */}
          <div className="landing-solution-card">
            <div className="landing-solution-header">
              <ShieldCheck size={18} />
              <span>The PackSmart AI Solution</span>
            </div>
            <h3 className="landing-solution-title">
              Deterministic, scientifically grounded decision intelligence.
            </h3>
            <p style={{ color: '#334155', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              PackSmart AI bridges post-harvest food science with material engineering. It integrates
              commodity respiration rates, environmental storage parameters, and polymer permeation physics
              into a centralized decision engine.
            </p>

            <ul className="landing-solution-list">
              <li className="landing-solution-item">
                <CheckCircle2 size={16} />
                <span>
                  <strong>Preserves Exact Operating Baseline:</strong> Zero arbitrary default substitutions for temperature, humidity, or target shelf life.
                </span>
              </li>
              <li className="landing-solution-item">
                <CheckCircle2 size={16} />
                <span>
                  <strong>Validation Integrity Flagging:</strong> Transparently highlights missing permeation metrics (OTR/WVTR) and ASTM laboratory requirements.
                </span>
              </li>
              <li className="landing-solution-item">
                <CheckCircle2 size={16} />
                <span>
                  <strong>Transparent Technical Trade-offs:</strong> Compares candidates side-by-side on barrier lockout, cost tier, and recycling stream.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. CORE FEATURES SECTION */}
      <section id="features" className="landing-section landing-section-subtle">
        <div className="landing-section-header">
          <span className="landing-section-eyebrow">Platform Capabilities</span>
          <h2 className="landing-section-title">Everything you need to make smarter packaging decisions.</h2>
          <p className="landing-section-desc">
            An end-to-end decision system empowering food producers, packaging converters, and agronomists.
          </p>
        </div>

        <div className="landing-features-list">
          {/* Feature 1 */}
          <div className="landing-feature-row">
            <div className="landing-feature-info">
              <span className="landing-feature-num">Feature 01</span>
              <h3 className="landing-feature-heading">AI Packaging Recommendations</h3>
              <p className="landing-feature-desc">
                Analyze food properties, respiration dynamics, storage temperature, relative humidity, and
                shelf-life targets to identify suitable packaging candidates with transparent suitability rationales.
              </p>
              <Link to="/recommend" className="landing-btn-secondary" style={{ alignSelf: 'flex-start' }}>
                Try Recommendation Engine <ChevronRight size={15} />
              </Link>
            </div>
            <div className="landing-feature-preview-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#125438', textTransform: 'uppercase' }}>
                  Candidate Engine Output
                </span>
                <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>Automated Analysis</span>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '0.925rem', color: '#166534', display: 'block' }}>Laser Micro-Perforated LDPE Film</strong>
                <span style={{ fontSize: '0.75rem', color: '#14532d' }}>Calibrated O₂ / CO₂ equilibrium to prevent anaerobic fruit decay</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.78rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>OTR Target</span>
                  <strong>Custom Tuned</strong>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>WVTR (38°C, 90%RH)</span>
                  <strong>12 g/m²·day</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 (Reversed) */}
          <div className="landing-feature-row reverse">
            <div className="landing-feature-info">
              <span className="landing-feature-num">Feature 02</span>
              <h3 className="landing-feature-heading">Intelligent Material Comparison</h3>
              <p className="landing-feature-desc">
                Compare primary and alternative packaging materials across gas barrier (OTR), vapor resistance (WVTR),
                indicative price per kilogram, and end-of-life circularity.
              </p>
              <Link to="/compare" className="landing-btn-secondary" style={{ alignSelf: 'flex-start' }}>
                Launch Matrix Comparison <ChevronRight size={15} />
              </Link>
            </div>
            <div className="landing-feature-preview-box">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                Side-by-Side Substrate Matrix
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem' }}>
                  <span><strong>LDPE Film (RIC 4)</strong></span>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>Low Cost ($1.50/kg) • Breathable</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem' }}>
                  <span><strong>Bio-PLA Film</strong></span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>Compostable EN 13432 • High WVTR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem' }}>
                  <span><strong>PET/Alu Foil Lam</strong></span>
                  <span style={{ color: '#9333ea', fontWeight: 600 }}>Ultra Barrier (OTR &lt; 0.1) • Premium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="landing-feature-row">
            <div className="landing-feature-info">
              <span className="landing-feature-num">Feature 03</span>
              <h3 className="landing-feature-heading">Food-Specific Scientific Analysis</h3>
              <p className="landing-feature-desc">
                Built-in library of post-harvest commodities including fresh fruits, vegetables, dry grains,
                fat-rich nuts, and dairy cuts—with auto-estimation of moisture, pH, and respiration rate.
              </p>
              <Link to="/commodities" className="landing-btn-secondary" style={{ alignSelf: 'flex-start' }}>
                Explore Commodity Profiles <ChevronRight size={15} />
              </Link>
            </div>
            <div className="landing-feature-preview-box">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#125438', fontWeight: 700, textTransform: 'uppercase' }}>Produce</span>
                  <strong style={{ display: 'block', fontSize: '0.85rem' }}>Alphonsa Mango</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Resp: 45 mg CO₂/kg·h • Chilling sensitive</span>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#0d9488', fontWeight: 700, textTransform: 'uppercase' }}>Grains</span>
                  <strong style={{ display: 'block', fontSize: '0.85rem' }}>Basmati Rice</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>MC: 12% • Non-respiring • Pest defense</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 (Reversed) */}
          <div className="landing-feature-row reverse">
            <div className="landing-feature-info">
              <span className="landing-feature-num">Feature 04</span>
              <h3 className="landing-feature-heading">Shelf-Life Decision Support</h3>
              <p className="landing-feature-desc">
                Evaluate preservation outcomes under steady thermal and humidity regimes. Clearly differentiates
                between user target shelf life, heuristic model estimates, and required ASTM laboratory trials.
              </p>
              <Link to="/recommend" className="landing-btn-secondary" style={{ alignSelf: 'flex-start' }}>
                Assess Preservation Horizon <ChevronRight size={15} />
              </Link>
            </div>
            <div className="landing-feature-preview-box">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#f0fdf4', borderRadius: '6px', borderLeft: '3px solid #16a34a' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>1. User Target</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>21 Days Operating Horizon</div>
                </div>
                <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#f0fdfa', borderRadius: '6px', borderLeft: '3px solid #0d9488' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>2. Model Forecast</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>~18 - 26 Days (at 2°C / 90% RH)</div>
                </div>
                <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#fffbeb', borderRadius: '6px', borderLeft: '3px solid #d97706' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>3. Experimental Status</span>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Pending ASLT Food Trial (Arrhenius Kinetics)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="landing-feature-row">
            <div className="landing-feature-info">
              <span className="landing-feature-num">Feature 05</span>
              <h3 className="landing-feature-heading">Sustainable Packaging Insights</h3>
              <p className="landing-feature-desc">
                Explore recyclable mono-materials (RIC 4 LDPE, RIC 2 HDPE), bio-based industrial compostables (EN 13432),
                and cellulose fibre composites while balancing barrier needs against carbon footprint.
              </p>
              <button
                type="button"
                className="landing-btn-secondary"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => scrollToSection('sustainability')}
              >
                View Sustainability Insights <ChevronRight size={15} />
              </button>
            </div>
            <div className="landing-feature-preview-box">
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <span className="badge badge-teal">RIC 4 (LDPE)</span>
                <span className="badge badge-teal">RIC 2 (HDPE)</span>
                <span className="badge badge-neutral">EN 13432 Compostable</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Transparent disposal pathways and carbon notes provide clear commercial alignment with
                modern ESG packaging mandates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-eyebrow">Workflow Simplicity</span>
          <h2 className="landing-section-title">From food properties to packaging decisions in minutes.</h2>
          <p className="landing-section-desc">
            A frictionless, 4-step workflow that turns complex food science into actionable engineering dossiers.
          </p>
        </div>

        <div className="landing-steps-grid">
          <div className="landing-step-card">
            <div className="landing-step-number">1</div>
            <h3 className="landing-step-title">Select Your Food</h3>
            <p className="landing-step-desc">
              Choose from verified commodity benchmarks or enter custom food parameters (moisture, lipid ratio, pH, respiration).
            </p>
          </div>

          <div className="landing-step-card">
            <div className="landing-step-number">2</div>
            <h3 className="landing-step-title">Define Storage Conditions</h3>
            <p className="landing-step-desc">
              Specify storage temperature, relative humidity, target shelf life, transit vibration stresses, and format preferences.
            </p>
          </div>

          <div className="landing-step-card">
            <div className="landing-step-number">3</div>
            <h3 className="landing-step-title">Analyze Materials</h3>
            <p className="landing-step-desc">
              The engine matches gas/vapor barrier thresholds, seal integrity, price points, and circularity metrics.
            </p>
          </div>

          <div className="landing-step-card">
            <div className="landing-step-number">4</div>
            <h3 className="landing-step-title">Explore Recommendation</h3>
            <p className="landing-step-desc">
              Review primary candidate, technical trade-offs, alternative materials, MAP guidance, and export comprehensive JSON/Print reports.
            </p>
          </div>
        </div>
      </section>

      {/* 7. PRODUCT SHOWCASE SECTION */}
      <section id="showcase" className="landing-section landing-section-subtle">
        <div className="landing-section-header">
          <span className="landing-section-eyebrow">Interactive SaaS Showcase</span>
          <h2 className="landing-section-title">Built for precision food packaging engineering.</h2>
          <p className="landing-section-desc">
            Explore actual interface views and capabilities designed for modern agri-food enterprises.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="landing-showcase-tabs">
          <button
            type="button"
            className={`landing-tab-btn ${activeTab === 'dossier' ? 'active' : ''}`}
            onClick={() => setActiveTab('dossier')}
          >
            Packaging Dossier
          </button>
          <button
            type="button"
            className={`landing-tab-btn ${activeTab === 'input' ? 'active' : ''}`}
            onClick={() => setActiveTab('input')}
          >
            Intelligent Input Form
          </button>
          <button
            type="button"
            className={`landing-tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            Matrix Comparison
          </button>
          <button
            type="button"
            className={`landing-tab-btn ${activeTab === 'sustainability' ? 'active' : ''}`}
            onClick={() => setActiveTab('sustainability')}
          >
            Sustainability Analysis
          </button>
          <button
            type="button"
            className={`landing-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Dossier History
          </button>
        </div>

        {/* Showcase Screen */}
        <div className="landing-showcase-screen">
          <div className="landing-browser-header">
            <div className="landing-browser-dots">
              <div className="landing-dot landing-dot-red" />
              <div className="landing-dot landing-dot-yellow" />
              <div className="landing-dot landing-dot-green" />
            </div>
            <div className="landing-browser-url">app.packsmart.ai/dossier/preview</div>
          </div>

          <div style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
            {activeTab === 'dossier' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                  <div>
                    <span className="badge badge-teal" style={{ marginBottom: '0.35rem' }}>Primary Candidate</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Laser Micro-Perforated MAP LDPE Film (RIC 4)
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-success">Cost: Moderate ($$)</span>
                    <span className="badge badge-teal">RIC 4 (LDPE)</span>
                  </div>
                </div>

                <div style={{ padding: '0.85rem 1rem', backgroundColor: '#e8f5ed', borderRadius: '8px', border: '1px solid #a3d9bc', fontSize: '0.85rem', color: '#125438', marginBottom: '1.25rem' }}>
                  <strong>Multi-Attribute Criteria:</strong> Evaluated for Fresh Strawberries at 2°C chilled regime (90% RH). Provides calibrated respiration balance to prevent condensation rot.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>OTR Barrier</span>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Calibrated Density</strong>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>WVTR Barrier</span>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>12 g/m²·24h</strong>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Film Gauge</span>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>35 µm Mono-Film</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'input' && (
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0f172a' }}>
                  Intelligent Input & Auto-Estimation Matrix
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Type any agricultural commodity (e.g., "Alphonsa Mango", "Basmati Rice") to auto-estimate scientific parameters.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Moisture</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>84.0%</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Lipids / Fat</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>0.2%</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Product pH</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>4.2</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Respiration</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>45 mg/kg·h</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'compare' && (
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0f172a' }}>
                  Side-by-Side Substrate Specification Matrix
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}>Material</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}>Structure</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}>OTR Barrier</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}>Price / kg</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>LDPE Film (RIC 4)</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>Mono LDPE</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>7800 cc</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>$1.50 - $2.20</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>HDPE Liner (RIC 2)</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>Mono HDPE</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>2600 cc</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>$1.80 - $2.40</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>PET/Alu Foil Lam</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>PET / Al / PE</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>&lt; 0.05 cc</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>$5.50 - $8.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'sustainability' && (
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0f172a' }}>
                  End-of-Life & Polymer Circularity
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <strong style={{ color: '#166534', display: 'block', fontSize: '0.9rem' }}>Mono Polyolefins</strong>
                    <p style={{ fontSize: '0.78rem', color: '#14532d', margin: '0.3rem 0 0' }}>
                      100% recyclable in standard kerbside streams (RIC 4 / RIC 2).
                    </p>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: '#f0fdfa', borderRadius: '8px', border: '1px solid #99f6e4' }}>
                    <strong style={{ color: '#0f766e', display: 'block', fontSize: '0.9rem' }}>Compostables</strong>
                    <p style={{ fontSize: '0.78rem', color: '#115e59', margin: '0.3rem 0 0' }}>
                      Certified under EN 13432 & ASTM D6400 for industrial composting.
                    </p>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#334155', display: 'block', fontSize: '0.9rem' }}>Multi-Layer Laminates</strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.3rem 0 0' }}>
                      Extreme gas barrier with transparent trade-off in recyclability.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0f172a' }}>
                  Centralized Recommendation Dossiers
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                  Persisted history entries with instant re-evaluation, JSON export, and matrix comparison.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>Alphonsa Mangoes</strong> — Chilled (13.5°C, 90% RH)</span>
                    <span className="badge badge-teal">LDPE Film (RIC 4)</span>
                  </div>
                  <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>Basmati Rice</strong> — Ambient (25°C, 55% RH)</span>
                    <span className="badge badge-neutral">HDPE Liner (RIC 2)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. SUSTAINABILITY SECTION */}
      <section id="sustainability" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-eyebrow">Environmental Responsibility</span>
          <h2 className="landing-section-title">Better packaging decisions. A more sustainable future.</h2>
          <p className="landing-section-desc">
            Balance barrier protection against carbon footprints and end-of-life recyclability without deceptive claims.
          </p>
        </div>

        <div className="landing-sustainability-wrap">
          <div className="landing-sust-img-wrap">
            <img
              src="/images/sustainable_materials.jpg"
              alt="Sustainable food packaging materials including compostable PLA and recyclable mono punnets"
              loading="lazy"
            />
          </div>

          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.25 }}>
              Transparent Circularity & Real-World Disposal Pathways
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              PackSmart AI evaluates material sustainability based on verified resin identification codes (RIC),
              European standard EN 13432 compostability guidelines, and lifecycle trade-offs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e8f5ed', color: '#125438', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <Check size={16} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Recyclability & End-of-Life Streams:</strong>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                    Categorizes mono-films (RIC 4 LDPE, RIC 2 HDPE, RIC 5 PP) to prioritize existing municipal sorting streams.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e8f5ed', color: '#125438', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <Check size={16} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Industrial Compostable Alternatives:</strong>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                    Evaluates Bio-PLA films under EN 13432 standards for organic agriculture and zero microplastic residue.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e8f5ed', color: '#125438', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <Check size={16} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Food Protection vs Over-Packaging:</strong>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                    Prevents premature spoilage—the largest contributor to agricultural carbon footprint—through right-sized barrier films.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. INDUSTRIES AND USE CASES */}
      <section id="industries" className="landing-section landing-section-subtle">
        <div className="landing-section-header">
          <span className="landing-section-eyebrow">Enterprise Reach</span>
          <h2 className="landing-section-title">Designed for the people shaping the food supply chain.</h2>
          <p className="landing-section-desc">
            From farm-gate aggregation to cold-chain logistics and commercial retail shelves.
          </p>
        </div>

        <div className="landing-industries-grid">
          <div className="landing-industry-card">
            <div className="landing-industry-icon">
              <Leaf size={24} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Food Producers & Farmers
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
              Select cost-effective breathable liners and venting specifications to protect harvested fruits and vegetables.
            </p>
          </div>

          <div className="landing-industry-card">
            <div className="landing-industry-icon">
              <Building2 size={24} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Packaging Manufacturers
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
              Recommend high-performance film grades, co-extruded structures, and mono-materials with validated barrier metrics.
            </p>
          </div>

          <div className="landing-industry-card">
            <div className="landing-industry-icon">
              <Truck size={24} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Cold-Chain Logistics
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
              Optimize MAP gas compositions and condensation-resistant films for inter-state and export transit.
            </p>
          </div>

          <div className="landing-industry-card">
            <div className="landing-industry-icon">
              <Package size={24} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Food Processing & CPG
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
              Protect high-fat snacks, roasted nuts, and dairy products against oxidative rancidity and moisture uptake.
            </p>
          </div>

          <div className="landing-industry-card">
            <div className="landing-industry-icon">
              <Microscope size={24} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Researchers & Agronomists
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
              Analyze post-harvest respiration models and benchmark polymer permeability standards in research trials.
            </p>
          </div>

          <div className="landing-industry-card">
            <div className="landing-industry-icon">
              <Recycle size={24} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Sustainability Consultants
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
              Conduct evidence-based packaging lifecycle evaluations and ESG compliance audits for retail brands.
            </p>
          </div>
        </div>
      </section>

      {/* 10. WHY PACKSMART AI */}
      <section className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-eyebrow">The Competitive Edge</span>
          <h2 className="landing-section-title">Why industry leaders choose PackSmart AI.</h2>
          <p className="landing-section-desc">
            Transparent, reproducible engineering decision support without black-box hype.
          </p>
        </div>

        <div className="landing-why-grid">
          <div className="landing-why-card">
            <BarChart3 size={24} style={{ color: '#125438', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Data-Driven Selection
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Deterministic heuristic engine combining food respiration kinetics with polymer permeation physics.
            </p>
          </div>

          <div className="landing-why-card">
            <Database size={24} style={{ color: '#125438', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Post-Harvest Specifics
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Pre-configured commodity matrices for fruits, grains, lipids, dairy, and custom agricultural products.
            </p>
          </div>

          <div className="landing-why-card">
            <Scale size={24} style={{ color: '#125438', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Transparent Trade-Offs
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Clear advantages and limitations for every material without claiming unvalidated perfection.
            </p>
          </div>

          <div className="landing-why-card">
            <Leaf size={24} style={{ color: '#125438', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Circularity Aware
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Standardized RIC resin identification codes, EN 13432 composting guidelines, and disposal pathways.
            </p>
          </div>

          <div className="landing-why-card">
            <FileText size={24} style={{ color: '#125438', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Centralized Dossiers
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Persistent technical dossiers with one-click print reports, JSON export, and matrix comparison.
            </p>
          </div>

          <div className="landing-why-card">
            <ShieldCheck size={24} style={{ color: '#125438', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Standards Compliance
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Explicit ASTM D3985, ASTM F1249, and Arrhenius ASLT food shelf-life verification alerts for lab testing protocols.
            </p>
          </div>
        </div>
      </section>

      {/* 11. FINAL CALL TO ACTION */}
      <section className="landing-final-cta">
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.15,
            backgroundImage: 'url(/images/cold_chain_storage.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="landing-cta-container">
          <h2 className="landing-cta-title">
            Ready to make smarter packaging decisions?
          </h2>
          <p className="landing-cta-desc">
            Explore intelligent packaging recommendations and evaluate sustainable material alternatives with PackSmart AI.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="landing-cta-btn-primary"
              onClick={() => navigate('/recommend')}
            >
              <span>Start Your Evaluation</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="landing-cta-btn-secondary"
              onClick={handleGetStarted}
            >
              <span>Explore the Platform</span>
            </button>
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer id="about" className="landing-footer">
        <div className="landing-footer-container">
          <div className="landing-footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#125438', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Package size={18} />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                PackSmart <span style={{ color: '#34d399' }}>AI</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.55, maxWidth: '320px', marginBottom: '1rem' }}>
              AI-driven sustainable packaging recommendation and post-harvest decision support system developed for Smart India Hackathon (SIH26236).
            </p>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Cloud Database: Neon PostgreSQL • Food Science Engine
            </div>
          </div>

          <div className="landing-footer-col">
            <h5>Platform Links</h5>
            <ul className="landing-footer-links">
              <li>
                <Link to="/recommend" className="landing-footer-link">Recommendation Engine</Link>
              </li>
              <li>
                <Link to="/compare" className="landing-footer-link">Material Matrix</Link>
              </li>
              <li>
                <Link to="/commodities" className="landing-footer-link">Commodities Database</Link>
              </li>
              <li>
                <Link to="/chat" className="landing-footer-link">PackBot AI Consultant</Link>
              </li>
              <li>
                <Link to="/history" className="landing-footer-link">Dossier History</Link>
              </li>
            </ul>
          </div>

          <div className="landing-footer-col">
            <h5>Science & Standards</h5>
            <ul className="landing-footer-links">
              <li>
                <span className="landing-footer-link">ASTM D3985 (Coulometric OTR)</span>
              </li>
              <li>
                <span className="landing-footer-link">ASTM F1249 (Infrared WVTR)</span>
              </li>
              <li>
                <span className="landing-footer-link">ASLT Food Aging (Arrhenius Kinetics)</span>
              </li>
              <li>
                <span className="landing-footer-link">EN 13432 Compostability</span>
              </li>
              <li>
                <span className="landing-footer-link">Resin Identification Codes (RIC)</span>
              </li>
            </ul>
          </div>

          <div className="landing-footer-col">
            <h5>Project & Access</h5>
            <ul className="landing-footer-links">
              <li>
                <Link to="/login" className="landing-footer-link">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="landing-footer-link">Create Account</Link>
              </li>
              <li>
                <Link to="/dashboard" className="landing-footer-link">Dashboard</Link>
              </li>
              <li>
                <span className="landing-footer-link">Problem ID: SIH26236</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <div>
            © {new Date().getFullYear()} PackSmart AI (SIH26236). All rights reserved.
          </div>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
            Prototype Engineering System • Values require ASTM laboratory validation before industrial adoption.
          </div>
        </div>
      </footer>
    </div>
  );
};
