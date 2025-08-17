
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Employee, Attendance, AttendanceStatus } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { isSameDay } from 'date-fns';

const initialEmployees: Employee[] = [
    { id: 'emp-1', name: 'Shahadat Hossain', phone: '01712345678', address: '123 Mirpur, Dhaka', role: 'Manager', salary: 35000, joiningDate: new Date(2023, 0, 15).toISOString() },
    { id: 'emp-2', name: 'Rabiul Islam', phone: '01812345679', address: '456 Gulshan, Dhaka', role: 'Sales', salary: 22000, joiningDate: new Date(2023, 5, 1).toISOString() },
    { id: 'emp-3', name: 'Mehedi Hasan', phone: '01912345680', address: '789 Banani, Dhaka', role: 'Worker', salary: 18000, joiningDate: new Date(2024, 2, 10).toISOString() },
];

interface EmployeeContextType {
  employees: Employee[];
  attendance: Attendance[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employeeId: string, updatedData: Omit<Employee, 'id'>) => void;
  deleteEmployee: (employeeId: string) => void;
  markAttendance: (employeeId: string, date: Date, status: AttendanceStatus) => void;
  getAttendanceForDate: (date: Date) => Attendance[];
  getAttendanceSummaryForDate: (date: Date) => { present: number; absent: number; leave: number; total: number };
  isLoading: boolean;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedEmployees = localStorage.getItem('stockpilot-employees');
      if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
      else setEmployees(initialEmployees);
      
      const savedAttendance = localStorage.getItem('stockpilot-attendance');
      if (savedAttendance) setAttendance(JSON.parse(savedAttendance));

    } catch (error) {
      console.error("Failed to load employee data from localStorage", error);
      setEmployees(initialEmployees);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('stockpilot-employees', JSON.stringify(employees));
      localStorage.setItem('stockpilot-attendance', JSON.stringify(attendance));
    }
  }, [employees, attendance, isLoading]);

  const addEmployee = useCallback((employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = { ...employeeData, id: `emp-${Date.now()}` };
    setEmployees(prev => [newEmployee, ...prev]);
    toast({ title: "Employee Added", description: `${newEmployee.name} has been added.` });
  }, [toast]);

  const updateEmployee = useCallback((employeeId: string, updatedData: Omit<Employee, 'id'>) => {
    setEmployees(prev => prev.map(e => (e.id === employeeId ? { id: employeeId, ...updatedData } : e)));
    toast({ title: "Employee Updated", description: "The employee details have been updated." });
  }, [toast]);
    
  const deleteEmployee = useCallback((employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
    toast({ title: "Employee Deleted", description: "The employee record has been removed." });
  }, [toast]);

  const markAttendance = useCallback((employeeId: string, date: Date, status: AttendanceStatus) => {
    setAttendance(prev => {
        const todayAttendance = prev.filter(a => isSameDay(new Date(a.date), date));
        const existingRecord = todayAttendance.find(a => a.employeeId === employeeId);

        if (existingRecord) {
            return prev.map(a => a.id === existingRecord.id ? { ...a, status } : a);
        } else {
            const newRecord: Attendance = {
                id: `att-${Date.now()}`,
                employeeId,
                date: date.toISOString(),
                status,
            };
            return [...prev, newRecord];
        }
    });
  }, []);

  const getAttendanceForDate = useCallback((date: Date) => {
    return attendance.filter(a => isSameDay(new Date(a.date), date));
  }, [attendance]);
  
  const getAttendanceSummaryForDate = useCallback((date: Date) => {
    const dailyRecords = getAttendanceForDate(date);
    const present = dailyRecords.filter(a => a.status === 'Present').length;
    const leave = dailyRecords.filter(a => a.status === 'Leave').length;
    // Absent is total employees minus those present or on leave
    const absent = employees.length - present - leave;
    return { present, absent, leave, total: employees.length };
  }, [getAttendanceForDate, employees.length]);

  const value = useMemo(() => ({
      employees,
      attendance,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      markAttendance,
      getAttendanceForDate,
      getAttendanceSummaryForDate,
      isLoading
  }), [employees, attendance, addEmployee, updateEmployee, deleteEmployee, markAttendance, getAttendanceForDate, getAttendanceSummaryForDate, isLoading]);

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
}
