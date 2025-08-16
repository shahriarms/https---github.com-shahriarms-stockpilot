
import { NextResponse, type NextRequest } from 'next/server';
import escpos from 'escpos';
import { Network } from 'escpos-network';
import type { ReceiptData } from '@/lib/types';
import { textToEscPos } from '@/lib/escpos-helper';

// This is needed to use the library in Node.js environment
escpos.Network = Network;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { receiptData, ip, port } = body as { receiptData: ReceiptData, ip: string, port: number };

    if (!receiptData || !ip || !port) {
      return NextResponse.json({ message: 'Missing required parameters: receiptData, ip, or port.' }, { status: 400 });
    }

    const device = new escpos.Network(ip, port);
    const printer = new escpos.Printer(device);

    const commands = textToEscPos(receiptData);

    return new Promise((resolve) => {
      device.open((error: any) => {
        if (error) {
          console.error('Network printer connection error:', error);
          resolve(NextResponse.json({ message: 'Could not connect to the network printer.', details: error.message }, { status: 500 }));
          return;
        }

        printer.raw(Buffer.from(commands)).close(() => {
          resolve(NextResponse.json({ message: 'Print successful' }, { status: 200 }));
        });
      });
    });

  } catch (error: any) {
    console.error('API /print Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}
