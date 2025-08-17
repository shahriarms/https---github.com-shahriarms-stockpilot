
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useInvoices } from '@/hooks/use-invoices';
import { useExpenses } from '@/hooks/use-expenses';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import type { Invoice, InvoiceItem } from '@/lib/types';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Dashboard() {
  const { getInvoicesForDateRange } = useInvoices();
  const { getExpensesForDateRange, getExpensesForDay } = useExpenses();
  const { t } = useTranslation();

  const [date, setDate] = useState<Date>(new Date());
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const monthlyInvoices = useMemo(() => getInvoicesForDateRange(monthStart, monthEnd), [getInvoicesForDateRange, monthStart, monthEnd]);
  const monthlyExpenses = useMemo(() => getExpensesForDateRange(monthStart, monthEnd), [getExpensesForDateRange, monthStart, monthEnd]);
  const todayExpenses = useMemo(() => getExpensesForDay(new Date()), [getExpensesForDay]);

  const stats = useMemo(() => {
    const totalSales = monthlyInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalSales - totalExpenses;
    const todayTotalExpenses = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return { totalSales, totalExpenses, profit, todayTotalExpenses };
  }, [monthlyInvoices, monthlyExpenses, todayExpenses]);
  
  const dailySalesChartData = useMemo(() => {
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return daysInMonth.map(day => {
        const salesForDay = monthlyInvoices
            .filter(inv => isSameDay(new Date(inv.date), day))
            .reduce((sum, inv) => sum + inv.subtotal, 0);
        return {
            name: format(day, 'd'),
            Sales: salesForDay,
        };
    });
  }, [monthlyInvoices, monthStart, monthEnd]);
  
  const topSellingProductsData = useMemo(() => {
      const productSales: { [key: string]: { name: string, quantity: number } } = {};
      monthlyInvoices.forEach(invoice => {
          invoice.items.forEach(item => {
              if (productSales[item.id]) {
                  productSales[item.id].quantity += item.quantity;
              } else {
                  productSales[item.id] = { name: item.name, quantity: item.quantity };
              }
          });
      });
      return Object.values(productSales)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
  }, [monthlyInvoices]);


  const chartConfig: ChartConfig = {
    Sales: { label: t('sales_label', {defaultValue: "Sales"}), color: "hsl(var(--primary))" },
    Profit: { label: t('profit_label', {defaultValue: "Profit"}), color: "hsl(var(--chart-2))" },
    quantity: { label: t('quantity_label', {defaultValue: "Quantity"}) },
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">{t('dashboard_sidebar')}</h1>
         <Popover>
            <PopoverTrigger asChild>
            <Button
                variant={"outline"}
                className="w-full sm:w-[280px] justify-start text-left font-normal"
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "MMMM yyyy")}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
            <Calendar
                mode="single"
                selected={date}
                onSelect={(day) => setDate(day || new Date())}
                initialFocus
                captionLayout="dropdown-buttons" 
                fromYear={2020} 
                toYear={new Date().getFullYear() + 1}
            />
            </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('monthly_sales_card_title')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{format(date, "MMMM yyyy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('monthly_expenses_card_title')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalExpenses.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">{format(date, "MMMM yyyy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('profit_card_title')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${stats.profit.toFixed(2)}
            </div>
             <p className="text-xs text-muted-foreground">{format(date, "MMMM yyyy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('todays_expenses_card_title')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todayTotalExpenses.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">{t('today_subtitle')}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
            <CardHeader>
            <CardTitle>{t('daily_sales_chart_title', { month: format(date, 'MMMM') })}</CardTitle>
            <CardDescription>{t('daily_sales_chart_description')}</CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                <BarChart data={dailySalesChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="Sales" fill="var(--color-Sales)" radius={4} />
                </BarChart>
            </ChartContainer>
            </CardContent>
        </Card>
         <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>{t('top_selling_products_chart_title')}</CardTitle>
                <CardDescription>{format(date, "MMMM yyyy")}</CardDescription>
            </CardHeader>
            <CardContent>
                {topSellingProductsData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Pie
                                data={topSellingProductsData}
                                dataKey="quantity"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                    return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {topSellingProductsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                ) : (
                    <div className="flex justify-center items-center min-h-[250px] text-muted-foreground">
                        {t('no_sales_data_for_month')}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
