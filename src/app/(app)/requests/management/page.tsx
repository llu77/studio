
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Printer } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import React, { useState, useContext, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserContext, DataContext } from "@/app/(app)/layout";
import { useAuth } from "@/hooks/use-auth";
import pdfService from '@/services/pdf.service';
import type { EmployeeRequest, RequestStatus } from '../employees/page';

const statusMap: { [key in RequestStatus]: { text: string; variant: "secondary" | "default" | "destructive"; icon: React.ElementType } } = {
    pending: { text: "قيد المراجعة", variant: "secondary", icon: Clock },
    approved: { text: "تمت الموافقة", variant: "default", icon: Check },
    rejected: { text: "تم الرفض", variant: "destructive", icon: X },
};

const getRequestTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      'resignation': 'طلب استقالة',
      'leave': 'طلب إجازة',
      'advance': 'طلب سلفة',
      'other': 'طلب آخر',
      'سلفة': 'طلب سلفة',
      'إجازة': 'طلب إجازة',
    };
    return types[type] || type;
};

// THIS PAGE IS FOR ADMINS/SUPERVISORS TO MANAGE REQUESTS
export default function RequestsManagementPage() {
    const { toast } = useToast();
    const { users } = useContext(UserContext);
    const { requests, updateRequestStatus } = useContext(DataContext);
    const { user: authUser, userDetails } = useAuth();
    const [filter, setFilter] = useState('all');

    const visibleRequests = useMemo(() => {
        if (!userDetails) return [];

        let reqs = requests;
        // Admins and partners see all requests.
        if (userDetails.role === 'مدير النظام' || userDetails.role === 'شريك') {
            reqs = requests;
        } else if (userDetails.role === 'مشرف فرع') {
            reqs = requests.filter(r => r.employeeBranch === userDetails.branch);
        } else {
           return []; // Employees should not see this page
        }
        
        if (filter !== 'all') {
            return reqs.filter(r => r.status === filter);
        }

        return reqs;
    }, [requests, userDetails, filter]);
    
    const handleStatusUpdate = (requestId: string, newStatus: RequestStatus) => {
        const notes = (document.getElementById(`notes-${requestId}`) as HTMLTextAreaElement)?.value || (newStatus === 'approved' ? 'تمت الموافقة' : 'تم الرفض');
        updateRequestStatus(requestId, newStatus, notes);
        toast({
            title: `تم تحديث حالة الطلب بنجاح`,
            description: `تم ${newStatus === 'approved' ? 'الموافقة على' : 'رفض'} الطلب رقم ${requestId}.`
        });
    };

    const handlePrintRequest = async (request: EmployeeRequest) => {
        const content = request.type === 'resignation' 
            ? request.details 
            : `
              نوع الطلب: ${getRequestTypeName(request.type)}
              الموظف: ${request.employee}
              الفرع: ${request.employeeBranch}
              التاريخ: ${request.date}
              التفاصيل: ${request.details}
              الحالة: ${statusMap[request.status].text}
              ملاحظات: ${request.notes || 'لا يوجد'}
            `;
            
        const employee = users.find(u => u.id === request.employeeId);
        const supervisor = users.find(u => u.branch === employee?.branch && u.role === 'مشرف فرع');

        await pdfService.generatePDF({
            title: `طلب ${getRequestTypeName(request.type)}`,
            type: 'request',
            content: { text: content },
            userData: employee,
            branchData: {
                name: employee?.branch,
                supervisorName: supervisor?.name
            }
        });
        pdfService.print();
    };

    const handlePrintAllRequests = async () => {
        if (visibleRequests.length === 0) {
            toast({ variant: 'destructive', title: 'لا توجد طلبات للطباعة' });
            return;
        }

        const tableData = visibleRequests.map(req => [
            getRequestTypeName(req.type),
            req.employee,
            req.employeeBranch,
            new Date(req.date).toLocaleDateString('ar-SA'),
            statusMap[req.status].text
        ]);

        const supervisor = users.find(u => u.branch === userDetails?.branch && u.role === 'مشرف فرع');
        
        await pdfService.generatePDF({
            title: 'تقرير الطلبات',
            type: 'report',
            content: {
                table: {
                    headers: [['نوع الطلب', 'الموظف', 'الفرع', 'التاريخ', 'الحالة']],
                    data: tableData
                }
            },
            userData: userDetails,
            branchData: {
                name: userDetails?.branch,
                supervisorName: supervisor?.name || 'الإدارة'
            }
        });
        await pdfService.print();
    };


    if (!userDetails || userDetails.role === 'موظف') {
         return (
             <Card>
                <CardHeader>
                    <CardTitle>غير مصرح بالوصول</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">هذه الصفحة مخصصة للمدراء والمشرفين فقط.</p>
                </CardContent>
            </Card>
        );
    }

  return (
    <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <CardTitle>إدارة طلبات الموظفين</CardTitle>
                <CardDescription>
                    مراجعة طلبات الموظفين والموافقة عليها أو رفضها.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <div className="filters flex gap-2 overflow-x-auto pb-2">
                    <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>الكل</Button>
                    <Button size="sm" variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>قيد المراجعة</Button>
                    <Button size="sm" variant={filter === 'approved' ? 'default' : 'outline'} onClick={() => setFilter('approved')}>الموافق عليها</Button>
                    <Button size="sm" variant={filter === 'rejected' ? 'default' : 'outline'} onClick={() => setFilter('rejected')}>المرفوضة</Button>
                </div>
                <Button size="sm" variant="outline" onClick={handlePrintAllRequests}>
                    <Printer className="ml-2 h-4 w-4" />
                    طباعة
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
            {visibleRequests.map((req) => {
                const statusInfo = statusMap[req.status];
                const StatusIcon = statusInfo.icon;
                return (
                    <div key={req.id} className="request-card border rounded-lg p-4">
                         <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-semibold">{getRequestTypeName(req.type)}</h3>
                                <p className="text-sm text-muted-foreground">لـ: {req.employee} ({req.employeeBranch})</p>
                                <p className="text-xs text-muted-foreground">بتاريخ: {new Date(req.date).toLocaleDateString('ar-SA')}</p>
                            </div>
                            <Badge variant={statusInfo.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.text}
                            </Badge>
                        </div>

                        <p className="mb-3 text-sm">{req.details}</p>
                        
                        {req.notes && <p className="mb-3 p-2 bg-muted rounded-md text-sm"><span className="font-semibold">ملاحظات:</span> {req.notes}</p>}


                        <div className="flex justify-between items-end">
                            <Button variant="outline" size="sm" onClick={() => handlePrintRequest(req)}>
                                <Printer className="mr-2 h-4 w-4" />
                                طباعة الطلب
                            </Button>
                            {req.status === 'pending' && (
                                <div className="flex gap-1 justify-end">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleStatusUpdate(req.id, 'approved')}><Check className="h-4 w-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>موافقة</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleStatusUpdate(req.id, 'rejected')}><X className="h-4 w-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>رفض</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            )}
                        </div>
                        {req.status === 'pending' && (
                            <div className="admin-actions mt-4 p-3 bg-muted/50 rounded">
                                <Label htmlFor={`notes-${req.id}`} className="mb-2 block text-xs font-medium">ملاحظات على القرار (اختياري)</Label>
                                <Textarea id={`notes-${req.id}`} placeholder="أضف ملاحظات على القرار..." rows={2}/>
                            </div>
                        )}
                    </div>
                );
            })}
            </div>
             {visibleRequests.length === 0 && (
                <p className="py-10 text-center text-muted-foreground">لا توجد طلبات لعرضها تطابق الفلتر الحالي.</p>
            )}
        </CardContent>
    </Card>
  );
}
