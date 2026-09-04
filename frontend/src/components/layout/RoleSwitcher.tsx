import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, GraduationCap, Microscope, Globe, 
  ChevronDown, Check, UserCheck 
} from 'lucide-react';
import { useRole, UserRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../UI/Badge';

interface RoleOption {
  id: UserRole;
  label: string;
  description: string;
  icon: any;
  badge: 'neutral' | 'primary' | 'success' | 'warning';
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'public',
    label: 'Public / Open Access',
    description: 'General exploration, public datasets & 3D Earth',
    icon: Globe,
    badge: 'neutral',
  },
  {
    id: 'student',
    label: 'Student / Educational',
    description: 'Guided modules, learning charts & observation profiles',
    icon: GraduationCap,
    badge: 'primary',
  },
  {
    id: 'researcher',
    label: 'Researcher (Default)',
    description: 'Model comparison, statistical analytics, 4D engine & export',
    icon: Microscope,
    badge: 'success',
  },
  {
    id: 'admin',
    label: 'Platform Administrator',
    description: 'Data ingestion, external URLs, system health & user management',
    icon: Shield,
    badge: 'warning',
  },
];

export const RoleSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentRole, setRole, profile } = useRole();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = ROLE_OPTIONS.find((r) => r.id === currentRole) || ROLE_OPTIONS[2];
  const IconComponent = activeOption.icon;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    setIsOpen(false);
    toast.info(`Switched workspace to ${role.toUpperCase()}`, `Loaded profile: ${profile.name}`);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="ui-btn ui-btn-outline ui-btn-sm flex items-center gap-2 border-[var(--border)] hover:border-[var(--primary)]"
        title="Switch Development Role (No Login Required)"
        aria-expanded={isOpen}
      >
        <IconComponent className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
        <span className="font-semibold text-xs text-[var(--text-primary)]">
          {activeOption.label.split(' ')[0]}
        </span>
        <Badge variant={activeOption.badge} className="text-[9px] py-0 px-1">
          {currentRole}
        </Badge>
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-1.5 z-[100] animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1.5 border-b border-[var(--border-subtle)] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Development Role Switcher
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Instantly toggle workspace permissions & tools
            </span>
          </div>

          <div className="space-y-1">
            {ROLE_OPTIONS.map((opt) => {
              const ItemIcon = opt.icon;
              const isSelected = opt.id === currentRole;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectRole(opt.id)}
                  className={`w-full p-2 rounded-[var(--radius-md)] text-left flex items-start gap-2.5 transition-colors ${
                    isSelected
                      ? 'bg-[var(--primary-subtle)] border border-[var(--primary)]/30'
                      : 'hover:bg-[var(--bg-surface-hover)] border border-transparent'
                  }`}
                >
                  <ItemIcon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[var(--text-primary)]">
                        {opt.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-tight">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
