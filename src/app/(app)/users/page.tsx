
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CirclePlus, FilePenLine, Trash2, Search, ListOrdered, Shield, History } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import React, { useState, useContext, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserContext, type User, type Role, type Branch } from "@/app/(app)/layout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ALL_PERMISSIONS = [
  { id: 'dashboard', label: 'لوحة التحكم', description: 'عرض لوحة التحكم الرئيسية' },
  { id: 'revenue', label: 'الإيرادات', description: 'إدارة الإيرادات' },
  { id: 'expenses', label: 'المصاريف', description: 'إدارة المصروفات' },
  { id: 'bonuses', label: 'البونص', description: 'إدارة البونص' },
  { id: 'requests', label: 'الطلبات', description: 'إدارة طلبات الموظفين والمنتجات' },
  { id: 'users', label: 'إدارة المستخدمين', description: 'إضافة وتعديل المستخدمين' },
  { id: 'reports', label: 'التقارير', description: 'عرض وتصدير التقارير' },
  { id: 'settings', label: 'الإعدادات', description: 'تعديل إعدادات النظام' },
];

interface PermissionLog {
  id: number
  userId: string
  userName: string
  action: string
  permissions: string[]
  changedBy: string
  timestamp: string
}

export default function UsersPage() {
    const { toast } = useToast();
    const { users, addUser, deleteUser } = useContext(UserContext);
    const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
    const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [permissionLogs, setPermissionLogs] = useState<PermissionLog[]>([]);

    // Form state for both add and edit
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        password: '',
        role: '' as Role | '',
        branch: '' as Branch | '',
    });

    // Form state for permissions
    const [userPermissions, setUserPermissions] = useState<string[]>([]);

    useEffect(() => {
        handleSearch(searchTerm);
    }, [users, searchTerm]);

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            email: '',
            password: '',
            role: '',
            branch: '',
        });
        setSelectedUser(null);
        setUserPermissions([]);
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password || !formData.role || !formData.branch) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "الرجاء تعبئة جميع الحقول المطلوبة.",
            });
            return;
        }

        const newUser: User = {
            id: `USR${String(users.length + 1).padStart(3, '0')}`,
            name: formData.name,
            email: formData.email,
            role: formData.role as Role,
            branch: formData.branch as Branch,
        };

        addUser(newUser);
        toast({
            title: "تم إضافة المستخدم بنجاح",
            description: `${formData.name} أصبح الآن جزءاً من الفريق.`,
            className: "bg-primary text-primary-foreground",
        });

        resetForm();
        setIsAddDialogOpen(false);
    };

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setFormData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: '', // Password is not shown for editing
            role: user.role,
            branch: user.branch,
        });
        setIsEditDialogOpen(true);
    };

    const handleEditUser = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would involve an API call to update the user.
        // For this mock, we'll just show a toast.
        toast({
            title: "تم حفظ التعديلات (محاكاة)",
            description: `تم تحديث بيانات ${formData.name}.`,
        });
        setIsEditDialogOpen(false);
        resetForm();
    };

    const handleDeleteUser = (userId: string) => {
        const userToDelete = users.find(user => user.id === userId);
        if (userToDelete?.role === 'مدير النظام') {
            toast({ variant: "destructive", title: "لا يمكن حذف المدير" });
            return;
        }
        if (window.confirm(`هل أنت متأكد من حذف المستخدم ${userToDelete?.name}؟`)) {
            deleteUser(userId);
            toast({
                variant: "destructive",
                title: "تم حذف المستخدم",
                description: `تم حذف المستخدم ${userToDelete?.name} من النظام.`,
            });
        }
    };

    const openPermissionsDialog = (user: User) => {
        setSelectedUser(user);
        // In a real app, you would fetch user's permissions. For now, we mock it.
        const mockPermissions = user.role === 'مدير النظام' ? ALL_PERMISSIONS.map(p => p.id) : user.role === 'مشرف فرع' ? ['dashboard', 'revenue', 'expenses', 'requests', 'reports'] : ['dashboard', 'requests'];
        setUserPermissions(mockPermissions);
        setIsPermissionsDialogOpen(true);
    };
    
    const handleUpdatePermissions = () => {
        const newLog: PermissionLog = {
          id: permissionLogs.length + 1,
          userId: selectedUser!.id,
          userName: selectedUser!.name,
          action: 'تحديث صلاحيات',
          permissions: userPermissions,
          changedBy: 'المدير الحالي', // In a real app, get current user name
          timestamp: new Date().toLocaleString('ar-SA')
        }
        setPermissionLogs([newLog, ...permissionLogs]);

        toast({
            title: "تم تحديث الصلاحيات",
            description: `تم حفظ الصلاحيات الجديدة لـ ${selectedUser?.name}.`,
        });
        setIsPermissionsDialogOpen(false);
        resetForm();
    };


    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (!term) {
            setFilteredUsers(users);
        } else {
            const results = users.filter(user => 
                user.name.toLowerCase().includes(term.toLowerCase()) ||
                user.email.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredUsers(results);
        }
    };

  return (
    <>
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <CardTitle>إدارة المستخدمين والصلاحيات</CardTitle>
                        <CardDescription>عرض وإضافة وتعديل المستخدمين وصلاحياتهم في النظام.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dialog open={isLogsDialogOpen} onOpenChange={setIsLogsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline"><History className="mr-2 h-4 w-4"/>سجل التغييرات</Button>
                            </DialogTrigger>
                             <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>سجل تغييرات الصلاحيات</DialogTitle>
                                    <DialogDescription>عرض التغييرات التي تمت على صلاحيات المستخدمين.</DialogDescription>
                                </DialogHeader>
                                <div className="max-h-96 overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>التاريخ</TableHead>
                                            <TableHead>المستخدم</TableHead>
                                            <TableHead>الإجراء</TableHead>
                                            <TableHead>بواسطة</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {permissionLogs.map(log => (
                                            <TableRow key={log.id}>
                                                <TableCell>{log.timestamp}</TableCell>
                                                <TableCell>{log.userName}</TableCell>
                                                <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                                                <TableCell>{log.changedBy}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                 {permissionLogs.length === 0 && <p className="text-center text-muted-foreground py-8">لا يوجد سجلات لعرضها.</p>}
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <CirclePlus className="mr-2 h-4 w-4" />
                                    إضافة مستخدم
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <form onSubmit={handleAddUser}>
                                    <DialogHeader>
                                        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                                        <DialogDescription>أدخل بيانات المستخدم الجديد وحدد صلاحياته.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="user-name">الاسم الكامل</Label>
                                            <Input id="user-name" placeholder="مثال: خالد محمد" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="user-email">البريد الإلكتروني</Label>
                                            <Input id="user-email" type="email" placeholder="user@example.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="user-password">كلمة المرور</Label>
                                            <Input id="user-password" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="user-role">الصلاحية</Label>
                                            <Select required value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as Role})}>
                                                <SelectTrigger><SelectValue placeholder="اختر الصلاحية" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="مدير النظام">مدير النظام</SelectItem>
                                                    <SelectItem value="مشرف فرع">مشرف فرع</SelectItem>
                                                    <SelectItem value="موظف">موظف</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="user-branch">الفرع</Label>
                                            <Select required value={formData.branch} onValueChange={(value) => setFormData({...formData, branch: value as Branch})}>
                                                <SelectTrigger><SelectValue placeholder="اختر الفرع" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="كافة الفروع">كافة الفروع (للمدراء)</SelectItem>
                                                    <SelectItem value="فرع لبن">فرع لبن</SelectItem>
                                                    <SelectItem value="فرع طويق">فرع طويق</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full">حفظ المستخدم</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative w-full mb-4">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="ابحث بالاسم أو البريد..." className="pr-10 w-full" value={searchTerm} onChange={e => handleSearch(e.target.value)} />
                </div>
                <TooltipProvider>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>البريد الإلكتروني</TableHead>
                                    <TableHead>الصلاحية</TableHead>
                                    <TableHead>الفرع</TableHead>
                                    <TableHead className="text-left">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium whitespace-nowrap">{user.name}</TableCell>
                                    <TableCell className="whitespace-nowrap text-muted-foreground">{user.email}</TableCell>
                                    <TableCell><Badge variant={user.role === 'مدير النظام' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                                    <TableCell>{user.branch}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 justify-end">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => openPermissionsDialog(user)}><Shield className="h-4 w-4" /></Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>تعديل الصلاحيات</p></TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}><FilePenLine className="h-4 w-4" /></Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>تعديل بيانات المستخدم</p></TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(user.id)} disabled={user.role === 'مدير النظام'}><Trash2 className="h-4 w-4" /></Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>حذف المستخدم</p></TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TooltipProvider>
                {filteredUsers.length === 0 && (
                    <div className="py-10 text-center text-muted-foreground">
                        لم يتم العثور على مستخدمين مطابقين.
                    </div>
                )}
            </CardContent>
        </Card>
    </div>

     {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleEditUser}>
                    <DialogHeader>
                        <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
                        <DialogDescription>تحديث بيانات المستخدم الأساسية.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">الاسم الكامل</Label>
                            <Input id="edit-name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                            <Input id="edit-email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">الصلاحية</Label>
                            <Select required value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as Role})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="مدير النظام">مدير النظام</SelectItem>
                                    <SelectItem value="مشرف فرع">مشرف فرع</SelectItem>
                                    <SelectItem value="موظف">موظف</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-branch">الفرع</Label>
                            <Select required value={formData.branch} onValueChange={(value) => setFormData({...formData, branch: value as Branch})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="كافة الفروع">كافة الفروع (للمدراء)</SelectItem>
                                    <SelectItem value="فرع لبن">فرع لبن</SelectItem>
                                    <SelectItem value="فرع طويق">فرع طويق</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full">حفظ التغييرات</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    
        {/* Permissions Dialog */}
        <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>إدارة صلاحيات: {selectedUser?.name}</DialogTitle>
                    <DialogDescription>
                        حدد الصلاحيات الممنوحة للمستخدم. التغييرات ستؤثر على وصول المستخدم لأجزاء النظام.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ALL_PERMISSIONS.map(permission => (
                            <div key={permission.id} className="flex items-start gap-3 rounded-lg border p-3">
                                <input
                                    type="checkbox"
                                    id={`perm-${permission.id}`}
                                    checked={userPermissions.includes(permission.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setUserPermissions(prev => [...prev, permission.id]);
                                        } else {
                                            setUserPermissions(prev => prev.filter(p => p !== permission.id));
                                        }
                                    }}
                                    className="mt-1 h-4 w-4"
                                />
                                <div className="flex-1">
                                    <Label htmlFor={`perm-${permission.id}`} className="text-sm font-medium cursor-pointer">
                                        {permission.label}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <DialogFooter>
                    <div className="flex gap-2 pt-4 w-full">
                         <Button onClick={handleUpdatePermissions} className="flex-1">حفظ الصلاحيات</Button>
                        <Button onClick={() => setUserPermissions([])} variant="secondary">إلغاء الكل</Button>
                        <Button onClick={() => setUserPermissions(ALL_PERMISSIONS.map(p => p.id))} variant="outline">تحديد الكل</Button>
                    </div>
                 </DialogFooter>
            </DialogContent>
        </Dialog>

    </>
  );
}

