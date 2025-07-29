
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StockPilotLogo } from '@/components/stock-pilot-logo';
import { ForgotPasswordDialog } from '@/components/forgot-password-dialog';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/dashboard');
  };
  
  const handleForgotPasswordClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setForgotPasswordOpen(true);
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm border-white/20 bg-card/60 shadow-2xl backdrop-blur-lg transition-transform duration-300 ease-in-out hover:scale-[1.01] hover:shadow-xl">
          <CardHeader className="text-center">
             <StockPilotLogo />
            <CardTitle className="text-3xl font-bold tracking-tight">
              <span className="text-foreground">Stock</span><span className="text-primary">Pilot</span>
            </CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" onClick={handleForgotPasswordClick} className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-[2.25rem] h-7 w-7 flex items-center justify-center text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span className="sr-only">{showPassword ? 'Hide' : 'Show'} password</span>
                </button>
              </div>
              <Button type="submit" className="w-full" onClick={handleLogin}>
                Login
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-sm">
            <span>Don't have an account?</span>
            <Link href="/signup" className="ml-1 text-primary hover:underline">
              Sign up
            </Link>
          </CardFooter>
        </Card>
      </div>
      <ForgotPasswordDialog open={isForgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </>
  );
}
