
'use client';

import { useState, createContext, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { InvoiceItem, Product } from '@/lib/types';
import { useToast } from './use-toast';

export interface DraftInvoiceItem extends InvoiceItem {
    originalPrice: number;
}

export interface DraftInvoice {
    id: string;
    items: DraftInvoiceItem[];
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    paidAmount: number;
    subtotal: number;
    dueAmount: number;
}

interface InvoiceFormContextType {
    drafts: DraftInvoice[];
    activeDraftIndex: number;
    activeDraft: DraftInvoice | null;
    addNewDraft: () => void;
    removeDraft: (draftId: string) => void;
    setActiveDraftIndex: (index: number) => void;
    updateActiveDraft: (update: Partial<Omit<DraftInvoice, 'id' | 'subtotal' | 'dueAmount'>>) => void;
    addInvoiceItem: (product: Product) => void;
    updateInvoiceItem: (itemId: string, update: Partial<DraftInvoiceItem>) => void;
    removeInvoiceItem: (itemId: string) => void;
    resetActiveDraft: () => void;
    isFormLoading: boolean;
}

const InvoiceFormContext = createContext<InvoiceFormContextType | undefined>(undefined);

const INVOICE_DRAFTS_KEY = 'stockpilot-invoice-drafts';

const createNewDraft = (): DraftInvoice => ({
    id: `draft-${Date.now()}`,
    items: [],
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    paidAmount: 0,
    subtotal: 0,
    dueAmount: 0,
});

const calculateTotals = (items: DraftInvoiceItem[], paidAmount: number) => {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // If a valid payment is made (greater than 0), calculate due. Otherwise, due is 0.
    const dueAmount = paidAmount > 0 ? subtotal - paidAmount : 0;
    return { subtotal, dueAmount };
}

export function InvoiceFormProvider({ children }: { children: ReactNode }) {
    const [drafts, setDrafts] = useState<DraftInvoice[]>([]);
    const [activeDraftIndex, setActiveDraftIndex] = useState(0);
    const [isFormLoading, setFormLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const savedDrafts = localStorage.getItem(INVOICE_DRAFTS_KEY);
            if (savedDrafts) {
                const parsedDrafts = JSON.parse(savedDrafts);
                if (Array.isArray(parsedDrafts) && parsedDrafts.length > 0) {
                    setDrafts(parsedDrafts);
                    setActiveDraftIndex(0);
                } else {
                     setDrafts([createNewDraft()]);
                }
            } else {
                setDrafts([createNewDraft()]);
            }
        } catch (error) {
            console.error("Failed to load invoice drafts from localStorage", error);
            setDrafts([createNewDraft()]);
        }
        setFormLoading(false);
    }, []);
    
    useEffect(() => {
        if (!isFormLoading) {
            localStorage.setItem(INVOICE_DRAFTS_KEY, JSON.stringify(drafts));
        }
    }, [drafts, isFormLoading]);
    
    const activeDraft = useMemo(() => drafts[activeDraftIndex] || null, [drafts, activeDraftIndex]);
    
    const addNewDraft = useCallback(() => {
        if (drafts.length >= 10) {
            toast({
                variant: 'destructive',
                title: "Memo Limit Reached",
                description: "You can only have a maximum of 10 open memos at a time.",
            });
            return;
        }
        const newDraft = createNewDraft();
        setDrafts(prev => [...prev, newDraft]);
        setActiveDraftIndex(drafts.length);
    }, [drafts.length, toast]);
    
    const removeDraft = useCallback((draftId: string) => {
        setDrafts(prev => {
            const newDrafts = prev.filter(d => d.id !== draftId);
            if (newDrafts.length === 0) {
                setActiveDraftIndex(0);
                return [createNewDraft()];
            }
            if (activeDraftIndex >= newDrafts.length) {
                setActiveDraftIndex(newDrafts.length - 1);
            }
            return newDrafts;
        });
    }, [activeDraftIndex]);

    const updateActiveDraft = useCallback((update: Partial<Omit<DraftInvoice, 'id' | 'subtotal' | 'dueAmount'>>) => {
        setDrafts(prev => prev.map((draft, index) => {
            if (index === activeDraftIndex) {
                const updatedDraft = { ...draft, ...update };
                const { subtotal, dueAmount } = calculateTotals(updatedDraft.items, updatedDraft.paidAmount);
                updatedDraft.subtotal = subtotal;
                updatedDraft.dueAmount = dueAmount;
                return updatedDraft;
            }
            return draft;
        }));
    }, [activeDraftIndex]);

    const addInvoiceItem = useCallback((product: Product) => {
        setDrafts(prev => prev.map((draft, index) => {
            if (index !== activeDraftIndex) return draft;

            const existingItem = draft.items.find(item => item.id === product.id);
            let newItems;
            if (existingItem) {
                newItems = draft.items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            } else {
                const newItem: DraftInvoiceItem = {
                    id: product.id,
                    name: product.name,
                    quantity: 1,
                    price: product.sellingPrice,
                    originalPrice: product.sellingPrice,
                };
                newItems = [...draft.items, newItem];
            }
            const { subtotal, dueAmount } = calculateTotals(newItems, draft.paidAmount);
            return { ...draft, items: newItems, subtotal, dueAmount };
        }));
    }, [activeDraftIndex]);
    
    const updateInvoiceItem = useCallback((itemId: string, itemUpdate: Partial<DraftInvoiceItem>) => {
        setDrafts(prev => prev.map((draft, index) => {
            if (index !== activeDraftIndex) return draft;
            const newItems = draft.items.map(item => item.id === itemId ? { ...item, ...itemUpdate } : item);
            const { subtotal, dueAmount } = calculateTotals(newItems, draft.paidAmount);
            return { ...draft, items: newItems, subtotal, dueAmount };
        }));
    }, [activeDraftIndex]);

    const removeInvoiceItem = useCallback((itemId: string) => {
        setDrafts(prev => prev.map((draft, index) => {
            if (index !== activeDraftIndex) return draft;
            const newItems = draft.items.filter(item => item.id !== itemId);
            const { subtotal, dueAmount } = calculateTotals(newItems, draft.paidAmount);
            return { ...draft, items: newItems, subtotal, dueAmount };
        }));
    }, [activeDraftIndex]);

    const resetActiveDraft = useCallback(() => {
        setDrafts(prev => prev.map((draft, index) => {
            if (index === activeDraftIndex) {
                return createNewDraft();
            }
            return draft;
        }));
    }, [activeDraftIndex]);


    const value = useMemo(() => ({
        drafts,
        activeDraftIndex,
        activeDraft,
        addNewDraft,
        removeDraft,
        setActiveDraftIndex,
        updateActiveDraft,
        addInvoiceItem,
        updateInvoiceItem,
        removeInvoiceItem,
        resetActiveDraft,
        isFormLoading,
    }), [drafts, activeDraftIndex, activeDraft, addNewDraft, removeDraft, setActiveDraftIndex, updateActiveDraft, addInvoiceItem, updateInvoiceItem, removeInvoiceItem, resetActiveDraft, isFormLoading]);

    return (
        <InvoiceFormContext.Provider value={value}>
            {children}
        </InvoiceFormContext.Provider>
    );
}

export function useInvoiceForm() {
    const context = useContext(InvoiceFormContext);
    if (context === undefined) {
        throw new Error('useInvoiceForm must be used within an InvoiceFormProvider');
    }
    return context;
}
