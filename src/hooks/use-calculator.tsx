
'use client';

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

type SetValueCallback = (value: number) => void;
type TargetSetter = ((callback: SetValueCallback) => void) | null;

interface CalculatorContextType {
  targetValue: SetValueCallback | null;
  setTargetValue: React.Dispatch<React.SetStateAction<TargetSetter>>;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [targetValue, setTargetValue] = useState<TargetSetter>(null);

  const value = useMemo(() => ({ 
    targetValue: targetValue as SetValueCallback | null, 
    setTargetValue 
  }), [targetValue, setTargetValue]);

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
}
