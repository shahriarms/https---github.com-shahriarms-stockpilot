
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
  isLoading: boolean;
  logout: () => Promise<void>;
  generateAdminCode: () => string;
  redeemAdminCode: (code: string) => boolean;
  adminCode: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const ADMIN_EMAIL = "shahriar.ms1k@gmail.com";

export function UserProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);

  useEffect(() => {
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
  }, [router, pathname, auth]);

  const logout = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    setAdminCode(null);
    router.push('/login');
  }, [auth, router]);

  const generateAdminCode = useCallback(() => {
    if (user?.email === ADMIN_EMAIL) {
      const newCode = `ADMIN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setAdminCode(newCode);
       toast({
        title: 'Admin Code Generated',
        description: 'You can now share this code with an employee.',
      });
      return newCode;
    }
    return '';
  }, [user, toast]);

  const redeemAdminCode = useCallback((code: string) => {
    if (code === '' || code !== adminCode) {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'The code you entered is incorrect or has expired.',
      });
      return false;
    }

    if (user && code === adminCode) {
      setUser(prevUser => prevUser ? { ...prevUser, role: 'admin' } : null);
      setAdminCode(null); // Invalidate the code after use
      toast({
        title: 'Success!',
        description: 'You now have admin privileges for this session.',
      });
      return true;
    }
    
    return false;
  }, [user, adminCode, toast]);
  

  const value = useMemo(() => ({ user, isLoading, logout, generateAdminCode, redeemAdminCode, adminCode }), [user, isLoading, logout, generateAdminCode, redeemAdminCode, adminCode]);

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
