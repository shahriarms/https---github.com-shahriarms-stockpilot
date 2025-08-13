
'use client';

import { useState, createContext, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { InvoiceItem } from '@/lib/types';

interface DraftInvoice {
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
    clearAllDrafts: () => void;
}

const InvoiceFormContext = createContext<InvoiceFormContextType | undefined>(undefined);

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

    // Initialize with one draft if none exist
    useEffect(() => {
        if (drafts.length === 0) {
            setDrafts([createNewDraft()]);
            setActiveDraftIndex(0);
        }
    }, [drafts.length]);
    
    const activeDraft = useMemo(() => drafts[activeDraftIndex] || null, [drafts, activeDraftIndex]);
    
    const addNewDraft = useCallback(() => {
        const newDraft = createNewDraft();
        setDrafts(prev => [...prev, newDraft]);
        setActiveDraftIndex(drafts.length); // Switch to the new draft
    }, [drafts.length]);
    
    const removeDraft = useCallback((draftId: string) => {
        setDrafts(prev => {
            const newDrafts = prev.filter(d => d.id !== draftId);
            if (newDrafts.length === 0) {
                // If last draft is removed, create a new one
                setActiveDraftIndex(0);
                return [createNewDraft()];
            }
            // Adjust active index if necessary
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
                    
                    // Recalculate subtotal if items change
                    if (update.items) {
                        updatedDraft.subtotal = update.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
                    }
                    
                    // Recalculate due amount if subtotal or paidAmount changes
                    updatedDraft.dueAmount = updatedDraft.subtotal - updatedDraft.paidAmount;

                    return updatedDraft;
                }
                return draft;
            });
        });
    }, [activeDraftIndex]);

    const clearAllDrafts = useCallback(() => {
        setDrafts([createNewDraft()]);
        setActiveDraftIndex(0);
    }, []);

    const value = useMemo(() => ({
        drafts,
        activeDraftIndex,
        activeDraft,
        addNewDraft,
        removeDraft,
        setActiveDraftIndex,
        updateActiveDraft,
        clearAllDrafts
    }), [drafts, activeDraftIndex, activeDraft, addNewDraft, removeDraft, updateActiveDraft, clearAllDrafts]);

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
