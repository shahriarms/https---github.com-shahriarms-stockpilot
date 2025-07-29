'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProducts } from '@/hooks/use-products.tsx';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Product } from '@/lib/types';
import { useEffect } from 'react';

const stockUpdateSchema = z.object({
  quantity: z.coerce.number().int().positive({ message: 'Quantity must be a positive integer.' }),
});

type StockUpdateFormValues = z.infer<typeof stockUpdateSchema>;

interface UpdateStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  type: 'increase' | 'decrease';
}

export function UpdateStockDialog({ open, onOpenChange, product, type }: UpdateStockDialogProps) {
  const { updateStock } = useProducts();
  const form = useForm<StockUpdateFormValues>({
    resolver: zodResolver(stockUpdateSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  useEffect(() => {
    form.reset({ quantity: 1 });
  }, [open, product, type, form]);


  const onSubmit = (data: StockUpdateFormValues) => {
    if (product) {
      updateStock(product.id, data.quantity, type);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };
  
  const title = type === 'increase' ? 'Increase Stock' : 'Decrease Stock';
  const description = `Update stock for ${product?.name || 'product'}. Current stock: ${product?.stock || 0}.`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to {type}</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Stock</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
