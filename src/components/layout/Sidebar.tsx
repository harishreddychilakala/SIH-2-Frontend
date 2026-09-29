import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Bot,
  Scale,
  Apple,
  Layers,
  History,
  Settings,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { settingsService } from '../../services/settingsService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const userSettings = settingsService.getSettings();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recommend', label: 'New Recommendation', icon: Sparkles, highlight: true },
    { to: '/chat', label: 'AI Chat Assistant', icon: Bot, isNew: true },
    { to: '/compare', label: 'Material Comparison', icon: Scale },
    { to: '/commodities', label: 'Food Commodities', icon: Apple },
    { to: '/materials', label: 'Packaging Materials', icon: Layers },
    { to: '/history', label: 'Recommendation History', icon: History },
    { to: '/settings', label: 'Settings & Info', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 90,
            display: 'block',
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transform: isOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)',
        }}
        className={isOpen ? 'sidebar-open' : ''}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem 1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(18, 84, 56, 0.25)',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                PackSmart<span style={{ color: 'var(--teal-600)', marginLeft: '2px' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                SIH26236 DECISION PLATFORM
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{
              display: 'none',
              padding: '0.35rem',
            }}
            id="sidebar-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* SIH Banner Chip */}
        <div style={{ padding: '0.75rem 1.25rem 0.25rem 1.25rem' }}>
          <div
            style={{
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
              Problem Statement SIH26236
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                state={item.to === '/chat' ? { newChat: Date.now() } : undefined}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive
                    ? 'var(--primary)'
                    : item.highlight
                    ? 'var(--text-main)'
                    : 'var(--text-muted)',
                  backgroundColor: isActive
                    ? 'var(--primary-light)'
                    : item.highlight
                    ? 'var(--bg-subtle)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid var(--primary-border)'
                    : item.highlight
                    ? '1px dashed var(--border)'
                    : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                })}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.highlight && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    AI
                  </span>
                )}
                {item.isNew && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--teal-600)',
                      color: '#fff',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Bot
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Card at Bottom */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            <User size={18} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userSettings.userName}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userSettings.organization}
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          aside {
            transform: translateX(-100%);
          }
          aside.sidebar-open {
            transform: translateX(0);
          }
          #sidebar-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};
