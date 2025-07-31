
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Settings, LifeBuoy, Users, KeyRound, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/use-user';
import { useState, useEffect } from 'react';
import { RedeemAdminCodeDialog } from './redeem-admin-code-dialog';
import { ShowAdminCodeDialog } from './show-admin-code-dialog';


export function SiteHeader() {
  const { user, logout, generateAdminCode, adminCode } = useUser();
  const [isRedeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [isShowCodeDialogOpen, setShowCodeDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const handleShowCode = () => {
    generateAdminCode();
    setShowCodeDialogOpen(true);
  }

  if (!user) {
    return (
       <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <div>
          <SidebarTrigger />
        </div>
         <div className="flex-1 flex justify-center items-center">
          <h1 className="text-xl font-bold text-foreground">Mahmud Engineering Shop</h1>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <div>
          <SidebarTrigger />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <h1 className="text-xl font-bold text-foreground">Mahmud Engineering Shop</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center justify-center p-2 rounded-md border bg-white text-black font-mono text-sm">
                {currentTime}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div>My Account</div>
                  <div className="text-xs font-normal text-muted-foreground">{user.email} ({user.role})</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' ? (
                  <DropdownMenuItem onClick={handleShowCode}>
                    <KeyRound className="mr-2" />
                    Generate Admin Code
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setRedeemDialogOpen(true)}>
                     <KeyRound className="mr-2" />
                    Redeem Admin Code
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LifeBuoy className="mr-2" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <RedeemAdminCodeDialog
        open={isRedeemDialogOpen}
        onOpenChange={setRedeemDialogOpen}
      />
      <ShowAdminCodeDialog
        open={isShowCodeDialogOpen}
        onOpenChange={setShowCodeDialogOpen}
        code={adminCode}
      />
    </>
  );
}
