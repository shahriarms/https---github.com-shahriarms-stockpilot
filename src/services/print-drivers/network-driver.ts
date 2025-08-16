
import type { AppSettings, ReceiptData } from '@/lib/types';

export const networkDriver = {
    async print(receiptData: ReceiptData, settings: AppSettings): Promise<void> {
        const { networkPrinter } = settings;
        if (!networkPrinter || !networkPrinter.ip || !networkPrinter.port) {
            throw new Error("Network printer IP and Port are not configured in settings.");
        }

        try {
            const response = await fetch('/api/print', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiptData,
                    ip: networkPrinter.ip,
                    port: networkPrinter.port,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Server failed to print: ${errorData.message} (Status: ${response.status})`);
            }

            const result = await response.json();
            console.log('Print server response:', result.message);

        } catch (error) {
            console.error('Network print failed:', error);
            throw new Error('Failed to send print job to the server.');
        }
    }
};
