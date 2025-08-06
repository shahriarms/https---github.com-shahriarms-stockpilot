
'use client';

import { useState, useMemo } from 'react';
import { useEmployees } from '@/hooks/use-employees';
import type { Employee, AttendanceStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, CalendarIcon, Users, UserCheck, UserX, NotebookText } from 'lucide-react';
import { EmployeeDialog } from '@/components/employee-dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export default function EmployeesPage() {
    const { employees, attendance, markAttendance, getAttendanceForDate, deleteEmployee } = useEmployees();
    const { user } = useUser();
    
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [searchTerm, setSearchTerm] = useState('');

    const dailyAttendance = useMemo(() => getAttendanceForDate(selectedDate), [getAttendanceForDate, selectedDate]);
    
    const filteredEmployees = useMemo(() => {
        return employees.filter(e => 
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);
    
    const handleAddNew = () => {
        setEmployeeToEdit(null);
        setDialogOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        if (user?.role !== 'admin') {
            alert("Only admins can edit employee data.");
            return;
        }
        setEmployeeToEdit(employee);
        setDialogOpen(true);
    };
    
    const handleDelete = (employee: Employee) => {
        if (user?.role !== 'admin') {
            alert("Only admins can delete employees.");
            return;
        }
        setEmployeeToDelete(employee);
    };

    const confirmDelete = () => {
        if (employeeToDelete) {
            deleteEmployee(employeeToDelete.id);
            setEmployeeToDelete(null);
        }
    };

    const handleAttendanceChange = (employeeId: string, status: AttendanceStatus) => {
        markAttendance(employeeId, selectedDate, status);
    };

    const getStatusForEmployee = (employeeId: string): AttendanceStatus => {
        return dailyAttendance.find(a => a.employeeId === employeeId)?.status || 'Absent';
    };
    
    const attendanceSummary = useMemo(() => {
        const present = dailyAttendance.filter(a => a.status === 'Present').length;
        const leave = dailyAttendance.filter(a => a.status === 'Leave').length;
        // Correctly calculate absent: total employees minus those present or on leave for that day
        const absent = employees.length - present - leave;
        return { present, absent, leave };
    }, [dailyAttendance, employees.length]);


    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold flex items-center gap-2"><Users className="w-6 h-6"/> Employee Attendance</h1>
                <div className="flex gap-2">
                    <Button onClick={handleAddNew} disabled={user?.role !== 'admin'}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
                    </Button>
                </div>
            </div>

            {/* Attendance Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Daily Attendance</CardTitle>
                    <CardDescription>Mark attendance for all employees for the selected date.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-[280px] justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => setSelectedDate(date || new Date())}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2 p-2 rounded-md bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"><UserCheck className="w-5 h-5"/> Present: <span className="font-bold">{attendanceSummary.present}</span></div>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"><UserX className="w-5 h-5"/> Absent: <span className="font-bold">{attendanceSummary.absent}</span></div>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"><NotebookText className="w-5 h-5"/> On Leave: <span className="font-bold">{attendanceSummary.leave}</span></div>
                        </div>
                    </div>

                     <div className="rounded-md border overflow-auto max-h-96">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Employee Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Attendance Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map(employee => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.name}</TableCell>
                                        <TableCell>{employee.role}</TableCell>
                                        <TableCell className="text-right">
                                            <Select
                                                value={getStatusForEmployee(employee.id)}
                                                onValueChange={(status) => handleAttendanceChange(employee.id, status as AttendanceStatus)}
                                            >
                                                <SelectTrigger className="w-32 ml-auto">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Present">Present</SelectItem>
                                                    <SelectItem value="Absent">Absent</SelectItem>
                                                    <SelectItem value="Leave">On Leave</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Employee List Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Employee List</CardTitle>
                    <CardDescription>A complete list of all employees in the system.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <Input 
                        placeholder="Search by name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="rounded-md border overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Joining Date</TableHead>
                                    <TableHead className="text-right">Salary</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.map(employee => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.name}</TableCell>
                                        <TableCell>{employee.role}</TableCell>
                                        <TableCell>{employee.phone}</TableCell>
                                        <TableCell>{format(new Date(employee.joiningDate), 'PP')}</TableCell>
                                        <TableCell className="text-right font-mono">${employee.salary.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(employee)} disabled={user?.role !== 'admin'}><Pencil className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDelete(employee)} disabled={user?.role !== 'admin'} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            
            <EmployeeDialog 
                open={isDialogOpen} 
                onOpenChange={setDialogOpen}
                employee={employeeToEdit}
            />

            <AlertDialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the employee record for {employeeToDelete?.name}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
