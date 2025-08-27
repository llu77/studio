
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, CirclePlus, ListOrdered, Printer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState, useContext, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserContext, BranchContext, User, Role, DataContext } from "@/app/(app)/layout";
import ResignationForm from "./ResignationForm"; 
import { useAuth } from "@/hooks/use-auth";
import pdfService from '@/services/pdf.service';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type EmployeeRequest = {
    id: string;
    date: string;
    employee: string;
    employeeId: string;
    employeeBranch: string;
    type: string;
    details: string;
    status: RequestStatus;
    notes?: string;
};

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

// THIS PAGE IS NOW FOR EMPLOYEES TO SUBMIT AND VIEW THEIR OWN REQUESTS
export default function EmployeeRequestsPage() {
    const { toast } = useToast();
    const { users } = useContext(UserContext);
    const { requests, addRequest } = useContext(DataContext);
    const { user: authUser, userDetails } = useAuth();
    
    // Form state for new request
    const [requestType, setRequestType] = useState('');
    const [requestDetails, setRequestDetails] = useState('');
    const [activeTab, setActiveTab] = useState('add-request');

    const myRequests = useMemo(() => {
        if (!userDetails) return [];
        return requests.filter(r => r.employeeId === userDetails.id);
    }, [requests, userDetails]);
    
    const supervisor = useMemo(() => {
        if (!userDetails) return null;
        return users.find(u => u.branch === userDetails.branch && u.role === 'مشرف فرع') || null;
    }, [users, userDetails]);

    const handleFormSubmit = async (newRequestData: any) => {
        if(!userDetails) return;

         const newRequest: Omit<EmployeeRequest, 'id'> = {
            date: new Date().toISOString().split('T')[0],
            employee: userDetails.name,
            employeeId: userDetails.id,
            employeeBranch: userDetails.branch,
            status: 'pending', 
            ...newRequestData
        };

        const result = await addRequest(newRequest);

        if (result.success) {
            toast({
                title: "تم إرسال الطلب بنجاح",
                description: "تمت إضافة طلبك إلى القائمة للمراجعة.",
                className: "bg-primary text-primary-foreground",
            });
            resetForm();
            setActiveTab('view-my-requests'); 
        } else {
            toast({
                variant: "destructive",
                title: "فشل الإرسال",
                description: "لم يتم إرسال طلبك بسبب خطأ. الرجاء المحاولة مرة أخرى.",
            });
        }
    };

     const resetForm = () => {
        setRequestType('');
        setRequestDetails('');
    };

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!requestType || !requestDetails) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "الرجاء تعبئة جميع الحقول لتقديم الطلب.",
            });
            return;
        }

        handleFormSubmit({
            type: requestType,
            details: requestDetails
        });
    };

    if (!userDetails || userDetails.role === 'مدير النظام' || userDetails.role === 'شريك') {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>صفحة الموظفين</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">هذه الصفحة مخصصة للموظفين لتقديم ومتابعة طلباتهم.</p>
                </CardContent>
            </Card>
        );
    }
    
  return (
    <div className="non-printable">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3">
                <TabsTrigger value="add-request">
                    <CirclePlus className="ms-2" />
                    تقديم طلب جديد
                </TabsTrigger>
                <TabsTrigger value="view-my-requests">
                    <ListOrdered className="ms-2" />
                    متابعة طلباتي
                </TabsTrigger>
            </TabsList>

            <TabsContent value="add-request" className="mt-6">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>تقديم طلب جديد</CardTitle>
                        <CardDescription>
                            أهلاً بك {userDetails.name}، يمكنك تقديم طلبك من هنا.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-2 mb-6">
                            <Label htmlFor="request-type">نوع الطلب</Label>
                            <Select value={requestType} onValueChange={setRequestType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر نوع الطلب" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="resignation">طلب استقالة</SelectItem>
                                    <SelectItem value="advance">سلفة</SelectItem>
                                    <SelectItem value="leave">إجازة</SelectItem>
                                    <SelectItem value="other">طلب آخر</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {requestType === 'resignation' ? (
                            <div className="space-y-4 border-t pt-6">
                                <ResignationForm 
                                    currentUserData={userDetails}
                                    supervisorData={supervisor}
                                    onSubmit={handleFormSubmit} 
                                    onCancel={resetForm} 
                                />
                            </div>
                        ) : requestType !== '' ? (
                           <form onSubmit={handleSubmitRequest} className="space-y-6 border-t pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="request-details">تفاصيل الطلب</Label>
                                    <Textarea 
                                        id="request-details" 
                                        placeholder="اكتب تفاصيل الطلب هنا..." 
                                        value={requestDetails}
                                        onChange={(e) => setRequestDetails(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" size="lg">إرسال الطلب</Button>
                                </div>
                            </form>
                        ) : null}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="view-my-requests" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>طلباتي</CardTitle>
                        <CardDescription>تابع حالة طلباتك المقدمة.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                        {myRequests.map((req) => {
                            const statusInfo = statusMap[req.status];
                            const StatusIcon = statusInfo.icon;
                            return (
                                <div key={req.id} className="request-card border rounded-lg p-4">
                                     <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold">{getRequestTypeName(req.type)}</h3>
                                            <p className="text-xs text-muted-foreground">بتاريخ: {new Date(req.date).toLocaleDateString('ar-SA')}</p>
                                        </div>
                                        <Badge variant={statusInfo.variant} className="gap-1">
                                            <StatusIcon className="h-3 w-3" />
                                            {statusInfo.text}
                                        </Badge>
                                    </div>

                                    <p className="mb-3 text-sm">{req.details}</p>
                                    
                                    {req.notes && <p className="mb-3 p-2 bg-muted rounded-md text-sm"><span className="font-semibold">ملاحظات الإدارة:</span> {req.notes}</p>}
                                </div>
                            );
                        })}
                        </div>
                         {myRequests.length === 0 && (
                            <p className="py-10 text-center text-muted-foreground">لم تقم بتقديم أي طلبات بعد.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
  );
}
