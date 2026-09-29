import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Building2,
  Briefcase,
  ArrowRight,
  Leaf,
  AlertCircle,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Packaging Technologist');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        organization: organization.trim() || 'Agricultural Research Organization',
        role: role.trim() || 'Packaging Technologist',
      });
      showToast('Registration successful! Account created in Neon DB.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              marginBottom: '1rem',
              boxShadow: '0 8px 20px rgba(18, 84, 56, 0.3)',
            }}
          >
            <Leaf size={28} />
          </div>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              marginBottom: '0.35rem',
            }}
          >
            Create Authorized Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Register to evaluate food barrier matrices and generate recommendation reports.
          </p>
        </div>

        {/* Registration Card */}
        <div
          className="card"
          style={{
            padding: '2.25rem 2rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name" style={{ fontWeight: 600 }}>
                Full Name & Title <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <User size={16} />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Dr. Harish Reddy"
                  className="input-control"
                  style={{ paddingLeft: '2.4rem' }}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email" style={{ fontWeight: 600 }}>
                Work Email <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Mail size={16} />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="user@agritech.com"
                  className="input-control"
                  style={{ paddingLeft: '2.4rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-org" style={{ fontWeight: 600 }}>
                  Organization / University
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Building2 size={16} />
                  </div>
                  <input
                    id="reg-org"
                    type="text"
                    placeholder="e.g. Agritech Foods Lab"
                    className="input-control"
                    style={{ paddingLeft: '2.4rem' }}
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-role" style={{ fontWeight: 600 }}>
                  Role / Specialization
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Briefcase size={16} />
                  </div>
                  <input
                    id="reg-role"
                    type="text"
                    placeholder="e.g. Food Technologist"
                    className="input-control"
                    style={{ paddingLeft: '2.4rem' }}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password" style={{ fontWeight: 600 }}>
                  Password <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Lock size={16} />
                  </div>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    className="input-control"
                    style={{ paddingLeft: '2.4rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm-password" style={{ fontWeight: 600 }}>
                  Confirm Password <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Lock size={16} />
                  </div>
                  <input
                    id="reg-confirm-password"
                    type="password"
                    required
                    placeholder="Re-enter password"
                    className="input-control"
                    style={{ paddingLeft: '2.4rem' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                justifyContent: 'center',
                fontWeight: 700,
                marginTop: '0.5rem',
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Registering in Neon Database...</span>
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            Already have an authorized account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Sign In Here
            </Link>
          </div>
        </div>

        {/* Security / DB Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <Database size={14} style={{ color: 'var(--teal-600)' }} />
          <span>User identity securely managed in Neon PostgreSQL</span>
        </div>
      </div>
    </div>
  );
};
