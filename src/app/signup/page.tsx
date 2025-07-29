
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Bot } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { StockPilotLogo } from '@/components/stock-pilot-logo';


const signupSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    setIsLoading(true);
    console.log(data);
    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        toast({
            title: "Account Created!",
            description: "You have successfully created your account.",
        });
        // Redirect to login or dashboard
    }, 1500);
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <StockPilotLogo />
          <CardTitle className="text-3xl font-bold tracking-tight">
            <span className="text-foreground">Stock</span><span className="text-primary">Pilot</span>
          </CardTitle>
          <CardDescription>Enter your details below to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                            <FormControl>
                                <Input type={showPassword ? 'text' : 'password'} {...field} />
                            </FormControl>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-muted-foreground"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                <span className="sr-only">{showPassword ? 'Hide' : 'Show'} password</span>
                            </button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
                />
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <div className="relative">
                            <FormControl>
                                <Input type={showConfirmPassword ? 'text' : 'password'} {...field} />
                            </FormControl>
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-muted-foreground"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                <span className="sr-only">{showConfirmPassword ? 'Hide' : 'Show'} password</span>
                            </button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
                />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Bot className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center text-sm">
            <span>Already have an account?</span>
            <Link href="/login" className="ml-1 text-primary hover:underline">
                Login
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
