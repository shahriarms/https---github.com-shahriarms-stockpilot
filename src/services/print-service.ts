
'use client';

import { AppSettings, ReceiptData } from '@/lib/types';
import { getSettings } from '@/hooks/use-settings';
import { htmlDriver } from './print-drivers/html-driver';
import { WebUsbDriver } from './print-drivers/web-usb-driver';
import { networkDriver } from './print-drivers/network-driver';
import { bluetoothDriver } from './print-drivers/bluetooth-driver';

const getDriver = (settings: AppSettings) => {
    switch (settings.printMethod) {
        case 'webusb':
            return WebUsbDriver;
        case 'network':
            return networkDriver;
        case 'bluetooth':
            return bluetoothDriver;
        case 'html':
        default:
            return htmlDriver;
    }
}

export const printService = {
    async printReceipt(receiptData: ReceiptData) {
        try {
            const settings = getSettings();
            if (!settings) {
                throw new Error("Settings not loaded.");
            }
            
            const receiptPayload = {
                ...receiptData,
                items: receiptData.items.map(item => ({...item, total: item.quantity * item.price })),
            };

            const driver = getDriver(settings);
            // Pass settings to the driver, as some drivers (like network) might need it
            await (driver as any).print(receiptPayload, settings);

        } catch (error: any) {
            console.error("Printing failed:", error);
            // We can use a more user-friendly error system later
            alert(`Printing Error: ${error.message}`);
        }
    }
};
