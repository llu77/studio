
'use client';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CirclePlus, FilePenLine, Trash2, Search, ListOrdered } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


const mockUsers = [
    { id: 'USR001', name: 'المدير العام', email: 'admin@branchflow.com', role: 'مدير النظام', branch: 'كافة الفروع' },
    { id: 'USR002', name: 'أحمد علي', email: 'ahmed@branchflow.com', role: 'موظف', branch: 'فرع لبن' },
    { id: 'USR003', name: 'يوسف خالد', email: 'youssef@branchflow.com', role: 'مشرف فرع', branch: 'فرع طويق' },
    { id: 'USR004', name: 'عبدالحي', email: 'abdulhai@branchflow.com', role: 'موظف', branch: 'فرع طويق' },
    { id: 'USR005', name: 'فاطمة محمد', email: 'fatima@branchflow.com', role: 'موظف', branch: 'فرع لبن' },
];

export default function UsersPage() {
  return (
    <>
      <Tabs defaultValue="view-users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3">
          <TabsTrigger value="add-user">
            <CirclePlus className="ms-2" />
            إضافة مستخدم
          </TabsTrigger>
          <TabsTrigger value="view-users">
            <ListOrdered className="ms-2" />
            عرض المستخدمين
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-user" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>إضافة مستخدم جديد</CardTitle>
                <CardDescription>أدخل بيانات المستخدم الجديد وحدد صلاحياته.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="user-name">الاسم الكامل</Label>
                            <Input id="user-name" placeholder="مثال: خالد محمد" />
                        </div>
                         <div>
                            <Label htmlFor="user-email">البريد الإلكتروني</Label>
                            <Input id="user-email" type="email" placeholder="user@example.com" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="user-password">كلمة المرور</Label>
                            <Input id="user-password" type="password" />
                        </div>
                        <div>
                            <Label htmlFor="user-role">الصلاحية</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الصلاحية" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">مدير النظام</SelectItem>
                                    <SelectItem value="supervisor">مشرف فرع</SelectItem>
                                    <SelectItem value="employee">موظف</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="user-branch">الفرع التابع له</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الفرع" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">كافة الفروع (للمدراء)</SelectItem>
                                <SelectItem value="laban">فرع لبن</SelectItem>
                                <SelectItem value="tuwaiq">فرع طويق</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end">
                        <Button size="lg">حفظ المستخدم</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="view-users" className="mt-4">
           <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>قائمة المستخدمين</CardTitle>
                            <CardDescription>عرض وتعديل المستخدمين الحاليين في النظام.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="ابحث بالاسم أو البريد الإلكتروني..." className="pr-10" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <TooltipProvider>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>البريد الإلكتروني</TableHead>
                                    <TableHead>الصلاحية</TableHead>
                                    <TableHead>الفرع</TableHead>
                                    <TableHead>إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Badge variant={user.role === 'مدير النظام' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                                    <TableCell>{user.branch}</TableCell>
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
