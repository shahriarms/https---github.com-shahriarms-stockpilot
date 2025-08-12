
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettings } from '@/hooks/use-settings';
import type { PrintFormat } from '@/lib/types';
import { Printer, Receipt } from 'lucide-react';

export default function SettingsPage() {
    const { settings, updateSettings } = useSettings();

    const handlePrintFormatChange = (value: string) => {
        updateSettings({ printFormat: value as PrintFormat });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Print Settings</CardTitle>
                    <CardDescription>Choose the default format for printing invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={settings.printFormat}
                        onValueChange={handlePrintFormatChange}
                    >
                        <div className="flex items-center space-x-4">
                            <RadioGroupItem value="normal" id="normal" className="sr-only"/>
                            <Label htmlFor="normal" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer">
                                <Printer className="mb-3 h-6 w-6" />
                                Normal (A4)
                            </Label>
                            <RadioGroupItem value="pos" id="pos" className="sr-only" />
                             <Label htmlFor="pos" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer">
                                <Receipt className="mb-3 h-6 w-6" />
                                POS Receipt
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
    );
}
