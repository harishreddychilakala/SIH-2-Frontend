import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sparkles,
  Search,
  Check,
  Info,
  AlertCircle,
  User,
  LogOut,
  Building2,
  LayoutDashboard,
  Package,
  MessageSquare,
  Scale,
  Wheat,
  History,
  Settings,
  ShieldCheck,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../context/AuthContext';
import type { NotificationItem } from '../../types';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const NAV_LINKS = [
  { to: '/dashboard',   label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/recommend',   label: 'New Rec',          icon: Sparkles        },
  { to: '/chat',        label: 'AI Chat',          icon: MessageSquare   },
  { to: '/compare',     label: 'Compare',          icon: Scale           },
  { to: '/commodities', label: 'Commodities',      icon: Wheat           },
  { to: '/materials',   label: 'Materials',        icon: Package         },
  { to: '/history',     label: 'History',          icon: History         },
  { to: '/settings',    label: 'Settings',         icon: Settings        },
];

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar: _onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = settingsService.getSettings().theme;
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowMobileNav(false);
  }, [location.pathname]);

  useEffect(() => {
    setNotifications(settingsService.getNotifications());
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    const currentSettings = settingsService.getSettings();
    settingsService.saveSettings({ ...currentSettings, theme: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: press "/" or "cmd+k" to open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setShowQuickSearch(true);
      }
      if (e.key === 'Escape') {
        setShowQuickSearch(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    const updated = settingsService.markAsRead(id);
    setNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = settingsService.markAllAsRead();
    setNotifications(updated);
  };

  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return { title: 'Dashboard', path: 'Dashboard' };
    if (path.startsWith('/recommendation/')) return { title: 'Recommendation Results', path: 'Results' };
    if (path.startsWith('/recommend')) return { title: 'Generate Recommendation', path: 'Recommendation Engine' };
    if (path.startsWith('/chat')) return { title: 'AI Packaging Assistant', path: 'PackBot AI' };
    if (path.startsWith('/compare')) return { title: 'Material Comparison', path: 'Comparator' };
    if (path.startsWith('/commodities')) return { title: 'Food Commodities Catalog', path: 'Commodities' };
    if (path.startsWith('/materials')) return { title: 'Packaging Materials Library', path: 'Materials' };
    if (path.startsWith('/history')) return { title: 'Recommendation History', path: 'History Ledger' };
    if (path.startsWith('/settings')) return { title: 'System Settings & Info', path: 'Settings' };
    return { title: 'PackSmart AI', path: 'Overview' };
  };

  const pageInfo = getPageInfo();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowQuickSearch(false);
      navigate(`/commodities?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => {
    if (path === '/recommend') return location.pathname === '/recommend';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        style={{
          height: 'var(--header-height)',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          gap: '1rem',
          boxShadow: 'var(--shadow-xs)',
          transition: 'all var(--transition-normal)',
        }}
      >
        {/* ── LEFT: brand logo + breadcrumb ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setShowMobileNav((prev) => !prev)}
            className="btn btn-ghost btn-sm"
            style={{ display: 'none', padding: '0.4rem', color: 'var(--text-main)' }}
            id="mobile-nav-toggle"
            aria-label="Toggle navigation menu"
          >
            {showMobileNav ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-biotech)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px var(--primary-glow)',
                flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                PackSmart<span style={{ color: 'var(--primary-vivid)', marginLeft: '1px' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                BioTech Decision Engine
              </div>
            </div>
          </Link>

          <div
            style={{
              width: '1px',
              height: '24px',
              backgroundColor: 'var(--border)',
              margin: '0 0.25rem',
            }}
            className="header-breadcrumb-divider"
          />

          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}
            className="header-breadcrumb-item"
          >
            <span
              style={{
                fontWeight: 700,
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                fontSize: '0.75rem',
              }}
            >
              {pageInfo.path}
            </span>
          </div>
        </div>

        {/* ── CENTER: full page navigation bar ── */}
        <nav
          id="top-nav-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            flex: 1,
            justifyContent: 'center',
            background: 'var(--bg-subtle)',
            padding: '0.25rem 0.4rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            maxWidth: '660px',
          }}
          aria-label="Main navigation"
        >
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                state={to === '/chat' ? { newChat: Date.now() } : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--text-main)' : 'var(--text-muted)',
                  backgroundColor: active ? 'var(--bg-surface)' : 'transparent',
                  boxShadow: active ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  border: active ? '1px solid var(--border)' : '1px solid transparent',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)',
                }}
                className="top-nav-link"
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={14} style={{ flexShrink: 0, color: active ? 'var(--primary-vivid)' : 'currentColor' }} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── RIGHT: theme toggle + search + new rec + bell + user ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-subtle)',
              transition: 'all var(--transition-fast)',
            }}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={17} style={{ color: '#fbbf24' }} />
            ) : (
              <Moon size={17} style={{ color: 'var(--primary)' }} />
            )}
          </button>

          {/* Quick search */}
          <button
            type="button"
            onClick={() => setShowQuickSearch(true)}
            className="btn btn-secondary btn-sm"
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
            }}
            aria-label="Quick search"
            title="Quick search (press / or ⌘K)"
          >
            <Search size={14} />
            <span style={{ fontSize: '0.8125rem' }}>Search</span>
            <kbd
              style={{
                fontSize: '0.68rem',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '0.1rem 0.35rem',
                color: 'var(--text-subtle)',
                fontFamily: 'inherit',
                fontWeight: 600,
              }}
            >
              /
            </kbd>
          </button>

          {/* New Recommendation CTA */}
          <Link
            to="/recommend"
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
          >
            <Sparkles size={14} />
            <span>New Rec</span>
          </Link>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn btn-ghost btn-sm"
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                padding: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-subtle)',
              }}
              aria-label="View notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'var(--primary-vivid)',
                    borderRadius: '50%',
                    boxShadow: '0 0 0 2px var(--bg-surface)',
                  }}
                />
              )}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '340px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border)',
                  zIndex: 200,
                  overflow: 'hidden',
                  animation: 'modalPop 0.15s ease-out',
                }}
              >
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-subtle)',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    Notifications ({unreadCount} unread)
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-vivid)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        style={{
                          padding: '0.85rem 1rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: notif.read ? 'transparent' : 'var(--primary-light)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '0.75rem',
                          transition: 'background-color var(--transition-fast)',
                        }}
                      >
                        <div style={{ marginTop: '2px' }}>
                          {notif.type === 'success' ? (
                            <Check size={16} style={{ color: 'var(--success-text)' }} />
                          ) : notif.type === 'warning' ? (
                            <AlertCircle size={16} style={{ color: 'var(--warning-text)' }} />
                          ) : (
                            <Info size={16} style={{ color: 'var(--info-text)' }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: notif.read ? 500 : 700, color: 'var(--text-main)' }}>
                            {notif.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.3 }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
                            {notif.timestamp}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          {isAuthenticated && user && (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="btn btn-ghost btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-subtle)',
                }}
                title="User Account"
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--gradient-biotech)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.fullName.split(' ')[0]}
                </span>
              </button>

              {showUserMenu && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    padding: '1rem',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--bg-surface)',
                    animation: 'modalPop 0.15s ease-out',
                  }}
                >
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {user.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {user.email}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--teal-700)', backgroundColor: 'var(--teal-50)', padding: '0.15rem 0.5rem', borderRadius: '4px', marginTop: '0.4rem' }}>
                      <Building2 size={12} /> {user.organization || 'PackSmart Agritech'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <Link
                      to="/settings"
                      className="btn btn-ghost btn-sm"
                      style={{ justifyContent: 'flex-start', width: '100%', fontSize: '0.8125rem' }}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={14} /> Profile & Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn btn-ghost btn-sm"
                      style={{ justifyContent: 'flex-start', width: '100%', fontSize: '0.8125rem', color: 'var(--danger-text)' }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile Navigation Dropdown ── */}
      {showMobileNav && (
        <div
          id="mobile-nav-dropdown"
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            padding: '0.75rem 1rem 1rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            zIndex: 49,
            maxHeight: 'calc(100vh - var(--header-height))',
            overflowY: 'auto',
          }}
        >
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                state={to === '/chat' ? { newChat: Date.now() } : undefined}
                onClick={() => setShowMobileNav(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--primary-vivid)' : 'var(--text-main)',
                  backgroundColor: active ? 'var(--primary-light)' : 'transparent',
                  border: active ? '1px solid var(--primary-border)' : '1px solid transparent',
                  textDecoration: 'none',
                }}
              >
                <Icon size={18} style={{ color: active ? 'var(--primary-vivid)' : 'var(--text-muted)' }} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Quick Search Modal ── */}
      {showQuickSearch && (
        <div className="modal-overlay" onClick={() => setShowQuickSearch(false)}>
          <div
            className="modal-container"
            style={{ maxWidth: '540px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Search size={20} style={{ color: 'var(--primary-vivid)', flexShrink: 0 }} />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search food commodities or packaging materials..."
                  className="input-control"
                  style={{ border: 'none', boxShadow: 'none', fontSize: '1.05rem', padding: '0.25rem 0', background: 'transparent' }}
                />
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Press Enter to search catalog
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowQuickSearch(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* Top nav link hover state */
        .top-nav-link:hover {
          color: var(--text-main) !important;
          background-color: var(--bg-hover) !important;
        }

        /* Responsive: hide center nav, show mobile hamburger */
        @media (max-width: 1100px) {
          #top-nav-bar {
            display: none !important;
          }
          #mobile-nav-toggle {
            display: flex !important;
          }
          .header-breadcrumb-divider,
          .header-breadcrumb-item {
            display: none !important;
          }
          header {
            padding: 0 1rem !important;
          }
        }

        /* Compact nav on mid-range screens */
        @media (max-width: 1380px) and (min-width: 1101px) {
          .top-nav-link span {
            display: none;
          }
          .top-nav-link {
            padding: 0.45rem 0.6rem !important;
          }
        }
      `}</style>
    </>
  );
};

