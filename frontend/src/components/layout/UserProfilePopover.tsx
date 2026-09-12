import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Building, Award, BookOpen, ShieldCheck, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole, UserRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';

export const UserProfilePopover: React.FC = () => {
  const navigate = useNavigate();
  const { profile, currentRole, logout } = useRole();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    toast.info('Session Ended', 'Logged out successfully. Returning to Welcome Portal.');
    navigate('/welcome');
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="ui-btn ui-btn-outline ui-btn-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          borderRadius: 'var(--radius-full)',
          height: '32px',
        }}
        title="View Active User Profile"
        aria-label="User Profile"
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-contrast)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '11px',
          }}
        >
          {profile.name.charAt(0)}
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {profile.name.split(' ')[0]}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '38px',
            width: '300px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: '14px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-contrast)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {profile.name.charAt(0)}
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {profile.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Badge variant="primary" style={{ fontSize: '9px', padding: '1px 4px' }}>
                    {currentRole.toUpperCase()}
                  </Badge>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    {profile.email}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
              <Building className="w-4 h-4 text-[var(--primary)] shrink-0" style={{ marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Organization</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{profile.organization}</span>
              </div>
            </div>

            {profile.department && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                <BookOpen className="w-4 h-4 text-[var(--primary)] shrink-0" style={{ marginTop: '2px' }} />
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Department</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{profile.department}</span>
                </div>
              </div>
            )}

            {profile.researchArea && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                <Award className="w-4 h-4 text-[var(--primary)] shrink-0" style={{ marginTop: '2px' }} />
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Research Area</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{profile.researchArea}</span>
                </div>
              </div>
            )}
          </div>

          {/* Logout Action */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Session: <span style={{ color: 'var(--success)', fontWeight: 600 }}>Authenticated</span>
            </span>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
