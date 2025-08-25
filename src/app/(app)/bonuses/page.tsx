
'use client';
import React, { useContext, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, Users, DollarSign, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { BranchContext } from '@/app/(app)/layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

// --- Data ---
const branchData = {
    laban: {
        employees: [
            { id: 1, name: 'أحمد علي', weeklyRevenue: [2500, 2950, 3600, 1400] },
            { id: 2, name: 'فاطمة محمد', weeklyRevenue: [1350, 1820, 1750, 2410] },
        ]
    },
    tuwaiq: {
        employees: [
            { id: 3, name: 'يوسف خالد', weeklyRevenue: [3800, 3400, 4100, 3550] },
            { id: 4, name: 'عبدالحي', weeklyRevenue: [2800, 2300, 1900, 1200] },
        ]
    }
};

// --- Logic ---
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
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 for Week 1, 1 for Week 2, etc.
  const { toast } = useToast();
  
  const data = branchData[currentBranch as keyof typeof branchData] || branchData.laban;

  const weeklyCalculations = useMemo(() => {
    return data.employees.map(emp => {
      const revenue = emp.weeklyRevenue[selectedWeek] || 0;
      const { bonus, icon, color } = getBonusTier(revenue);
      return {
        ...emp,
        currentRevenue: revenue,
        currentBonus: bonus,
        icon,
        color,
      };
    });
  }, [data.employees, selectedWeek]);

  const totalCalculations = useMemo(() => {
     return data.employees.map(emp => {
        const totalRevenue = emp.weeklyRevenue.reduce((sum, rev) => sum + rev, 0);
        const totalBonus = emp.weeklyRevenue.reduce((sum, rev) => sum + getBonusTier(rev).bonus, 0);
        return {
            ...emp,
            totalRevenue,
            totalBonus
        };
     });
  }, [data.employees]);

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
                 <div className="flex items-center gap-2 p-2 rounded-md bg-muted w-full justify-center md:w-auto">
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
                          <TableHead className="text-primary">مبلغ البونص المستحق</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {weeklyCalculations.map(emp => (
                          <TableRow key={emp.id}>
                              <TableCell className="font-medium">{emp.name}</TableCell>
                              <TableCell>{emp.currentRevenue.toLocaleString('ar-SA')} ريال</TableCell>
                              <TableCell className={`flex items-center gap-2 font-semibold ${emp.color}`}>
                                  {emp.icon}
                                  {emp.currentBonus > 0 ? `${getBonusTier(emp.currentRevenue).level}` : 'لا يوجد'}
                              </TableCell>
                              <TableCell className="font-bold text-primary text-lg">
                                {emp.currentBonus.toLocaleString('ar-SA')} ريال
                              </TableCell>
                          </TableRow>
                      ))}
                       <TableRow className="bg-muted/50 font-bold">
                          <TableCell colSpan={3}>الإجمالي للأسبوع المحدد</TableCell>
                          <TableCell className="text-primary text-lg">{selectedWeekTotalBonus.toLocaleString('ar-SA')} ريال</TableCell>
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
                          <TableHead className="text-primary">إجمالي البونص المستحق للشهر</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {totalCalculations.map(emp => (
                          <TableRow key={emp.id} className="hover:bg-primary/5">
                              <TableCell className="font-medium">{emp.name}</TableCell>
                              <TableCell>{emp.totalRevenue.toLocaleString('ar-SA')} ريال</TableCell>
                              <TableCell className="font-bold text-primary text-xl">
                                {emp.totalBonus.toLocaleString('ar-SA')} ريال
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
               <div className="flex justify-end mt-6">
                  <Button size="lg" onClick={handleApproveBonus}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      اعتماد وصرف بونص الشهر
                  </Button>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
