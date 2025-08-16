
'use client';

import { useState, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { ConnectedPrinter, PrintMethod } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { WebUsbDriver } from '@/services/print-drivers/web-usb-driver';
import { bluetoothDriver } from '@/services/print-drivers/bluetooth-driver';

interface PrinterContextType {
  connectedPrinter: ConnectedPrinter | null;
  isConnecting: boolean;
  requestAndConnectPrinter: (method: 'webusb' | 'bluetooth') => Promise<void>;
  disconnectPrinter: () => Promise<void>;
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export function PrinterProvider({ children }: { children: ReactNode }) {
  const [connectedPrinter, setConnectedPrinter] = useState<ConnectedPrinter | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const requestAndConnectPrinter = useCallback(async (method: 'webusb' | 'bluetooth') => {
    setIsConnecting(true);
    try {
      let device;
      if (method === 'webusb') {
        device = await WebUsbDriver.requestAndConnectPrinter();
      } else {
        device = await bluetoothDriver.requestAndConnectPrinter();
      }
      
      if (device) {
        const printerInfo: ConnectedPrinter = {
          type: method,
          productName: device.name || (device as USBDevice).productName || 'Unknown Printer',
          vendorId: (device as USBDevice).vendorId,
          productId: (device as USBDevice).productId,
        };
        setConnectedPrinter(printerInfo);
        toast({
          title: "Printer Connected",
          description: `Successfully connected to ${printerInfo.productName}.`,
        });
      }
    } catch (error: any) {
      console.error(`Failed to connect to ${method} printer`, error);
      toast({
        variant: "destructive",
        title: "Printer Connection Error",
        description: error.message || `Could not connect to the ${method} printer.`,
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);
  
  const disconnectPrinter = useCallback(async () => {
    if (!connectedPrinter) return;

    try {
        if (connectedPrinter.type === 'webusb') {
            await WebUsbDriver.disconnectPrinter();
        } else if (connectedPrinter.type === 'bluetooth') {
            await bluetoothDriver.disconnectPrinter();
        }
        
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
  }, [toast, connectedPrinter]);

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
