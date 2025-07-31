
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Settings, LifeBuoy, KeyRound, Calculator } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useCalculator } from '@/hooks/use-calculator';


export function SiteHeader() {
  const { user, logout, generateAdminCode, adminCode } = useUser();
  const { targetValue } = useCalculator();

  const [isRedeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [isShowCodeDialogOpen, setShowCodeDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Calculator State
  const [calculatorInput, setCalculatorInput] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [isPopoverOpen, setPopoverOpen] = useState(false);


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

  // Calculator Logic
  const handleNumberClick = (num: string) => {
    setCalculatorInput(prev => (prev === '0' || prev === 'Error' ? num : prev + num));
  };

  const handleDecimalClick = () => {
    if (!calculatorInput.includes('.')) {
      setCalculatorInput(prev => prev + '.');
    }
  };

  const handleOperatorClick = (op: string) => {
    if (previousValue !== null && operator) {
      handleEqualsClick();
      setOperator(op);
    } else {
      setPreviousValue(parseFloat(calculatorInput));
      setCalculatorInput('0');
      setOperator(op);
    }
  };

  const handleEqualsClick = () => {
    if (!operator || previousValue === null) return;
    const currentValue = parseFloat(calculatorInput);
    let result;
    switch (operator) {
      case '+': result = previousValue + currentValue; break;
      case '-': result = previousValue - currentValue; break;
      case '×': result = previousValue * currentValue; break;
      case '÷': result = currentValue === 0 ? 'Error' : previousValue / currentValue; break;
      default: return;
    }
    if (result === 'Error') {
      setCalculatorInput('Error');
    } else {
      setCalculatorInput(String(result));
    }
    setPreviousValue(result === 'Error' ? null : result as number);
    setOperator(null);
  };
  
  const handleClear = () => {
    setCalculatorInput('0');
    setOperator(null);
    setPreviousValue(null);
  };

  const handleUseResult = () => {
    const value = parseFloat(calculatorInput);
    if (!isNaN(value) && targetValue) {
        targetValue(value);
    }
    setPopoverOpen(false);
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
        <div className="flex-1 flex justify-center items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">Mahmud Engineering Shop</h1>
           <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                      <Calculator className="w-4 h-4"/>
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                  <div className="space-y-2">
                      <Input readOnly value={calculatorInput} className="text-right text-2xl font-mono h-12" />
                      <div className="grid grid-cols-4 gap-2">
                          <Button onClick={handleClear} variant="destructive" className="col-span-2">C</Button>
                          <Button onClick={() => handleOperatorClick('÷')} variant="outline">÷</Button>
                          <Button onClick={() => handleOperatorClick('×')} variant="outline">×</Button>
                          
                          {['7','8','9'].map(n => <Button key={n} onClick={() => handleNumberClick(n)}>{n}</Button>)}
                          <Button onClick={() => handleOperatorClick('-')} variant="outline">-</Button>

                          {['4','5','6'].map(n => <Button key={n} onClick={() => handleNumberClick(n)}>{n}</Button>)}
                          <Button onClick={() => handleOperatorClick('+')} variant="outline">+</Button>
                          
                          {['1','2','3'].map(n => <Button key={n} onClick={() => handleNumberClick(n)}>{n}</Button>)}
                          <Button onClick={handleEqualsClick} variant="secondary" className="row-span-2">=</Button>

                          <Button onClick={() => handleNumberClick('0')} className="col-span-2">0</Button>
                          <Button onClick={handleDecimalClick}>.</Button>
                      </div>
                      <Button onClick={handleUseResult} className="w-full" disabled={!targetValue}>
                        Use this value
                      </Button>
                  </div>
              </PopoverContent>
          </Popover>
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
