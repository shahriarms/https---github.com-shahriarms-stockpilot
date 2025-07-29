
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useProducts } from '@/hooks/use-products.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Package, DollarSign, PackageX, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

export default function Dashboard() {
  const { products, isLoading } = useProducts();

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStockValue = products.reduce(
      (acc, product) => acc + product.price * product.stock,
      0
    );
    const outOfStockItems = products.filter(
      (product) => product.stock === 0
    ).length;
    return { totalProducts, totalStockValue, outOfStockItems };
  }, [products]);

  const chartData = useMemo(() => {
    return products
      .slice()
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        stock: p.stock,
        fill: 'hsl(var(--primary))',
      }));
  }, [products]);

  const chartConfig = {
    stock: {
      label: 'Stock',
    },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Unique products in inventory
            </p>
          </CardContent>
        </Card>
        <Card className="transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Current value of all stock
            </p>
          </CardContent>
        </Card>
        <Card className="transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <PackageX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items with zero quantity
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Top 5 Stocked Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 15) + (value.length > 15 ? '...' : '')}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="stock" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
