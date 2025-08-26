
'use client';
import React, { useContext, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, Users, DollarSign, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { BranchContext } from '@/app/(app)/layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';

const mockUsersData = {
    laban: [
        { id: 'USR002', name: 'أحمد علي' },
        { id: 'USR005', name: 'فاطمة محمد' },
    ],
    tuwaiq: [
        { id: 'USR003', name: 'يوسف خالد' },
        { id: 'USR004', name: 'عبدالحي' },
    ]
};

const mockRevenueData = [
  { week: 0, employeeName: "أحمد علي", amount: 2500 },
  { week: 1, employeeName: "أحمد علي", amount: 2950 },
  { week: 2, employeeName: "أحمد علي", amount: 3600 },
  { week: 3, employeeName: "أحمد علي", amount: 1400 },
  { week: 0, employeeName: "فاطمة محمد", amount: 1350 },
  { week: 1, employeeName: "فاطمة محمد", amount: 1820 },
  { week: 2, employeeName: "فاطمة محمد", amount: 1750 },
  { week: 3, employeeName: "فاطمة محمد", amount: 2410 },
  { week: 0, employeeName: "يوسف خالد", amount: 3800 },
  { week: 1, employeeName: "يوسف خالد", amount: 3400 },
  { week: 2, employeeName: "يوسف خالد", amount: 4100 },
  { week: 3, employeeName: "يوسف خالد", amount: 3550 },
  { week: 0, employeeName: "عبدالحي", amount: 2800 },
  { week: 1, employeeName: "عبدالحي", amount: 2300 },
  { week: 2, employeeName: "عبدالحي", amount: 1900 },
  { week: 3, employeeName: "عبدالحي", amount: 1200 },
];

const getBonusTier = (revenue: number) => {
    if (revenue >= 3500) return { bonus: 280, level: 5, color: "text-green-500", icon: <ArrowUp className="h-4 w-4" /> };
    if (revenue >= 2900) return { bonus: 220, level: 4, color: "text-green-400", icon: <ArrowUp className="h-4 w-4" /> };
    if (revenue >= 2400) return { bonus: 150, level: 3, color: "text-blue-500", icon: <Minus className="h-4 w-4" /> };
    if (revenue >= 1800) return { bonus: 100, level: 2, color: "text-yellow-500", icon: <ArrowDown className="h-4 w-4" /> };
    if (revenue >= 1300) return { bonus: 50, level: 1, color: "text-red-500", icon: <ArrowDown className="h-4 w-4" /> };
    return { bonus: 0, level: 0, color: "text-muted-foreground", icon: <Minus className="h-4 w-4" /> };
};

const weekLabels = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع'];

// --- Component ---
export default function BonusesPage() {
  const { currentBranch } = useContext(BranchContext);
  const [selectedWeek, setSelectedWeek] = useState(0); 
  const { toast } = useToast();
  
  const employeesForBranch = mockUsersData[currentBranch as keyof typeof mockUsersData] || mockUsersData.laban;

  const weeklyCalculations = useMemo(() => {
    return employeesForBranch.map(emp => {
      const revenueRecord = mockRevenueData.find(r => r.employeeName === emp.name && r.week === selectedWeek);
      const revenue = revenueRecord ? revenueRecord.amount : 0;
      const { bonus, icon, color } = getBonusTier(revenue);
      return {
        ...emp,
        currentRevenue: revenue,
        currentBonus: bonus,
        icon,
        color,
      };
    });
  }, [employeesForBranch, selectedWeek]);

  const totalCalculations = useMemo(() => {
     return employeesForBranch.map(emp => {
        const employeeRevenues = mockRevenueData.filter(r => r.employeeName === emp.name);
        const totalRevenue = employeeRevenues.reduce((sum, rev) => sum + rev.amount, 0);
        const totalBonus = employeeRevenues.reduce((sum, rev) => sum + getBonusTier(rev.amount).bonus, 0);
        return {
            ...emp,
            totalRevenue,
            totalBonus
        };
     });
  }, [employeesForBranch]);

  const selectedWeekTotalBonus = weeklyCalculations.reduce((sum, item) => sum + item.currentBonus, 0);
  const grandTotalBonus = totalCalculations.reduce((sum, item) => sum + item.totalBonus, 0);

  const handleApproveBonus = () => {
    toast({
        title: "تم اعتماد البونص بنجاح!",
        description: `سيتم صرف مبلغ ${grandTotalBonus.toLocaleString('ar-SA')} ريال للموظفين.`,
        className: "bg-primary text-primary-foreground",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>حساب ومتابعة البونص الأسبوعي</CardTitle>
          <CardDescription>
            عرض تفصيلي للبونص المستحق للموظفين بناءً على الإيرادات الأسبوعية المحققة لكل فرع.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary"/>
                <span>فرع:</span>
                <span className="font-bold">{currentBranch === 'laban' ? 'لبن' : 'طويق'}</span>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                <Select value={String(selectedWeek)} onValueChange={(val) => setSelectedWeek(Number(val))}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="اختر الأسبوع" />
                    </SelectTrigger>
                    <SelectContent>
                        {weekLabels.map((label, index) => (
                            <SelectItem key={index} value={String(index)}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <div className="flex items-center gap-2 p-3 rounded-lg bg-muted w-full justify-center md:w-auto">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">إجمالي بونص الأسبوع:</span>
                    <span className="font-bold text-primary text-lg">{selectedWeekTotalBonus.toLocaleString('ar-SA')} ريال</span>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>تفاصيل البونص لـ: {weekLabels[selectedWeek]}</CardTitle>
              <CardDescription>
                  يتم احتساب البونص لكل موظف بناءً على مستوى الإيرادات الذي حققه خلال هذا الأسبوع.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>اسم الموظف</TableHead>
                          <TableHead>إجمالي إيراداته للأسبوع</TableHead>
                          <TableHead>مستوى البونص</TableHead>
                          <TableHead className="text-primary text-right">مبلغ البونص المستحق</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {weeklyCalculations.map(emp => (
                          <TableRow key={emp.id}>
                              <TableCell className="font-medium">{emp.name}</TableCell>
                              <TableCell>{emp.currentRevenue.toLocaleString('ar-SA')} ريال</TableCell>
                              <TableCell className={`flex items-center gap-2 font-semibold ${emp.color}`}>
                                  {emp.icon}
                                  {emp.currentBonus > 0 ? `المستوى ${getBonusTier(emp.currentRevenue).level}` : 'لا يوجد'}
                              </TableCell>
                              <TableCell className="font-bold text-primary text-lg text-right">
                                {emp.currentBonus.toLocaleString('ar-SA')} ريال
                              </TableCell>
                          </TableRow>
                      ))}
                       <TableRow className="bg-muted/50 font-bold">
                          <TableCell colSpan={3}>الإجمالي للأسبوع المحدد</TableCell>
                          <TableCell className="text-primary text-lg text-right">{selectedWeekTotalBonus.toLocaleString('ar-SA')} ريال</TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

       <Card>
          <CardHeader>
              <CardTitle>الملخص الإجمالي للشهر (4 أسابيع)</CardTitle>
              <CardDescription>
                  نظرة شاملة على أداء الموظفين وإجمالي البونص المستحق لهم خلال الشهر.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>اسم الموظف</TableHead>
                          <TableHead>إجمالي إيراداته للشهر</TableHead>
                          <TableHead className="text-primary text-right">إجمالي البونص المستحق للشهر</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {totalCalculations.map(emp => (
                          <TableRow key={emp.id} className="hover:bg-primary/5">
                              <TableCell className="font-medium">{emp.name}</TableCell>
                              <TableCell>{emp.totalRevenue.toLocaleString('ar-SA')} ريال</TableCell>
                              <TableCell className="font-bold text-primary text-xl text-right">
                                {emp.totalBonus.toLocaleString('ar-SA')} ريال
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
          <CardFooter className="justify-end pt-6">
              <Button size="lg" onClick={handleApproveBonus}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  اعتماد وصرف بونص الشهر
              </Button>
          </CardFooter>
      </Card>
    </div>
  );
}

    