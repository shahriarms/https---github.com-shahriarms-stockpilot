
'use client';

import { useState, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';

type Role = 'admin' | 'employee';

interface User {
  name: string;
  role: Role;
}

interface UserContextType {
  user: User;
  setUserRole: (role: Role) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({
    name: 'Current User',
    role: 'admin', 
  });

  const setUserRole = useCallback((role: Role) => {
    setUser((prevUser) => ({ ...prevUser, role }));
  }, []);

  const value = useMemo(() => ({ user, setUserRole }), [user, setUserRole]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
