
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { SalaryPayment, Employee } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useEmployees } from './use-employees';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface SalaryContextType {
  payments: SalaryPayment[];
  addSalaryPayment: (payment: Omit<SalaryPayment, 'id'>) => void;
  getPaymentsForMonth: (employeeId: string, date: Date) => SalaryPayment[];
  getDueSalaryForMonth: (employee: Employee, date: Date) => number;
}

const SalaryContext = createContext<SalaryContextType | undefined>(undefined);

export function SalaryProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const { toast } = useToast();
  const { employees } = useEmployees();

  useEffect(() => {
    try {
      const savedPayments = localStorage.getItem('stockpilot-salary-payments');
      if (savedPayments) {
        setPayments(JSON.parse(savedPayments));
      }
    } catch (error) {
      console.error("Failed to load salary payments from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem('stockpilot-salary-payments', JSON.stringify(payments));
    }
  }, [payments]);

  const addSalaryPayment = useCallback((paymentData: Omit<SalaryPayment, 'id'>) => {
    const newPayment: SalaryPayment = {
      ...paymentData,
      id: `sal-${Date.now()}`,
    };
    setPayments(prev => [newPayment, ...prev]);
  }, []);

  const getPaymentsForMonth = useCallback((employeeId: string, date: Date): SalaryPayment[] => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    return payments
        .filter(p => p.employeeId === employeeId && isWithinInterval(new Date(p.date), { start: monthStart, end: monthEnd }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments]);

  const getDueSalaryForMonth = useCallback((employee: Employee, date: Date): number => {
      if (!employee) return 0;
      const paymentsThisMonth = getPaymentsForMonth(employee.id, date);
      const totalPaid = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);
      return employee.salary - totalPaid;
  }, [getPaymentsForMonth]);


  const value = useMemo(() => ({
    payments,
    addSalaryPayment,
    getPaymentsForMonth,
    getDueSalaryForMonth,
  }), [payments, addSalaryPayment, getPaymentsForMonth, getDueSalaryForMonth]);

  return (
    <SalaryContext.Provider value={value}>
      {children}
    </SalaryContext.Provider>
  );
}

export function useSalaries() {
  const context = useContext(SalaryContext);
  if (context === undefined) {
    throw new Error('useSalaries must be used within a SalaryProvider');
  }
  return context;
}
