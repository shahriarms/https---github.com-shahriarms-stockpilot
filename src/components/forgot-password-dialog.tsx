
'use client';

import { useState } from 'react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import app from '@/lib/firebase/firebase';
import { Loader2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth(app);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for a link to reset your password.",
      });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Sending Email",
        description: error.message || "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgot Password?</DialogTitle>
          <DialogDescription>
            No problem. Enter your email address below and we'll send you a link to reset it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
