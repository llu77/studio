
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
import { Check, X, Clock, CirclePlus, ListOrdered } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const mockRequests = [
    { id: 'REQ001', date: '2024-07-21', employee: 'أحمد علي (لبن)', type: 'سلفة', amount: 500, status: 'approved' },
    { id: 'REQ002', date: '2024-07-20', employee: 'يوسف خالد (طويق)', type: 'إجازة', details: 'إجازة مرضية - 3 أيام', status: 'pending' },
    { id: 'REQ003', date: '2024-07-19', employee: 'عبدالحي (طويق)', type: 'سلفة', amount: 300, status: 'rejected' },
    { id: 'REQ004', date: '2024-07-18', employee: 'فاطمة محمد (لبن)', type: 'إجازة', details: 'إجازة سنوية', status: 'approved' },
];

const statusMap = {
    pending: { text: "قيد المراجعة", variant: "secondary", icon: Clock },
    approved: { text: "تمت الموافقة", variant: "default", icon: Check },
    rejected: { text: "تم الرفض", variant: "destructive", icon: X },
};


export default function EmployeeRequestsPage() {
  return (
    <>
       <Tabs defaultValue="view-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3">
          <TabsTrigger value="add-request">
            <CirclePlus className="ms-2" />
            تقديم طلب
          </TabsTrigger>
          <TabsTrigger value="view-requests">
            <ListOrdered className="ms-2" />
            متابعة الطلبات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-request" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>تقديم طلب موظف جديد</CardTitle>
                <CardDescription>يمكن للمدير تقديم طلب نيابة عن الموظفين (سلفة, إجازة, إلخ).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="employee-name">اسم الموظف</Label>
                             <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الموظف" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ahmed">أحمد علي (لبن)</SelectItem>
                                    <SelectItem value="youssef">يوسف خالد (طويق)</SelectItem>
                                    <SelectItem value="abdulhai">عبدالحي (طويق)</SelectItem>
                                    <SelectItem value="fatima">فاطمة محمد (لبن)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="request-type">نوع الطلب</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر نوع الطلب" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="loan">سلفة</SelectItem>
                                    <SelectItem value="leave">إجازة</SelectItem>
                                    <SelectItem value="other">طلب آخر</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="request-details">تفاصيل الطلب (المبلغ، مدة الإجازة، إلخ)</Label>
                        <Textarea id="request-details" placeholder="مثال: سلفة بقيمة 500 ريال، أو إجازة لمدة 5 أيام" />
                    </div>
                    <div className="flex justify-end">
                        <Button size="lg">إرسال الطلب</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="view-requests" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>إدارة طلبات الموظفين</CardTitle>
                    <CardDescription>مراجعة طلبات الموظفين المقدمة والموافقة عليها أو رفضها.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>الموظف</TableHead>
                                <TableHead>نوع الطلب</TableHead>
                                <TableHead>التفاصيل</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead className="text-left">إجراء</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {mockRequests.map((req) => {
                            const statusInfo = statusMap[req.status as keyof typeof statusMap];
                            const StatusIcon = statusInfo.icon;
                            return (
                                <TableRow key={req.id}>
                                    <TableCell>{req.date}</TableCell>
                                    <TableCell>{req.employee}</TableCell>
                                    <TableCell><Badge variant="outline">{req.type}</Badge></TableCell>
                                    <TableCell>{req.amount ? `${req.amount} ريال` : req.details}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusInfo.variant as any}>
                                            <StatusIcon className="mr-1 h-3 w-3" />
                                            {statusInfo.text}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-left">
                                        {req.status === 'pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>موافقة</p></TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700"><X className="h-4 w-4" /></Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>رفض</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
