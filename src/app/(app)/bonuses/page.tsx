
'use client';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Percent, Calculator } from "lucide-react";

const employees = [
    { id: 1, name: 'أحمد علي (لبن)', revenue: 12500 },
    { id: 2, name: 'فاطمة محمد (لبن)', revenue: 11800 },
    { id: 3, name: 'يوسف خالد (طويق)', revenue: 14200 },
    { id: 4, name: 'عبدالحي (طويق)', revenue: 13100 },
];

export default function BonusesPage() {
  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>حساب البونص الأسبوعي</CardTitle>
            <CardDescription>أدخل إجمالي البونص لتوزيعه على الموظفين بناءً على إيراداتهم.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="total-bonus" className="block text-sm font-medium mb-1">إجمالي مبلغ البونص (ريال)</label>
              <div className="relative">
                <Input id="total-bonus" type="number" placeholder="5000" className="pl-10"/>
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex-1">
                <label htmlFor="bonus-percentage" className="block text-sm font-medium mb-1">أو نسبة البونص من الأرباح (%)</label>
                 <div className="relative">
                    <Input id="bonus-percentage" type="number" placeholder="10" className="pl-10"/>
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 </div>
            </div>
            <Button className="w-full md:w-auto">
              <Calculator className="mr-2 h-4 w-4" />
              حساب وتوزيع
            </Button>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>توزيع البونص المقترح</CardTitle>
                <CardDescription>هذا هو التوزيع المحسوب بناءً على المدخلات أعلاه.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>اسم الموظف</TableHead>
                            <TableHead>إجمالي إيراداته</TableHead>
                            <TableHead>نسبة البونص</TableHead>
                            <TableHead className="text-primary">مبلغ البونص المستحق</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map(emp => (
                            <TableRow key={emp.id}>
                                <TableCell>{emp.name}</TableCell>
                                <TableCell>{emp.revenue.toLocaleString('ar-SA')} ريال</TableCell>
                                <TableCell>25%</TableCell>
                                <TableCell className="font-bold text-primary">1,250.00 ريال</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="bg-muted/50 font-bold">
                            <TableCell colSpan={3}>الإجمالي</TableCell>
                            <TableCell className="text-primary">5,000.00 ريال</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                 <div className="flex justify-end mt-4">
                    <Button size="lg">اعتماد وتأكيد التوزيع</Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
