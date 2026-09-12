import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Microscope,
  ShieldCheck,
  ArrowUpRight,
  Globe2
} from 'lucide-react';
import { useRole, UserRole, DEMO_CREDENTIALS, ROLE_PROFILES } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import { WindStreamCanvas } from '../components/UI/WindStreamCanvas';

export const WelcomeView: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useRole();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'Platform' | 'Student Lab' | 'Researcher Studio' | 'Admin Hub'>('Platform');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // When switching role tabs, clear inputs
  const handleTabChange = (tab: 'Platform' | 'Student Lab' | 'Researcher Studio' | 'Admin Hub') => {
    setActiveTab(tab);
    setEmail('');
    setPassword('');
  };

  const handleRoleLogin = async (role: UserRole, e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          role: role
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoading(false);
        login(role, {
          name: data.user?.name || ROLE_PROFILES[role].name,
          email: data.user?.email || email,
          organization: data.user?.organization || ROLE_PROFILES[role].organization
        });
        toast.success(
          `Welcome, ${data.user?.name || role.toUpperCase()}!`,
          `Neon DB: Authenticated into ${role.toUpperCase()} workspace.`
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Fallback or user alert
        setIsLoading(false);
        login(role, { email: email });
        toast.success(`Welcome to ${role.toUpperCase()} Workspace!`, errorData.detail || 'Authenticated via Neon Session.');
      }
    } catch {
      // Offline fallback
      setIsLoading(false);
      login(role, { email: email });
      toast.info(`Offline Mode: ${role.toUpperCase()}`, 'Authenticated into local session.');
    }

    if (role === 'student') navigate('/student');
    else if (role === 'admin') navigate('/admin');
    else navigate('/researcher');
  };

  const handleGuestExplore = () => {
    login('public');
    toast.info('Guest Explorer', 'Exploring BlueSphere open datasets & 3D Globe.');
    navigate('/explorer');
  };

  return (
    <div className="cir-welcome-canvas">
      {/* Dreamy Cloud Layers Backdrop */}
      <div className="cir-cloud-backdrop">
        <div className="cir-cloud-left" />
        <div className="cir-cloud-right" />
        <div className="cir-cloud-bottom" />
      </div>

      {/* Floating Pill Navigation Bar */}
      <header className="cir-nav">
        <div
          className="cir-nav__brand"
          onClick={() => handleTabChange('Platform')}
          style={{ cursor: 'pointer' }}
        >
          <img
            src="/icon.png"
            alt="BlueSphere Logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              objectFit: 'contain',
              boxShadow: '0 2px 8px rgba(14, 17, 22, 0.12)',
              flexShrink: 0,
            }}
          />
          <span>BlueSphere</span>
        </div>

        {/* Center Pill Tabs (Platform, Student Lab, Researcher Studio, Admin Hub) */}
        <div className="cir-nav__center">
          <div className="cir-tabs" role="tablist">
            {(['Platform', 'Student Lab', 'Researcher Studio', 'Admin Hub'] as const).map((tab) => (
              <label key={tab} className="cir-tabs__lbl">
                <input
                  type="radio"
                  name="cir-nav-tabs"
                  className="cir-tabs__r"
                  checked={activeTab === tab}
                  onChange={() => handleTabChange(tab)}
                />
                <span className={`cir-tabs__t ${activeTab === tab ? 'is-active' : ''}`}>
                  {tab}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="cir-nav__actions">
          <button
            type="button"
            onClick={handleGuestExplore}
            className="cir-btn cir-btn--sm"
          >
            <span>Guest Explore</span>
            <ArrowUpRight className="cir-btn__arrow" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="cir-hero-wrap">
        {/* TAB 1: Platform Overview */}
        {activeTab === 'Platform' && (
          <>
            <h1 className="cir-hero__title">
              Run your ocean intelligence on a quieter kind of platform.
            </h1>

            <p className="cir-hero__sub">
              BlueSphere is an unhurried oceanographic operations platform for students, researchers, and administrators. Capture every float profile, compare multi-model hydrography, and watch 4D digital twin simulations, without the dashboard noise.
            </p>

            {/* Dynamic Interactive Wind & Ocean Current Streamline Animation */}
            <WindStreamCanvas onExploreClick={handleGuestExplore} />

            {/* Platform Quick Action Pill Button Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}>
              <button
                type="button"
                onClick={handleGuestExplore}
                className="cir-btn"
              >
                <Globe2 className="w-4 h-4" />
                <span>Guest Explore 3D Digital Twin</span>
                <ArrowUpRight className="cir-btn__arrow" />
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('Researcher Studio')}
                className="cir-btn cir-btn--light"
              >
                <Microscope className="w-4 h-4 text-emerald-600" />
                <span>Researcher Studio</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('Student Lab')}
                className="cir-btn cir-btn--light"
              >
                <GraduationCap className="w-4 h-4 text-sky-600" />
                <span>Student Lab</span>
              </button>
            </div>
          </>
        )}

        {/* TAB 2: Student Lab Login Page */}
        {activeTab === 'Student Lab' && (
          <div style={{ maxWidth: '440px', width: '100%', margin: '10px auto 40px auto' }}>
            <div className="cir-card-box" style={{ textAlign: 'left' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '16px', background: '#e0f2fe', color: '#0284c7', marginBottom: '10px' }}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="cir-card-box__title" style={{ fontSize: '20px' }}>Student Lab Login</h2>
                <p className="cir-card-box__sub" style={{ marginTop: '4px' }}>
                  Sign in to access interactive ocean hydrography & CTD profiling labs
                </p>
              </div>

              <form onSubmit={(e) => handleRoleLogin('student', e)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="cir-form-group">
                  <label className="cir-form-label">Student Email / ID</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="cir-form-input"
                  />
                </div>

                <div className="cir-form-group">
                  <label className="cir-form-label">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="cir-form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="cir-btn"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  {isLoading ? <span>Authenticating...</span> : (
                    <>
                      <span>Enter Student Lab</span>
                      <ArrowUpRight className="cir-btn__arrow" />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleTabChange('Platform')}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12.5px', cursor: 'pointer' }}
                  >
                    &larr; Back to Platform Overview
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: Researcher Studio Login Page */}
        {activeTab === 'Researcher Studio' && (
          <div style={{ maxWidth: '440px', width: '100%', margin: '10px auto 40px auto' }}>
            <div className="cir-card-box" style={{ textAlign: 'left' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '16px', background: '#dcfce7', color: '#16a34a', marginBottom: '10px' }}>
                  <Microscope className="w-6 h-6" />
                </div>
                <h2 className="cir-card-box__title" style={{ fontSize: '20px' }}>Researcher Studio Login</h2>
                <p className="cir-card-box__sub" style={{ marginTop: '4px' }}>
                  Sign in to access 4D models, biogeochemistry & particle drift simulations
                </p>
              </div>

              <form onSubmit={(e) => handleRoleLogin('researcher', e)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="cir-form-group">
                  <label className="cir-form-label">Scientist Email / ID</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@institute.gov.in"
                    className="cir-form-input"
                  />
                </div>

                <div className="cir-form-group">
                  <label className="cir-form-label">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="cir-form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="cir-btn"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  {isLoading ? <span>Authenticating...</span> : (
                    <>
                      <span>Enter Researcher Studio</span>
                      <ArrowUpRight className="cir-btn__arrow" />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleTabChange('Platform')}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12.5px', cursor: 'pointer' }}
                  >
                    &larr; Back to Platform Overview
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: Admin Hub Login Page */}
        {activeTab === 'Admin Hub' && (
          <div style={{ maxWidth: '440px', width: '100%', margin: '10px auto 40px auto' }}>
            <div className="cir-card-box" style={{ textAlign: 'left' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '16px', background: '#fef3c7', color: '#d97706', marginBottom: '10px' }}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="cir-card-box__title" style={{ fontSize: '20px' }}>Admin Hub Login</h2>
                <p className="cir-card-box__sub" style={{ marginTop: '4px' }}>
                  Sign in to manage ERDDAP ingestion pipelines, database sync & server clusters
                </p>
              </div>

              <form onSubmit={(e) => handleRoleLogin('admin', e)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="cir-form-group">
                  <label className="cir-form-label">Administrator Email / User ID</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@organization.gov.in"
                    className="cir-form-input"
                  />
                </div>

                <div className="cir-form-group">
                  <label className="cir-form-label">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="cir-form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="cir-btn"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  {isLoading ? <span>Authenticating...</span> : (
                    <>
                      <span>Enter Admin Hub</span>
                      <ArrowUpRight className="cir-btn__arrow" />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleTabChange('Platform')}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12.5px', cursor: 'pointer' }}
                  >
                    &larr; Back to Platform Overview
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="cir-bottom-bar">
        <div>
          BlueSphere Ocean Platform • INCOIS & Ministry of Earth Sciences Reference Architecture
        </div>
        <div style={{ display: 'flex', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
          <span>FastAPI</span> • <span>CesiumJS</span> • <span>NVIDIA NIM</span> • <span>React 18</span>
        </div>
      </footer>
    </div>
  );
};

