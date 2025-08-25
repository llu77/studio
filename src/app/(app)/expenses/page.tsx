
'use client';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CirclePlus, ListOrdered, FilePenLine, Trash2, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


const mockExpenses = [
    { id: 'EXP001', date: '2024-07-21', branch: 'فرع لبن', category: 'فواتير', amount: 450.00, description: 'فاتورة كهرباء شهر يوليو' },
    { id: 'EXP002', date: '2024-07-20', branch: 'فرع طويق', category: 'صيانة', amount: 1200.00, description: 'إصلاح مكيف الهواء' },
    { id: 'EXP003', date: '2024-07-20', branch: 'فرع لبن', category: 'مستلزمات', amount: 250.50, description: 'شراء أدوات نظافة' },
    { id: 'EXP004', date: '2024-07-19', branch: 'فرع طويق', category: 'رواتب', amount: 8500.00, description: 'رواتب الموظفين' },
];


export default function ExpensesPage() {
  return (
    <>
      <Tabs defaultValue="add-expense" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3">
          <TabsTrigger value="add-expense">
            <CirclePlus className="ms-2" />
            إضافة مصروف
          </TabsTrigger>
          <TabsTrigger value="view-expenses">
            <ListOrdered className="ms-2" />
            عرض المصاريف
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-expense" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>إضافة مصروف جديد</CardTitle>
                <CardDescription>سجل المصروفات الجديدة للفروع.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="expense-date">تاريخ المصروف</Label>
                            <Input id="expense-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                         <div>
                            <Label htmlFor="expense-branch">الفرع</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الفرع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="laban">فرع لبن</SelectItem>
                                    <SelectItem value="tuwaiq">فرع طويق</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="expense-category">بند المصروف</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر البند" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bills">فواتير (كهرباء, ماء, انترنت)</SelectItem>
                                    <SelectItem value="salaries">رواتب</SelectItem>
                                    <SelectItem value="maintenance">صيانة</SelectItem>
                                    <SelectItem value="supplies">مستلزمات تشغيلية</SelectItem>
                                    <SelectItem value="rent">إيجار</SelectItem>
                                    <SelectItem value="other">أخرى</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="expense-amount">المبلغ (ريال)</Label>
                            <Input id="expense-amount" type="number" placeholder="مثال: 500" />
                        </div>
                        <div>
                            <Label htmlFor="expense-description">الوصف / ملاحظات</Label>
                            <Textarea id="expense-description" placeholder="اكتب وصفاً موجزاً للمصروف..." />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button size="lg">حفظ المصروف</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="view-expenses" className="mt-4">
           <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>سجل المصروفات</CardTitle>
                            <CardDescription>عرض وبحث في المصروفات المسجلة.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="ابحث بالوصف أو البند..." className="pr-10" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <TooltipProvider>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>الفرع</TableHead>
                                    <TableHead>البند</TableHead>
                                    <TableHead>المبلغ</TableHead>
                                    <TableHead>الوصف</TableHead>
                                    <TableHead>إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockExpenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>{expense.date}</TableCell>
                                    <TableCell><Badge variant="secondary">{expense.branch}</Badge></TableCell>
                                    <TableCell>{expense.category}</TableCell>
                                    <TableCell className="font-medium">{expense.amount.toFixed(2)} ريال</TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon"><FilePenLine className="h-4 w-4" /></Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>تعديل</p></TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>حذف</p></TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TooltipProvider>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
