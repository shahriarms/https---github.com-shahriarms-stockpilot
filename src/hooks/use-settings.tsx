
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { AppSettings } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const SETTINGS_STORAGE_KEY = 'stockpilot-settings';

const defaultSettings: AppSettings = {
    printFormat: 'normal',
    locale: 'en',
    printMethod: 'html',
};

// This function can be used by other client-side services to get settings without needing the hook
export const getSettings = (): AppSettings | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
}


interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadedSettings = getSettings();
    if(loadedSettings) {
        setSettings(loadedSettings);
        document.documentElement.lang = loadedSettings.locale;
    }
    setIsLoading(false);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => {
        const updated = { ...prevSettings, ...newSettings };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        if (newSettings.locale) {
            document.documentElement.lang = newSettings.locale;
        }
        toast({
            title: "Settings Updated",
            description: "Your changes have been saved.",
        });
        return updated;
    });
  }, [toast]);
  
  const value = useMemo(() => ({ settings, updateSettings, isLoading }), [settings, updateSettings, isLoading]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
