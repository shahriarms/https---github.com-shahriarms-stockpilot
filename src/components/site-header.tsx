
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Settings, LifeBuoy, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useState } from 'react';
import { AdminPinDialog } from './admin-pin-dialog';
import { getAuth, signOut } from 'firebase/auth';

export function SiteHeader() {
  const router = useRouter();
  const { user, setUserRole, switchToAdmin } = useUser();
  const [isPinDialogOpen, setPinDialogOpen] = useState(false);
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleRoleChange = (value: string) => {
    if (value === 'admin') {
      setPinDialogOpen(true);
    } else {
      setUserRole(value as 'admin' | 'employee');
    }
  };

  if (!user) {
    return (
       <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex-1"></div>
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
            <DropdownMenuRadioGroup
              value={user.role}
              onValueChange={handleRoleChange}
            >
              <DropdownMenuLabel className="flex items-center">
                <Users className="mr-2" />
                Change Role
              </DropdownMenuLabel>
              <DropdownMenuRadioItem value="employee">
                Employee
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
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
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <AdminPinDialog
        open={isPinDialogOpen}
        onOpenChange={setPinDialogOpen}
        onConfirm={switchToAdmin}
      />
    </>
  );
}
