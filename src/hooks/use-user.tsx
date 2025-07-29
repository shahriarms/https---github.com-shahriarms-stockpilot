
'use client';

import { useState, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useToast } from './use-toast';

type Role = 'admin' | 'employee';

interface User {
  name: string;
  role: Role;
}

interface UserContextType {
  user: User;
  setUserRole: (role: Role) => void;
  switchToAdmin: (pin: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const ADMIN_PIN = "shahriar.ms1k@gmail.com";

export function UserProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User>({
    name: 'Current User',
    role: 'employee', 
  });

  const setUserRole = useCallback((role: Role) => {
    setUser((prevUser) => ({ ...prevUser, role }));
  }, []);

  const switchToAdmin = useCallback((pin: string): boolean => {
    if (pin === ADMIN_PIN) {
      setUserRole('admin');
      toast({
        title: 'Success',
        description: 'You are now in Admin mode.',
      });
      return true;
    } else {
      toast({
        variant: 'destructive',
        title: 'Incorrect PIN',
        description: 'The PIN you entered is incorrect.',
      });
      return false;
    }
  }, [setUserRole, toast]);

  const value = useMemo(() => ({ user, setUserRole, switchToAdmin }), [user, setUserRole, switchToAdmin]);

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
