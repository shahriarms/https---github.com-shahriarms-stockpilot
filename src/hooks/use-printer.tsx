
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { ConnectedPrinter } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { WebUsbDriver } from '@/services/print-drivers/web-usb-driver';

interface PrinterContextType {
  connectedPrinter: ConnectedPrinter | null;
  isConnecting: boolean;
  requestAndConnectPrinter: () => Promise<void>;
  disconnectPrinter: () => Promise<void>;
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export function PrinterProvider({ children }: { children: ReactNode }) {
  const [connectedPrinter, setConnectedPrinter] = useState<ConnectedPrinter | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Removed the problematic useEffect that was trying to access USB devices on load.
  // The connection should only be initiated by a user gesture.

  const requestAndConnectPrinter = useCallback(async () => {
    setIsConnecting(true);
    try {
      const printer = await WebUsbDriver.requestAndConnectPrinter();
      if (printer) {
        setConnectedPrinter({
            productName: printer.productName || 'Unknown Printer',
            vendorId: printer.vendorId,
            productId: printer.productId,
        });
        toast({
          title: "Printer Connected",
          description: `Successfully connected to ${printer.productName}.`,
        });
      } else {
        // This case might occur if the user closes the permission dialog without selecting a device.
        // A toast is not always necessary here, as it's a user-driven action.
        console.log("No printer selected by the user.");
      }
    } catch (error: any) {
      console.error("Failed to connect to printer", error);
      toast({
        variant: "destructive",
        title: "Printer Connection Error",
        description: error.message || "Could not connect to the printer.",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);
  
  const disconnectPrinter = useCallback(async () => {
    try {
        await WebUsbDriver.disconnectPrinter();
        setConnectedPrinter(null);
        toast({
            title: "Printer Disconnected",
            description: "The printer has been successfully disconnected.",
        });
    } catch (error: any) {
         console.error("Failed to disconnect printer", error);
         toast({
            variant: "destructive",
            title: "Disconnection Error",
            description: error.message || "Could not disconnect the printer.",
        });
    }
  }, [toast]);

  const value = useMemo(() => ({
    connectedPrinter,
    isConnecting,
    requestAndConnectPrinter,
    disconnectPrinter,
  }), [connectedPrinter, isConnecting, requestAndConnectPrinter, disconnectPrinter]);

  return (
    <PrinterContext.Provider value={value}>
      {children}
    </PrinterContext.Provider>
  );
}

export function usePrinter() {
  const context = useContext(PrinterContext);
  if (context === undefined) {
    throw new Error('usePrinter must be used within a PrinterProvider');
  }
  return context;
}
