
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

interface AdminPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pin: string) => boolean;
}

export function AdminPinDialog({ open, onOpenChange, onConfirm }: AdminPinDialogProps) {
  const [pin, setPin] = useState('');

  const handleConfirm = () => {
    const success = onConfirm(pin);
    if (success) {
      setPin('');
      onOpenChange(false);
    } else {
      setPin('');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPin('');
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
            Admin Access Required
          </DialogTitle>
          <DialogDescription>
            To switch to the admin role, please enter the administrator PIN.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pin" className="text-right">
              PIN
            </Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
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
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
