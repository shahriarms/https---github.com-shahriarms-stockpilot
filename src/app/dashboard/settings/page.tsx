
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettings } from '@/hooks/use-settings';
import type { PrintFormat, Locale, PrintMethod } from '@/lib/types';
import { Printer, Receipt, Usb, Globe, LinkIcon, XCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { usePrinter } from '@/hooks/use-printer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
    const { settings, updateSettings } = useSettings();
    const { t } = useTranslation();
    const { connectedPrinter, requestAndConnectPrinter, disconnectPrinter, isConnecting } = usePrinter();

    const handlePrintFormatChange = (value: string) => {
        updateSettings({ printFormat: value as PrintFormat });
    };
    
    const handlePrintMethodChange = (value: string) => {
        updateSettings({ printMethod: value as PrintMethod });
    };

    const handleLocaleChange = (value: string) => {
        updateSettings({ locale: value as Locale });
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">{t('settings_page_title')}</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Printing Method</CardTitle>
                    <CardDescription>Choose how receipts are printed.</CardDescription>
                </CardHeader>
                <CardContent>
                     <RadioGroup
                        value={settings.printMethod}
                        onValueChange={handlePrintMethodChange}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <Label htmlFor="html" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer">
                            <RadioGroupItem value="html" id="html" className="sr-only"/>
                            <Globe className="mb-3 h-6 w-6" />
                            Browser Print (HTML)
                            <p className="text-xs text-muted-foreground mt-1 text-center">Standard print preview dialog. Works with any printer.</p>
                        </Label>
                        <Label htmlFor="webusb" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer">
                            <RadioGroupItem value="webusb" id="webusb" className="sr-only" />
                            <Usb className="mb-3 h-6 w-6" />
                            Direct Thermal Print (WebUSB)
                            <p className="text-xs text-muted-foreground mt-1 text-center">Fast, direct printing without a preview. Requires compatible thermal printer.</p>
                        </Label>
                    </RadioGroup>
                </CardContent>
            </Card>

            {settings.printMethod === 'webusb' && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Thermal Printer Setup (WebUSB)</CardTitle>
                        <CardDescription>Connect and manage your USB thermal printer.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
                        {connectedPrinter ? (
                            <>
                                <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/50 w-full">
                                    <p className="text-green-800 dark:text-green-300">Connected to:</p>
                                    <p className="font-semibold text-lg text-green-900 dark:text-green-200">{connectedPrinter.productName}</p>
                                    <Badge variant="secondary" className="mt-2">Vendor ID: {connectedPrinter.vendorId} | Product ID: {connectedPrinter.productId}</Badge>
                                </div>
                                <Button variant="destructive" onClick={disconnectPrinter}>
                                    <XCircle className="mr-2 h-4 w-4"/>
                                    Disconnect Printer
                                </Button>
                            </>
                        ) : (
                             <>
                                <p className="text-muted-foreground">No printer connected. Click the button to select and connect your printer.</p>
                                <Button onClick={requestAndConnectPrinter} disabled={isConnecting}>
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    {isConnecting ? 'Connecting...' : 'Connect to Printer'}
                                </Button>
                             </>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t('print_settings_title')}</CardTitle>
                    <CardDescription>{t('print_settings_description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={settings.printFormat}
                        onValueChange={handlePrintFormatChange}
                        className="grid grid-cols-2 gap-4"
                    >
                        
                            <Label htmlFor="normal" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer">
                                <RadioGroupItem value="normal" id="normal" className="sr-only"/>
                                <Printer className="mb-3 h-6 w-6" />
                                {t('normal_a4_label')}
                            </Label>
                        
                            <Label htmlFor="pos" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer">
                                <RadioGroupItem value="pos" id="pos" className="sr-only" />
                                <Receipt className="mb-3 h-6 w-6" />
                                {t('pos_receipt_label')}
                            </Label>
                        
                    </RadioGroup>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t('language_settings_title')}</CardTitle>
                    <CardDescription>{t('language_settings_description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={settings.locale}
                        onValueChange={handleLocaleChange}
                        className="grid grid-cols-2 gap-4"
                    >
                        
                            <Label htmlFor="en" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer">
                                <RadioGroupItem value="en" id="en" className="sr-only"/>
                                <span className="font-bold text-lg mb-3">EN</span>
                                {t('language_english')}
                            </Label>
                        
                            <Label htmlFor="bn" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer">
                                <RadioGroupItem value="bn" id="bn" className="sr-only" />
                                <span className="font-bold text-lg mb-3">বাংলা</span>
                                {t('language_bengali')}
                            </Label>
                        
                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
    );
}
