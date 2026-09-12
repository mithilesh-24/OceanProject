import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'public' | 'student' | 'researcher' | 'admin';

export interface UserProfile {
  name: string;
  email: string;
  organization: string;
  department?: string;
  course?: string;
  year?: string;
  researchArea?: string;
  role: UserRole;
  avatarUrl?: string;
}

export const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  public: {
    name: 'Guest Scientist',
    email: 'visitor@ocean-data.org',
    organization: 'Open Ocean Observatory',
    role: 'public',
  },
  student: {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@oceanuniv.edu.in',
    organization: 'Indian Institute of Technology (IIT) Madras',
    department: 'Department of Ocean Engineering',
    course: 'M.Tech Physical Oceanography',
    year: '2nd Year (2025–2026)',
    role: 'student',
  },
  researcher: {
    name: 'Dr. Sunita Varma',
    email: 's.varma@incois.gov.in',
    organization: 'INCOIS (Ministry of Earth Sciences)',
    department: 'Ocean Dynamics & Modeling Division',
    researchArea: 'Indian Ocean Hydrography & Marine Heatwaves',
    role: 'researcher',
  },
  admin: {
    name: 'System Administrator',
    email: 'admin@sih2026-ocean.gov.in',
    organization: 'National Ocean Data Center',
    department: 'Infrastructure & Data Ingestion',
    role: 'admin',
  },
};

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; defaultPass: string; roleLabel: string }> = {
  student: {
    email: 'aarav.sharma@oceanuniv.edu.in',
    defaultPass: 'student123',
    roleLabel: 'Student Scholar',
  },
  researcher: {
    email: 's.varma@incois.gov.in',
    defaultPass: 'researcher123',
    roleLabel: 'Ocean Scientist',
  },
  admin: {
    email: 'admin@sih2026-ocean.gov.in',
    defaultPass: 'admin123',
    roleLabel: 'Platform Administrator',
  },
  public: {
    email: 'visitor@ocean-data.org',
    defaultPass: '',
    roleLabel: 'Guest Explorer',
  },
};

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  login: (role: UserRole, customProfile?: Partial<UserProfile>) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'oceanvis_user_role';
const AUTH_STORAGE_KEY = 'oceanvis_auth_status';

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem(ROLE_STORAGE_KEY);
      if (stored && (stored === 'public' || stored === 'student' || stored === 'researcher' || stored === 'admin')) {
        return stored as UserRole;
      }
    } catch {
      // ignore
    }
    return 'researcher'; // Default role
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      return storedAuth === 'true';
    } catch {
      return true; // Default authenticated for frictionless direct navigation
    }
  });

  const [profiles, setProfiles] = useState<Record<UserRole, UserProfile>>(ROLE_PROFILES);

  useEffect(() => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
    } catch {
      // ignore
    }
  }, [currentRole]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, String(isAuthenticated));
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const login = (role: UserRole, customProfile?: Partial<UserProfile>) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    if (customProfile) {
      setProfiles((prev) => ({
        ...prev,
        [role]: {
          ...prev[role],
          ...customProfile,
        },
      }));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentRole('public');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfiles((prev) => ({
      ...prev,
      [currentRole]: {
        ...prev[currentRole],
        ...updates,
      },
    }));
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setRole,
        profile: profiles[currentRole],
        updateProfile,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

