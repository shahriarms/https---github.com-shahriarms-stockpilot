
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import type { Employee } from '@/lib/types';
import { cn } from '@/lib/utils';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  address: z.string().min(5, "Please enter a valid address."),
  role: z.string({ required_error: "Please select a role." }),
  salary: z.coerce.number().positive("Salary must be a positive number."),
  joiningDate: z.date({ required_error: "Please select a joining date." }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: Employee | null;
}

export function EmployeeDialog({ open, onOpenChange, employee }: EmployeeDialogProps) {
    const { addEmployee, updateEmployee } = useEmployees();
    const isEditMode = !!employee;

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: isEditMode
            ? { ...employee, joiningDate: new Date(employee.joiningDate) }
            : {
                name: '',
                phone: '',
                address: '',
                role: '',
                salary: 0,
                joiningDate: new Date(),
            },
    });

    useEffect(() => {
        if (open) {
            form.reset(isEditMode ? { ...employee, joiningDate: new Date(employee.joiningDate) } : {
                name: '',
                phone: '',
                address: '',
                role: '',
                salary: 0,
                joiningDate: new Date(),
            });
        }
    }, [open, employee, isEditMode, form]);

    const onSubmit = (data: EmployeeFormValues) => {
        const employeeData = {
            ...data,
            joiningDate: data.joiningDate.toISOString(),
        };

        if (isEditMode) {
            updateEmployee(employee.id, employeeData);
        } else {
            addEmployee(employeeData);
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update the details for this employee.' : 'Fill in the details for the new employee.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 017..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Manager">Manager</SelectItem>
                                                <SelectItem value="Sales">Sales</SelectItem>
                                                <SelectItem value="Worker">Worker</SelectItem>
                                                <SelectItem value="Accountant">Accountant</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Employee's full address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                           <FormField
                                control={form.control}
                                name="salary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salary</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="joiningDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Joining Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">{isEditMode ? 'Save Changes' : 'Add Employee'}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
