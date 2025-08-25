
'use client';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDown, BarChart2 } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export default function ReportsPage() {
  return (
    <>
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>إنشاء تقرير مخصص</CardTitle>
                <CardDescription>اختر نوع التقرير، الفرع، والنطاق الزمني لعرض البيانات وتصديرها.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <Label htmlFor="report-type">نوع التقرير</Label>
                        <Select>
                            <SelectTrigger id="report-type">
                                <SelectValue placeholder="اختر نوع التقرير" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="revenue">تقرير الإيرادات</SelectItem>
                                <SelectItem value="expenses">تقرير المصروفات</SelectItem>
                                <SelectItem value="profit_loss">تقرير الأرباح والخسائر</SelectItem>
                                <SelectItem value="bonuses">تقرير البونص</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="report-branch">الفرع</Label>
                        <Select>
                            <SelectTrigger id="report-branch">
                                <SelectValue placeholder="اختر الفرع" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">كافة الفروع</SelectItem>
                                <SelectItem value="laban">فرع لبن</SelectItem>
                                <SelectItem value="tuwaiq">فرع طويق</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="start-date">من تاريخ</Label>
                        <Input id="start-date" type="date" />
                    </div>
                     <div>
                        <Label htmlFor="end-date">إلى تاريخ</Label>
                        <Input id="end-date" type="date" />
                    </div>
                </div>
                 <div className="flex justify-end mt-4 gap-2">
                    <Button variant="outline">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        عرض التقرير
                    </Button>
                    <Button>
                        <FileDown className="mr-2 h-4 w-4" />
                        تصدير PDF
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>معاينة التقرير</CardTitle>
                <CardDescription>هنا تظهر معاينة للبيانات المحددة أعلاه.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Example chart, this would be dynamically rendered based on selection */}
                <RevenueChart />
            </CardContent>
        </Card>
      </div>
    </>
  );
}
