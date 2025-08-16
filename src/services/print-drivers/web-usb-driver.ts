
import type { ReceiptData } from '@/lib/types';
import { textToEscPos } from '@/lib/escpos-helper';

const filters = [
    { vendorId: 0x04b8, productId: 0x0202 }, // Epson TM-T20
    { vendorId: 0x0416, productId: 0x5011 }, // Winbond Electronics
];

let connectedDevice: USBDevice | null = null;
let endpoint: USBEndpoint | null = null;

async function findEndpoint(device: USBDevice): Promise<USBEndpoint | null> {
    const configuration = device.configurations[0];
    if (!configuration || !configuration.interfaces) return null;

    for (const iface of configuration.interfaces) {
        for (const alt of iface.alternates) {
            if (alt.interfaceClass === 7) { // 7 is the class for printers
                for (const ep of alt.endpoints) {
                    if (ep.direction === 'out') {
                        return ep;
                    }
                }
            }
        }
    }
    return null;
}

export const WebUsbDriver = {
    async requestAndConnectPrinter(): Promise<USBDevice | null> {
        try {
            const device = await navigator.usb.requestDevice({ filters });
            await device.open();
            await device.selectConfiguration(1);
            
            const foundEndpoint = await findEndpoint(device);
            if (!foundEndpoint) {
                throw new Error("Could not find a valid printer endpoint.");
            }
            endpoint = foundEndpoint;
            
            await device.claimInterface(endpoint.interfaceNumber);
            
            connectedDevice = device;
            return device;
        } catch (error) {
            console.error("WebUSB connection failed:", error);
            // Return null if user cancels the prompt or an error occurs
            return null;
        }
    },

    async disconnectPrinter(): Promise<void> {
        if (connectedDevice) {
            try {
                await connectedDevice.releaseInterface(endpoint!.interfaceNumber);
                await connectedDevice.close();
            } catch (error) {
                console.error("Error during disconnect:", error);
            } finally {
                connectedDevice = null;
                endpoint = null;
            }
        }
    },
    
    async print(data: ReceiptData): Promise<void> {
        if (!connectedDevice || !endpoint) {
            throw new Error("No printer connected. Please connect a printer first in Settings.");
        }
        try {
            const escPosData = textToEscPos(data);
            await connectedDevice.transferOut(endpoint.endpointNumber, escPosData);
        } catch (error) {
            console.error('WebUSB print failed:', error);
            throw new Error('Failed to send data to the printer.');
        }
    }
};
