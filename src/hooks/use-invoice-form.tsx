
'use client';

import { useState, createContext, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { InvoiceItem } from '@/lib/types';
import { useToast } from './use-toast';

export interface DraftInvoice {
    id: string;
    items: InvoiceItem[];
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

export function InvoiceFormProvider({ children }: { children: ReactNode }) {
    const [drafts, setDrafts] = useState<DraftInvoice[]>([]);
    const [activeDraftIndex, setActiveDraftIndex] = useState(0);
    const [isFormLoading, setFormLoading] = useState(true);
    const { toast } = useToast();

    // Load drafts from localStorage on initial render
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
    
    // Save drafts to localStorage whenever they change
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
        setActiveDraftIndex(drafts.length); // Switch to the new draft
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
        setDrafts(prev => {
            return prev.map((draft, index) => {
                if (index === activeDraftIndex) {
                    const updatedDraft = { ...draft, ...update };
                    
                    if (update.items) {
                        updatedDraft.subtotal = update.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
                    }
                    
                    updatedDraft.dueAmount = updatedDraft.subtotal - updatedDraft.paidAmount;

                    return updatedDraft;
                }
                return draft;
            });
        });
    }, [activeDraftIndex]);

    const value = useMemo(() => ({
        drafts,
        activeDraftIndex,
        activeDraft,
        addNewDraft,
        removeDraft,
        setActiveDraftIndex,
        updateActiveDraft,
        isFormLoading,
    }), [drafts, activeDraftIndex, activeDraft, addNewDraft, removeDraft, updateActiveDraft, isFormLoading]);

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
