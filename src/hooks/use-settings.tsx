
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { AppSettings, PrintFormat, Locale, POSPrinterType } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const SETTINGS_STORAGE_KEY = 'stockpilot-settings';

const defaultSettings: AppSettings = {
    printFormat: 'normal',
    locale: 'en',
    posPrinterType: 'disabled',
    posPrinterHost: '',
    posPrinterPort: 9100,
};

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
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        // Merge saved settings with defaults to ensure all keys are present
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
      setSettings(defaultSettings);
    }
    setIsLoading(false);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    if (newSettings.locale) {
        document.documentElement.lang = newSettings.locale;
    }
    toast({
        title: "Settings Updated",
        description: "Your changes have been saved.",
    });
  }, [settings, toast]);
  
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
