
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, CirclePlus, ListOrdered } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import React, { useState, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserContext } from "@/app/(app)/layout";

const initialRequests = [
    { id: 'REQ001', date: '2024-07-21', employee: 'أحمد علي', employeeBranch: 'فرع لبن', type: 'سلفة', details: '500 ريال', status: 'approved' },
    { id: 'REQ002', date: '2024-07-20', employee: 'يوسف خالد', employeeBranch: 'فرع طويق', type: 'إجازة', details: 'إجازة مرضية - 3 أيام', status: 'pending' },
    { id: 'REQ003', date: '2024-07-19', employee: 'عبدالحي', employeeBranch: 'فرع طويق', type: 'سلفة', details: '300 ريال', status: 'rejected' },
    { id: 'REQ004', date: '2024-07-18', employee: 'فاطمة محمد', employeeBranch: 'فرع لبن', type: 'إجازة', details: 'إجازة سنوية', status: 'approved' },
];

type RequestStatus = 'pending' | 'approved' | 'rejected';

type EmployeeRequest = {
    id: string;
    date: string;
    employee: string;
    employeeBranch: string;
    type: string;
    details: string;
    status: RequestStatus;
};

const statusMap: { [key in RequestStatus]: { text: string; variant: "secondary" | "default" | "destructive"; icon: React.ElementType } } = {
    pending: { text: "قيد المراجعة", variant: "secondary", icon: Clock },
    approved: { text: "تمت الموافقة", variant: "default", icon: Check },
    rejected: { text: "تم الرفض", variant: "destructive", icon: X },
};


export default function EmployeeRequestsPage() {
    const { toast } = useToast();
    const { users } = useContext(UserContext);
    const [requests, setRequests] = useState<EmployeeRequest[]>(initialRequests);
    
    // State for the new request form
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [requestType, setRequestType] = useState('');
    const [requestDetails, setRequestDetails] = useState('');

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployeeId || !requestType || !requestDetails) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "الرجاء تعبئة جميع الحقول لتقديم الطلب.",
            });
            return;
        }

        const employeeDetails = users.find(u => u.id === selectedEmployeeId);
        if(!employeeDetails) {
             toast({
                variant: "destructive",
                title: "خطأ",
                description: "لم يتم العثور على الموظف المحدد.",
            });
            return;
        }


        const newRequest: EmployeeRequest = {
            id: `REQ${String(requests.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            employee: employeeDetails.name,
            employeeBranch: employeeDetails.branch,
            type: requestType,
            details: requestDetails,
            status: 'pending',
        };

        setRequests([newRequest, ...requests]);

        // Reset form
        setSelectedEmployeeId('');
        setRequestType('');
        setRequestDetails('');

        toast({
            title: "تم إرسال الطلب بنجاح",
            description: "تمت إضافة طلبك إلى القائمة للمراجعة.",
            className: "bg-primary text-primary-foreground",
        });
    };

    const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
        setRequests(requests.map(req => 
            req.id === requestId ? { ...req, status: newStatus } : req
        ));
        toast({
            title: `تم تحديث حالة الطلب بنجاح`,
            description: `تم ${newStatus === 'approved' ? 'الموافقة على' : 'رفض'} الطلب رقم ${requestId}.`
        });
    };


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
                <CardContent>
                    <form onSubmit={handleSubmitRequest} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="employee-name">اسم الموظف</Label>
                                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الموظف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.filter(u => u.role !== 'مدير النظام').map(user => (
                                            <SelectItem key={user.id} value={user.id}>{user.name} ({user.branch})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="request-type">نوع الطلب</Label>
                                <Select value={requestType} onValueChange={setRequestType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر نوع الطلب" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="سلفة">سلفة</SelectItem>
                                        <SelectItem value="إجازة">إجازة</SelectItem>
                                        <SelectItem value="طلب آخر">طلب آخر</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="request-details">تفاصيل الطلب (المبلغ، مدة الإجازة، إلخ)</Label>
                            <Textarea 
                                id="request-details" 
                                placeholder="مثال: سلفة بقيمة 500 ريال، أو إجازة لمدة 5 أيام" 
                                value={requestDetails}
                                onChange={(e) => setRequestDetails(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" size="lg">إرسال الطلب</Button>
                        </div>
                    </form>
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
                        {requests.map((req) => {
                            const statusInfo = statusMap[req.status];
                            const StatusIcon = statusInfo.icon;
                            return (
                                <TableRow key={req.id}>
                                    <TableCell>{req.date}</TableCell>
                                    <TableCell>{req.employee} <span className="text-muted-foreground text-xs">({req.employeeBranch})</span></TableCell>
                                    <TableCell><Badge variant="outline">{req.type}</Badge></TableCell>
                                    <TableCell>{req.details}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusInfo.variant} className="gap-1">
                                            <StatusIcon className="h-3 w-3" />
                                            {statusInfo.text}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-left">
                                        {req.status === 'pending' && (
                                            <div className="flex gap-1 justify-end">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleStatusChange(req.id, 'approved')}><Check className="h-4 w-4" /></Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>موافقة</p></TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleStatusChange(req.id, 'rejected')}><X className="h-4 w-4" /></Button>
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
