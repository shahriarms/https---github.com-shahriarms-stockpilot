
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettings } from '@/hooks/use-settings';
import type { PrintFormat, Locale } from '@/lib/types';
import { Printer, Receipt } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function SettingsPage() {
    const { settings, updateSettings } = useSettings();
    const { t } = useTranslation();

    const handlePrintFormatChange = (value: string) => {
        updateSettings({ printFormat: value as PrintFormat });
    };

    const handleLocaleChange = (value: string) => {
        updateSettings({ locale: value as Locale });
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">{t('settings_page_title')}</h1>
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
