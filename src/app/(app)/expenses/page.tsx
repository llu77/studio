
'use client';
import React, { useState } from 'react';
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
import { useToast } from "@/hooks/use-toast";


const initialExpenses = [
    { id: 'EXP001', date: '2024-07-21', branch: 'فرع لبن', category: 'فواتير', amount: 450.00, description: 'فاتورة كهرباء شهر يوليو' },
    { id: 'EXP002', date: '2024-07-20', branch: 'فرع طويق', category: 'صيانة', amount: 1200.00, description: 'إصلاح مكيف الهواء' },
    { id: 'EXP003', date: '2024-07-20', branch: 'فرع لبن', category: 'مستلزمات', amount: 250.50, description: 'شراء أدوات نظافة' },
    { id: 'EXP004', date: '2024-07-19', branch: 'فرع طويق', category: 'رواتب', amount: 8500.00, description: 'رواتب الموظفين' },
];

type Expense = typeof initialExpenses[0];


export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(initialExpenses);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [branch, setBranch] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !branch || !category || !amount || !description) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "الرجاء تعبئة جميع الحقول المطلوبة.",
        });
        return;
    }
    const newExpense: Expense = {
        id: `EXP${String(expenses.length + 1).padStart(3, '0')}`,
        date,
        branch: branch === 'laban' ? 'فرع لبن' : 'فرع طويق',
        category,
        amount: parseFloat(amount),
        description,
    };
    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    setFilteredExpenses(updatedExpenses);

    // Reset form
    setDate(new Date().toISOString().split('T')[0]);
    setBranch('');
    setCategory('');
    setAmount('');
    setDescription('');

    toast({
        title: "تم الحفظ بنجاح",
        description: "تمت إضافة المصروف الجديد إلى السجل.",
        className: "bg-primary text-primary-foreground",
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
        setFilteredExpenses(expenses);
    } else {
        const results = expenses.filter(expense => 
            expense.description.toLowerCase().includes(term.toLowerCase()) ||
            expense.category.toLowerCase().includes(term.toLowerCase()) ||
            expense.branch.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredExpenses(results);
    }
  }

  const handleDelete = (id: string) => {
    const updated = expenses.filter(exp => exp.id !== id);
    setExpenses(updated);
    setFilteredExpenses(updated);
    toast({
        variant: "destructive",
        title: "تم الحذف",
        description: `تم حذف المصروف رقم ${id} من السجل.`,
    });
  }

  const handleEdit = (id: string) => {
    toast({
        title: "غير متاح حالياً",
        description: `ميزة تعديل المصروف ${id} سيتم إضافتها قريباً.`,
    });
  }


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
                <CardContent>
                  <form onSubmit={handleSaveExpense} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="expense-date">تاريخ المصروف</Label>
                            <Input id="expense-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="expense-branch">الفرع</Label>
                            <Select value={branch} onValueChange={setBranch}>
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
                             <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر البند" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="فواتير">فواتير (كهرباء, ماء, انترنت)</SelectItem>
                                    <SelectItem value="رواتب">رواتب</SelectItem>
                                    <SelectItem value="صيانة">صيانة</SelectItem>
                                    <SelectItem value="مستلزمات">مستلزمات تشغيلية</SelectItem>
                                    <SelectItem value="إيجار">إيجار</SelectItem>
                                    <SelectItem value="أخرى">أخرى</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="expense-amount">المبلغ (ريال)</Label>
                            <Input id="expense-amount" type="number" placeholder="مثال: 500" value={amount} onChange={e => setAmount(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="expense-description">الوصف / ملاحظات</Label>
                            <Textarea id="expense-description" placeholder="اكتب وصفاً موجزاً للمصروف..." value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" size="lg">حفظ المصروف</Button>
                    </div>
                  </form>
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
                            <Input placeholder="ابحث بالوصف أو البند أو الفرع..." className="pr-10" value={searchTerm} onChange={e => handleSearch(e.target.value)}/>
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
                                {filteredExpenses.length === 0 ? (
                                     <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                            لا توجد مصروفات لعرضها.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredExpenses.map((expense) => (
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
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(expense.id)}><FilePenLine className="h-4 w-4" /></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>تعديل</p></TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(expense.id)}><Trash2 className="h-4 w-4" /></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>حذف</p></TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    ))
                                )}
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
