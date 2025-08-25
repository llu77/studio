
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

type RevenueDistribution = {
  employeeName: string;
  amount: number;
};

type RevenueRecord = {
  id: string;
  date: string;
  totalRevenue: number;
  cash: number;
  card: number;
  distribution: RevenueDistribution[];
  status: "Matched" | "Discrepancy" | "Unbalanced";
  discrepancyReason?: string;
};

const mockData: RevenueRecord[] = [
  {
    id: "REV001",
    date: "2024-07-20",
    totalRevenue: 2500,
    cash: 1000,
    card: 1500,
    distribution: [
      { employeeName: "أحمد علي", amount: 1300 },
      { employeeName: "فاطمة محمد", amount: 1200 },
    ],
    status: "Matched",
  },
  {
    id: "REV002",
    date: "2024-07-19",
    totalRevenue: 1800,
    cash: 800,
    card: 1050,
    distribution: [
      { employeeName: "محمد إسماعيل", amount: 1800 },
    ],
    status: "Discrepancy",
    discrepancyReason: "زيادة 50 ريال في صندوق الشبكة."
  },
  {
    id: "REV003",
    date: "2024-07-18",
    totalRevenue: 3200,
    cash: 1200,
    card: 2000,
    distribution: [
      { employeeName: "عبدالحي", amount: 1600 },
      { employeeName: "يوسف خالد", amount: 1500 },
    ],
    status: "Unbalanced",
  },
  {
    id: "REV004",
    date: "2024-07-17",
    totalRevenue: 2150.50,
    cash: 1000.50,
    card: 1150,
    distribution: [
      { employeeName: "عبدالحي", amount: 2150.50 },
    ],
    status: "Matched",
  },
];

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


const PrintableRevenue = React.forwardRef<HTMLDivElement, { records: RevenueRecord[], branch: string }>(({ records, branch }, ref) => (
    <div ref={ref} className="p-8">
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
));
PrintableRevenue.displayName = "PrintableRevenue";


export function RevenueTable() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredData, setFilteredData] = React.useState(mockData);
  const printRef = React.useRef<HTMLDivElement>(null);
  const { currentBranch } = React.useContext(BranchContext);

  React.useEffect(() => {
    const results = mockData.filter(record =>
      record.date.includes(searchTerm) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.distribution.some(d => d.employeeName.includes(searchTerm))
    );
    setFilteredData(results);
  }, [searchTerm]);

  const handlePrint = () => {
      window.print();
  }

  return (
    <>
        <style jsx global>{`
            @media print {
                body > *:not(#printable-area) {
                    display: none;
                }
                #printable-area, #printable-area * {
                    visibility: visible;
                }
                #printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
            }
        `}</style>
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
                            placeholder="ابحث بالتاريخ، الموظف، أو رقم القيد..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                     <Button variant="outline" size="icon" onClick={handlePrint}>
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <TooltipProvider>
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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant={statusVariantMap[record.status]}>{statusTextMap[record.status]}</Badge>
                                </TooltipTrigger>
                                {record.status === 'Discrepancy' && record.discrepancyReason && (
                                    <TooltipContent>
                                        <p>{record.discrepancyReason}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TableCell>
                        <TableCell className="text-left">
                            <div className="flex gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <FilePenLine className="h-4 w-4" />
                                            <span className="sr-only">تعديل</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>تعديل</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
            </TooltipProvider>
            {filteredData.length === 0 && (
                <div className="py-10 text-center text-muted-foreground">
                    لم يتم العثور على سجلات مطابقة.
                </div>
            )}
        </CardContent>
        </Card>
        <div className="invisible">
            <div id="printable-area">
                <PrintableRevenue ref={printRef} records={filteredData} branch={currentBranch} />
            </div>
        </div>
    </>
  );
}
