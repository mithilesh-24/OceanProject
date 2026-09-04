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

const ROLE_PROFILES: Record<UserRole, UserProfile> = {
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

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'oceanvis_user_role';

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
    return 'researcher'; // Default role for rich scientific experience
  });

  const [profiles, setProfiles] = useState<Record<UserRole, UserProfile>>(ROLE_PROFILES);

  useEffect(() => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
    } catch {
      // ignore
    }
  }, [currentRole]);

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
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
