
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Expense } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const initialExpenses: Expense[] = [
    { id: 'exp-1', category: 'Rent', description: 'Office rent for July', amount: 1200, date: new Date(2024, 6, 1).toISOString(), paymentMethod: 'Bank' },
    { id: 'exp-2', category: 'Utility', description: 'Electricity Bill', amount: 150, date: new Date(2024, 6, 15).toISOString(), paymentMethod: 'bKash' },
    { id: 'exp-3', category: 'Salary', description: 'John Doe - July Salary', amount: 2500, date: new Date(2024, 6, 30).toISOString(), paymentMethod: 'Bank' },
    { id: 'exp-4', category: 'Equipment', description: 'New Printer', amount: 350, date: new Date(2024, 5, 20).toISOString(), paymentMethod: 'Card' },
];

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expenseId: string, updatedData: Omit<Expense, 'id'>) => void;
  deleteExpense: (expenseId: string) => void;
  isLoading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem('stockpilot-expenses');
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      } else {
        // For demonstration, you might want to start with some initial data
         setExpenses(initialExpenses);
      }
    } catch (error) {
      console.error("Failed to load expenses from localStorage", error);
       setExpenses(initialExpenses);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('stockpilot-expenses', JSON.stringify(expenses));
    }
  }, [expenses, isLoading]);

  const addExpense = useCallback((expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses(prev => [newExpense, ...prev]);
    toast({
      title: "Expense Added",
      description: `New expense of $${expenseData.amount} has been recorded.`,
    });
  }, [toast]);

  const updateExpense = useCallback((expenseId: string, updatedData: Omit<Expense, 'id'>) => {
    setExpenses(prev =>
      prev.map(e => (e.id === expenseId ? { id: expenseId, ...updatedData } : e))
    );
    toast({
      title: "Expense Updated",
      description: "The expense details have been successfully updated.",
    });
  }, [toast]);
    
  const deleteExpense = useCallback((expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    toast({
      title: "Expense Deleted",
      description: "The expense record has been removed.",
    });
  }, [toast]);
  
  const value = useMemo(() => ({ expenses, addExpense, updateExpense, deleteExpense, isLoading }), [expenses, addExpense, updateExpense, deleteExpense, isLoading]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
