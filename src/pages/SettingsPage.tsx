import React, { useState, useEffect } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Save,
  AlertTriangle,
  BookOpen,
  Layers,
  Wind,
  Droplets,
  Recycle,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useToast } from '../components/common/Toast';
import { settingsService } from '../services/settingsService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import type { UserSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user, updateUser } = useAuth();

  // Profile form state
  const [profileName, setProfileName] = useState(user?.fullName || '');
  const [profileRole, setProfileRole] = useState(user?.role || '');
  const [profileOrg, setProfileOrg] = useState(user?.organization || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Application preferences state
  const [settings, setSettings] = useState<UserSettings>(() => settingsService.getSettings());

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || '');
      setProfileRole(user.role || '');
      setProfileOrg(user.organization || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const updatedUser = await authService.updateProfile({
        fullName: profileName.trim(),
        role: profileRole.trim(),
        organization: profileOrg.trim(),
      });
      updateUser(updatedUser);
      showToast('Profile updated and saved to Neon database.', 'success');
    } catch (err: any) {
      showToast('Failed to update profile: ' + err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    settingsService.saveSettings(settings);

    if (settings.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    showToast('Application preferences saved.', 'success');
  };

  return (
    <div>
      <PageHeader
        title="Settings & System Transparency"
        description="User identity configuration, interface preferences, scientific reference guides, and live platform health for SIH26236."
        badgeText="SIH26236 Production Ready"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Left Column: Profile, App Settings, and Local Reset */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* User Profile Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <User size={18} style={{ color: 'var(--primary)' }} />
                Investigator & Organization Profile
              </div>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email Address (Read-Only Identity)</label>
                <input
                  type="text"
                  className="input-control"
                  value={user?.email || 'authenticated-user@packsmart.ai'}
                  disabled
                  style={{ backgroundColor: 'var(--bg-surface)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                />
                <span className="form-hint">Authenticated account identifier</span>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="user-name">
                    Full Name <span style={{ color: 'var(--danger-text)' }}>*</span>
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    className="input-control"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Dr. Harish Reddy"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="user-role">
                    Technical Role / Title
                  </label>
                  <input
                    id="user-role"
                    type="text"
                    className="input-control"
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    placeholder="Packaging Technologist"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="user-org">
                  Affiliation / Laboratory / Organization
                </label>
                <input
                  id="user-org"
                  type="text"
                  className="input-control"
                  value={profileOrg}
                  onChange={(e) => setProfileOrg(e.target.value)}
                  placeholder="Smart India Hackathon Team"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={savingProfile}
              >
                <Save size={14} /> {savingProfile ? 'Persisting to Database...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Interface & Metric Preferences */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <SettingsIcon size={18} style={{ color: 'var(--primary)' }} />
                Interface Preferences & Unit System
              </div>
            </div>

            <form onSubmit={handleSettingsSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="unit-system">
                    Permeability & Temperature Units
                  </label>
                  <select
                    id="unit-system"
                    className="select-control"
                    value={settings.unitSystem}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        unitSystem: e.target.value as 'metric' | 'imperial',
                      })
                    }
                  >
                    <option value="metric">Metric (cc/m²·day, g/m²·day, °C, µm)</option>
                    <option value="imperial">Imperial (cc/100in²·day, g/100in²·day, °F, mil)</option>
                  </select>
                  <span className="form-hint">Controls units across reports and comparison tables</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="theme-select">
                    Visual Theme
                  </label>
                  <select
                    id="theme-select"
                    className="select-control"
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: e.target.value as 'light' | 'dark',
                      })
                    }
                  >
                    <option value="light">FoodTech Light (Clean Off-White & Emerald)</option>
                    <option value="dark">Dark Mode (High Contrast Slate)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={settings.autoSaveHistory}
                    onChange={(e) =>
                      setSettings({ ...settings, autoSaveHistory: e.target.checked })
                    }
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span>Automatically persist generated evaluations to PostgreSQL database ledger</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={settings.enableRespirationAlerts}
                    onChange={(e) =>
                      setSettings({ ...settings, enableRespirationAlerts: e.target.checked })
                    }
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span>Trigger hypoxia and anaerobic fermentation warnings for high-respiration produce</span>
                </label>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-secondary btn-sm">
                  <Save size={14} /> Update Preferences
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Scientific Reference and Disclaimers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Scientific Principles Reference Guide */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                Packaging Science Principles
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  <Wind size={14} style={{ color: 'var(--primary)' }} /> Oxygen Transmission Rate (OTR)
                </div>
                <div style={{ color: 'var(--text-body)', fontSize: '0.75rem' }}>
                  Standardized under <strong>ASTM D3985</strong> (coulometric sensor at 23°C, 0% RH). Dictates lipid rancidity in fats and aerobic respiration rates in produce.
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  <Droplets size={14} style={{ color: '#2563eb' }} /> Water Vapor Transmission Rate (WVTR)
                </div>
                <div style={{ color: 'var(--text-body)', fontSize: '0.75rem' }}>
                  Standardized under <strong>ASTM F1249</strong> (infrared sensor at 37.8°C, 90% RH). Dictates moisture migration, crispness loss in dry bakery, and transpirational weight loss.
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  <Layers size={14} style={{ color: '#7c3aed' }} /> Modified Atmosphere Packaging (MAP)
                </div>
                <div style={{ color: 'var(--text-body)', fontSize: '0.75rem' }}>
                  Headspace gas equilibrium (O₂/CO₂/N₂). High CO₂ (&gt;20%) inhibits aerobic microbes, but chilled seafood requires strict thermal monitoring against psychrotrophic <em>C. botulinum</em>.
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  <Recycle size={14} style={{ color: '#059669' }} /> Circularity & RIC Coding
                </div>
                <div style={{ color: 'var(--text-body)', fontSize: '0.75rem' }}>
                  ASTM D7611 Resin Identification Codes (RIC 1..7). Mono-materials (RIC 4 LDPE, RIC 5 PP) are categorized according to standardized single-stream recycling guidelines.
                </div>
              </div>
            </div>
          </div>

          {/* Scientific Disclaimer Card */}
          <div
            className="card"
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', color: '#92400e', marginBottom: '0.4rem' }}>
              <AlertTriangle size={18} /> Scientific Guidance Disclaimer
            </div>
            <p style={{ fontSize: '0.75rem', color: '#78350f', lineHeight: 1.5, margin: 0 }}>
              PackSmart AI outputs are generated from mathematical transport models and literature benchmarks for engineering decision support. They do not constitute certified laboratory test results or formal regulatory approvals. Industrial packaging implementations must undergo physical batch testing (ASTM D3985 / ASTM F1249) and real-time microbiological shelf-life challenge validation prior to commercial distribution.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
