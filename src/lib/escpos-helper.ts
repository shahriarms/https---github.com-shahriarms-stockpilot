
import type { ReceiptData } from './types';

// ESC/POS Commands
const ESC = 0x1B;
const GS = 0x1D;

const INIT_PRINTER = [ESC, 0x40];
const ALIGN_LEFT = [ESC, 0x61, 0];
const ALIGN_CENTER = [ESC, 0x61, 1];
const ALIGN_RIGHT = [ESC, 0x61, 2];
const BOLD_ON = [ESC, 0x45, 1];
const BOLD_OFF = [ESC, 0x45, 0];
const DBL_HEIGHT_WIDTH_ON = [GS, 0x21, 0x30]; // Double height and width
const DBL_HEIGHT_WIDTH_OFF = [GS, 0x21, 0];
const FEED_AND_CUT = [GS, 0x56, 1];
const LF = 0x0A; // Line feed

function stringToBytes(str: string): number[] {
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(str));
}

function generateLine(text: string, width = 48): string {
    return text.padEnd(width);
}

function generateItemLine(name: string, qty: number, price: number, width = 48): string {
    const total = (qty * price).toFixed(2);
    const namePart = name.substring(0, width - 12);
    const qtyPart = ` ${qty}x${price.toFixed(2)}`.padStart(10);
    const totalPart = total.padStart(width - namePart.length - qtyPart.length);
    
    let line = `${namePart}${totalPart}`;
    line = line.substring(0, line.length - qtyPart.length) + qtyPart;

    return line;
}

export function textToEscPos(data: ReceiptData): Uint8Array {
    let commands: number[] = [];

    const add = (arr: number[]) => commands.push(...arr);
    const addText = (text: string, withLf = true) => {
        add(stringToBytes(text));
        if (withLf) add([LF]);
    };
    const addLf = (count = 1) => {
        for (let i = 0; i < count; i++) {
            add([LF]);
        }
    };
    
    const receiptWidth = 48; // Standard for 80mm paper

    // Initialize
    add(INIT_PRINTER);

    // Header
    add(ALIGN_CENTER);
    add(DBL_HEIGHT_WIDTH_ON);
    addText(data.shopName);
    add(DBL_HEIGHT_WIDTH_OFF);
    if(data.shopDescription) addText(data.shopDescription);
    if(data.email) addText(data.email);
    addLf();

    // Info
    add(ALIGN_LEFT);
    addText(generateLine(`Date: ${data.date}`, receiptWidth));
    addText(generateLine(`Invoice: ${data.invoiceId.slice(-8)}`, receiptWidth));
    addText(generateLine(`Customer: ${data.customerName}`, receiptWidth));
    addLf();

    // Items
    add(BOLD_ON);
    addText(generateLine('Item                         Qty   Total', receiptWidth));
    add(BOLD_OFF);
    addText('-'.repeat(receiptWidth));

    data.items.forEach(item => {
        const itemLine = `${item.name} (${item.quantity}x${item.price.toFixed(2)})`;
        const total = (item.quantity * item.price).toFixed(2);
        const line = `${itemLine.padEnd(receiptWidth - total.length)}${total}`;
        addText(line);
    });
    addText('-'.repeat(receiptWidth));

    // Totals
    add(ALIGN_RIGHT);
    addText(`Subtotal: ${data.subtotal.toFixed(2)}  `);
    addText(`Paid: ${data.paidAmount.toFixed(2)}  `);
    add(BOLD_ON);
    addText(`Due: ${data.dueAmount.toFixed(2)}  `);
    add(BOLD_OFF);
    addLf();
    
    // Footer
    add(ALIGN_CENTER);
    if(data.footerText) addText(data.footerText);
    addLf(3);

    // Cut paper
    add(FEED_AND_CUT);

    return new Uint8Array(commands);
}
