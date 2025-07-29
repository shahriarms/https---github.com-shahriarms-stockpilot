
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import app from '@/lib/firebase/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type Role = 'admin' | 'employee';

interface User {
  uid: string;
  email: string | null;
  role: Role;
}

interface UserContextType {
  user: User | null;
  setUserRole: (role: Role) => void;
  switchToAdmin: (pin: string) => boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const ADMIN_PIN = "shahriar.ms1k@gmail.com";
const ADMIN_EMAIL = "shahriar.ms1k@gmail.com";

export function UserProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const isUserAdmin = firebaseUser.email === ADMIN_EMAIL;
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: isUserAdmin ? 'admin' : 'employee',
        });
      } else {
        setUser(null);
        if (pathname !== '/login' && pathname !== '/signup') {
            router.push('/login');
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const setUserRole = useCallback((role: Role) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, role } : null));
  }, []);

  const switchToAdmin = useCallback((pin: string): boolean => {
    if (user && user.email !== ADMIN_EMAIL) {
        toast({
            variant: 'destructive',
            title: 'Permission Denied',
            description: 'Only the designated admin user can switch to the admin role.',
        });
        return false;
    }
    
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
  }, [user, setUserRole, toast]);

  const value = useMemo(() => ({ user, setUserRole, switchToAdmin, isLoading }), [user, setUserRole, switchToAdmin, isLoading]);

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

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
