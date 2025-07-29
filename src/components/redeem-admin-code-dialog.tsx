
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
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';
import { useUser } from '@/hooks/use-user';

interface RedeemAdminCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RedeemAdminCodeDialog({ open, onOpenChange }: RedeemAdminCodeDialogProps) {
  const [code, setCode] = useState('');
  const { redeemAdminCode } = useUser();

  const handleConfirm = () => {
    const success = redeemAdminCode(code);
    if (success) {
      setCode('');
      onOpenChange(false);
    } else {
      setCode('');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setCode('');
    }
    onOpenChange(isOpen);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="text-primary" />
            Redeem Admin Code
          </DialogTitle>
          <DialogDescription>
            Enter the admin code provided to you to gain temporary admin privileges.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleConfirm}>
            Redeem Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
