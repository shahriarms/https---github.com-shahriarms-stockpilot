// src/app/dashboard/pos-terminal/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- Demo Order Data ---
const demoOrder = {
  orderId: 'ORD-12345',
  customerName: 'John Doe',
  items: [
    { name: 'Angel 1" 4mm', quantity: 2, price: 10.50 },
    { name: 'Screwdriver Set', quantity: 1, price: 22.50 },
    { name: 'Nails 2" (box)', quantity: 5, price: 7.50 },
  ],
  subtotal: 81.00,
  tax: 4.05,
  total: 85.05,
  paymentMethod: 'Cash',
};

// --- Printer Configuration ---
// IMPORTANT: Choose ONE configuration and comment out the others.
// The backend will use this configuration to connect to the printer.

// Option 1: USB Printer (Recommended for most cases on Windows/Linux)
// On Linux, you might need to set up udev rules. See README.
// On Windows, you might need to use Zadig to install the correct driver. See README.
const printerConfig = {
  type: 'usb', 
  // No options needed for the first detected USB thermal printer
  // To specify a printer, use: options: { vendorId: '0x...', productId: '0x...' }
};

// Option 2: Network (Ethernet/WiFi) Printer
/*
const printerConfig = {
  type: 'tcp',
  options: {
    host: '192.168.1.123', // Replace with your printer's IP address
    port: 9100,           // Default for most network printers
  },
};
*/

// Option 3: Serial Port Printer (Less common for modern systems)
/*
const printerConfig = {
    type: 'serial',
    options: {
        port: '/dev/ttyS0', // Example for Linux
        // port: 'COM3',    // Example for Windows
        baudRate: 9600,
    }
}
*/


export default function PosTerminalPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePrint = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printer: printerConfig,
          data: demoOrder,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'An unknown error occurred');
      }

      toast({
        title: 'Print Job Sent',
        description: 'Receipt has been sent to the printer successfully.',
      });

    } catch (err: any) {
      console.error('Printing failed:', err);
      setError(err.message || 'Failed to connect to the printer or send data.');
      toast({
        variant: 'destructive',
        title: 'Printing Error',
        description: err.message || 'Could not print the receipt.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">POS Terminal</h1>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Printing Failed</AlertTitle>
          <AlertDescription>
            {error}
            <br />
            Please check your printer connection and the configuration in this file. Refer to the README for troubleshooting steps.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Demo Order</CardTitle>
          <CardDescription>
            This is a sample order that will be sent to your thermal printer.
            Edit the `printerConfig` object in <strong>/src/app/dashboard/pos-terminal/page.tsx</strong> to match your printer setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p><strong>Order ID:</strong> {demoOrder.orderId}</p>
            <p><strong>Customer:</strong> {demoOrder.customerName}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoOrder.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${demoOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${demoOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${demoOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handlePrint} disabled={isLoading} size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Printer className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Printing...' : 'Print Receipt'}
        </Button>
      </div>
    </div>
  );
}
