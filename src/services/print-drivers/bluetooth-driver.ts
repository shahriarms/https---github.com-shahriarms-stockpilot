
import type { ReceiptData } from '@/lib/types';
import { textToEscPos } from '@/lib/escpos-helper';

// Web Bluetooth API constants for Serial Port Profile (SPP)
const SPP_SERVICE_UUID = '00001101-0000-1000-8000-00805f9b34fb';

let connectedDevice: BluetoothDevice | null = null;
let printCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

export const bluetoothDriver = {
    async requestAndConnectPrinter(): Promise<BluetoothDevice | null> {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [SPP_SERVICE_UUID] }],
                // Optional: accept all devices to see more options, but filtering is better.
                // acceptAllDevices: true,
            });

            if (!device.gatt) {
                throw new Error("GATT Server not available on this device.");
            }

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(SPP_SERVICE_UUID);
            
            // This is a common characteristic UUID for SPP-like services.
            // It might need to be discovered dynamically if it differs.
            const characteristic = await service.getCharacteristic('00001101-0000-1000-8000-00805f9b34fb');

            connectedDevice = device;
            printCharacteristic = characteristic;

            return device;
        } catch (error) {
            console.error("Bluetooth connection failed:", error);
            return null;
        }
    },

    async disconnectPrinter(): Promise<void> {
        if (connectedDevice && connectedDevice.gatt && connectedDevice.gatt.connected) {
            connectedDevice.gatt.disconnect();
        }
        connectedDevice = null;
        printCharacteristic = null;
    },

    async print(data: ReceiptData): Promise<void> {
        if (!connectedDevice || !printCharacteristic) {
            throw new Error("No Bluetooth printer connected.");
        }

        try {
            const escPosData = textToEscPos(data);
            // Bluetooth printing often requires sending data in smaller chunks.
            const chunkSize = 100;
            for (let i = 0; i < escPosData.length; i += chunkSize) {
                const chunk = escPosData.slice(i, i + chunkSize);
                await printCharacteristic.writeValueWithoutResponse(chunk);
            }
        } catch (error) {
            console.error('Bluetooth print failed:', error);
            throw new Error('Failed to send data to the Bluetooth printer.');
        }
    }
};
