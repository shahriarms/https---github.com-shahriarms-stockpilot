// src/app/api/print/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ThermalPrinter, PrinterTypes, BreakLineType } from 'node-thermal-printer';
import getPixels from 'get-pixels';
import { join } from 'path';

// This is a server-side only file.

// Helper function to promisify get-pixels
const getPixelsAsync = (path: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        getPixels(path, (err, pixels) => {
            if(err) {
                return reject(new Error("Bad image path"));
            }
            resolve(pixels);
        });
    });
};

async function getPrinter(config: any): Promise<ThermalPrinter> {
    let printerType: PrinterTypes;

    switch (config.type.toLowerCase()) {
        case 'tcp':
            printerType = PrinterTypes.EPSON; // Most network printers use Epson protocol
            break;
        case 'usb':
            printerType = PrinterTypes.STAR; // STAR is a common type for USB
            break;
        case 'serial':
            printerType = PrinterTypes.EPSON;
            break;
        default:
            throw new Error(`Unsupported printer type: ${config.type}`);
    }

    const printer = new ThermalPrinter({
        type: printerType,
        interface: config.type === 'tcp' ? `tcp://${config.options.host}:${config.options.port}` : config.options?.port,
        characterSet: 'PC437_USA',
        removeSpecialCharacters: false,
        lineCharacter: "=",
        breakLine: BreakLineType.WORD,
        options: {
            timeout: 5000,
            ...config.options
        }
    });

    return printer;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { printer: printerConfig, data: orderData } = body;

        if (!printerConfig || !orderData) {
            return NextResponse.json({ message: 'Missing printer configuration or order data' }, { status: 400 });
        }
        
        const printer = await getPrinter(printerConfig);

        const isConnected = await printer.isPrinterConnected();
        if (!isConnected) {
            console.error('Printer not connected.');
            return NextResponse.json({ message: 'Printer is not connected or offline.' }, { status: 500 });
        }

        // --- Start Printing Logic ---
        printer.alignCenter();
        
        // Print logo (ensure the image exists in the public folder)
        try {
            const imagePath = join(process.cwd(), 'public', 'logo-print.png');
            const pixels = await getPixelsAsync(imagePath);
            await printer.printImage(pixels);
        } catch (imgErr) {
            console.warn("Could not print logo. Make sure 'public/logo-print.png' exists. Error:", imgErr);
            printer.println("MAHMUD ENGINEERING SHOP");
        }

        printer.println("123 Workshop Lane, Dhaka");
        printer.println("Phone: 012-345-6789");
        printer.newLine();

        printer.alignLeft();
        printer.println(`Order ID: ${orderData.orderId}`);
        printer.println(`Customer: ${orderData.customerName}`);
        printer.println(`Date: ${new Date().toLocaleString()}`);
        printer.drawLine();

        // Table Header
        printer.tableCustom([
            { text: "Item", align: "LEFT", width: 0.5 },
            { text: "Qty", align: "CENTER", width: 0.15 },
            { text: "Price", align: "RIGHT", width: 0.15 },
            { text: "Total", align: "RIGHT", width: 0.20 }
        ]);

        // Table Body
        for (const item of orderData.items) {
            printer.tableCustom([
                { text: item.name, align: "LEFT", width: 0.5 },
                { text: item.quantity.toString(), align: "CENTER", width: 0.15 },
                { text: `$${item.price.toFixed(2)}`, align: "RIGHT", width: 0.15 },
                { text: `$${(item.quantity * item.price).toFixed(2)}`, align: "RIGHT", width: 0.20 }
            ]);
        }
        printer.drawLine();

        // Totals
        printer.alignRight();
        printer.println(`Subtotal: $${orderData.subtotal.toFixed(2)}`);
        printer.println(`Tax: $${orderData.tax.toFixed(2)}`);
        printer.bold(true);
        printer.println(`Total: $${orderData.total.toFixed(2)}`);
        printer.bold(false);
        printer.newLine();

        // Barcode & QR Code
        printer.alignCenter();
        printer.println("Scan to see order details:");
        printer.printQR(`https://example.com/order/${orderData.orderId}`);
        printer.newLine();
        printer.printBarcode(orderData.orderId.replace(/[^0-9]/g, ''));
        printer.newLine();

        // Final message
        printer.println("Thank you for your business!");
        printer.newLine();

        // Cut paper and open cash drawer
        printer.cut();
        printer.openCashDrawer();

        // Execute all commands
        await printer.execute();
        console.log("Print job sent successfully.");
        
        return NextResponse.json({ message: 'Receipt printed successfully' });

    } catch (error: any) {
        console.error("Printing API Error:", error);
        // Provide a more specific error message if possible
        const errorMessage = error.message.includes('LIBUSB_ERROR_ACCESS') 
            ? 'Permission error accessing USB device. Try running with sudo or setting up udev rules.'
            : error.message.includes('ENOTFOUND')
            ? `Could not connect to printer at ${error.hostname}. Check IP address.`
            : error.message || 'An unknown error occurred during printing.';
        
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
