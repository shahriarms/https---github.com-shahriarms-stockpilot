
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
import { Copy, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShowAdminCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string | null;
}

export function ShowAdminCodeDialog({ open, onOpenChange, code }: ShowAdminCodeDialogProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast({
        title: 'Code Copied!',
        description: 'The admin code has been copied to your clipboard.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="text-primary" />
            Your Admin Code
          </DialogTitle>
          <DialogDescription>
            Share this single-use code with an employee to grant them temporary admin access.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input id="code" value={code || 'Generating...'} readOnly />
          <Button type="button" size="icon" onClick={handleCopy} disabled={!code}>
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
           <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
