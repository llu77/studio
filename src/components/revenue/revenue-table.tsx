
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePenLine, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BranchContext } from "@/app/(app)/layout";
import { useToast } from "@/hooks/use-toast";


type RevenueDistribution = {
  employeeName: string;
  amount: number;
};

export type RevenueRecord = {
  id: string;
  date: string;
  totalRevenue: number;
  cash: number;
  card: number;
  distribution: RevenueDistribution[];
  status: "Matched" | "Discrepancy" | "Unbalanced";
  discrepancyReason?: string;
};

const statusVariantMap: { [key in RevenueRecord['status']]: 'default' | 'destructive' | 'secondary' } = {
    Matched: 'default',
    Discrepancy: 'destructive',
    Unbalanced: 'secondary'
}

const statusTextMap: { [key in RevenueRecord['status']]: string } = {
    Matched: 'متطابق',
    Discrepancy: 'فرق بالإجمالي',
    Unbalanced: 'فرق بالتوزيع'
}


const PrintableRevenue = ({ records, branch }: { records: RevenueRecord[], branch: string }) => (
    <div className="p-8">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">تقرير سجل الإيرادات</h1>
            <p className="text-muted-foreground">الفرع: {branch === 'laban' ? 'لبن' : 'طويق'}</p>
            <p className="text-muted-foreground">تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>رقم القيد</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>التوزيع</TableHead>
                    <TableHead>الحالة</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.map((record) => (
                    <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.id}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.totalRevenue.toFixed(2)} ريال</TableCell>
                        <TableCell>
                            <ul className="list-disc pr-4">
                                {record.distribution.map((d, i) => (
                                    <li key={i}>{d.employeeName}: {d.amount.toFixed(2)} ريال</li>
                                ))}
                            </ul>
                        </TableCell>
                        <TableCell>
                            <Badge variant={statusVariantMap[record.status]}>{statusTextMap[record.status]}</Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);


interface RevenueTableProps {
    records: RevenueRecord[];
    onDelete: (id: string) => void;
}


export function RevenueTable({ records, onDelete }: RevenueTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredData, setFilteredData] = React.useState(records);
  const { currentBranch } = React.useContext(BranchContext);
  const printRef = React.useRef(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const results = records.filter(record =>
      record.date.includes(searchTerm) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.distribution.some(d => d.employeeName.includes(searchTerm))
    );
    setFilteredData(results);
  }, [searchTerm, records]);

  const handlePrint = () => {
      window.print();
  }

  const handleDelete = (id: string) => {
    onDelete(id);
    toast({
      variant: "destructive",
      title: "تم الحذف",
      description: `تم حذف سجل الإيراد رقم ${id}.`,
    });
  };

  const handleEdit = (id: string) => {
    toast({
        title: "غير متاح حالياً",
        description: `ميزة تعديل سجل الإيراد ${id} سيتم إضافتها قريباً.`,
    });
  }

  return (
    <>
      <div className="printable-content hidden" ref={printRef}>
        <PrintableRevenue records={filteredData} branch={currentBranch} />
      </div>
      <div className="non-printable">
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>سجل الإيرادات</CardTitle>
                        <CardDescription>عرض وبحث في سجل الإيرادات المدخلة للشهر الحالي.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-grow">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ابحث بالتاريخ، الموظف..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10"
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={handlePrint}>
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">طباعة</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                          <TableRow>
                          <TableHead>رقم القيد</TableHead>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>الإجمالي</TableHead>
                          <TableHead>التوزيع</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead className="text-left">إجراءات</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {filteredData.map((record) => (
                          <TableRow key={record.id}>
                              <TableCell className="font-medium whitespace-nowrap">{record.id}</TableCell>
                              <TableCell className="whitespace-nowrap">{record.date}</TableCell>
                              <TableCell className="whitespace-nowrap">{record.totalRevenue.toFixed(2)} ريال</TableCell>
                              <TableCell>
                                  <ul className="list-disc pr-4">
                                      {record.distribution.map((d, i) => (
                                          <li key={i} className="whitespace-nowrap">{d.employeeName}: {d.amount.toFixed(2)} ريال</li>
                                      ))}
                                  </ul>
                              </TableCell>
                              <TableCell>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                          <Badge variant={statusVariantMap[record.status]}>{statusTextMap[record.status]}</Badge>
                                      </TooltipTrigger>
                                      {record.status === 'Discrepancy' && record.discrepancyReason && (
                                          <TooltipContent>
                                              <p>{record.discrepancyReason}</p>
                                          </TooltipContent>
                                      )}
                                      {record.status === 'Unbalanced' && (
                                           <TooltipContent>
                                              <p>مجموع المبالغ الموزعة لا يساوي إجمالي الإيرادات.</p>
                                          </TooltipContent>
                                      )}
                                  </Tooltip>
                              </TableCell>
                              <TableCell className="text-left">
                                  <div className="flex gap-1 justify-end">
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <Button variant="ghost" size="icon" onClick={() => handleEdit(record.id)}>
                                                  <FilePenLine className="h-4 w-4" />
                                                  <span className="sr-only">تعديل</span>
                                              </Button>
                                          </TooltipTrigger>
                                          <TooltipContent><p>تعديل</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(record.id)}>
                                                  <Trash2 className="h-4 w-4" />
                                                  <span className="sr-only">حذف</span>
                                              </Button>
                                          </TooltipTrigger>
                                          <TooltipContent><p>حذف</p></TooltipContent>
                                      </Tooltip>
                                  </div>
                              </TableCell>
                          </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TooltipProvider>
                {filteredData.length === 0 && (
                    <div className="py-10 text-center text-muted-foreground">
                        لم يتم العثور على سجلات مطابقة.
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </>
  );
}
