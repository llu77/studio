
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
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";


const initialUsers = [
    { id: 'USR001', name: 'المدير العام', email: 'admin@branchflow.com', role: 'مدير النظام', branch: 'كافة الفروع' },
    { id: 'USR002', name: 'أحمد علي', email: 'ahmed@branchflow.com', role: 'موظف', branch: 'فرع لبن' },
    { id: 'USR003', name: 'يوسف خالد', email: 'youssef@branchflow.com', role: 'مشرف فرع', branch: 'فرع طويق' },
    { id: 'USR004', name: 'عبدالحي', email: 'abdulhai@branchflow.com', role: 'موظف', branch: 'فرع طويق' },
    { id: 'USR005', name: 'فاطمة محمد', email: 'fatima@branchflow.com', role: 'موظف', branch: 'فرع لبن' },
];

type User = typeof initialUsers[0];
type Role = 'مدير النظام' | 'مشرف فرع' | 'موظف';
type Branch = 'كافة الفروع' | 'فرع لبن' | 'فرع طويق' | 'غير محدد';


export default function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role | ''>('');
    const [branch, setBranch] = useState<Branch | ''>('');


    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || !role || !branch) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "الرجاء تعبئة جميع الحقول المطلوبة.",
            });
            return;
        }

        const newUser: User = {
            id: `USR${String(users.length + 1).padStart(3, '0')}`,
            name,
            email,
            role,
            branch
        };

        const updatedUsers = [newUser, ...users];
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);

        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
        setBranch('');

        toast({
            title: "تم حفظ المستخدم بنجاح",
            description: "سيتم إرسال دعوة للمستخدم الجديد عبر البريد الإلكتروني.",
            className: "bg-primary text-primary-foreground",
        });
    };

    const handleDeleteUser = (userId: string) => {
        const updatedUsers = users.filter(user => user.id !== userId);
        const userToDelete = users.find(user => user.id === userId);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        toast({
            variant: "destructive",
            title: "تم حذف المستخدم",
            description: `تم حذف المستخدم ${userToDelete?.name} من النظام.`,
        });
    };

    const handleEditUser = (user: User) => {
        toast({
            title: "غير متاح حالياً",
            description: `ميزة تعديل المستخدم ${user.name} سيتم إضافتها قريباً.`,
        });
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
    }


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
                <CardContent>
                    <form onSubmit={handleSaveUser} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="user-name">الاسم الكامل</Label>
                                <Input id="user-name" placeholder="مثال: خالد محمد" required value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="user-email">البريد الإلكتروني</Label>
                                <Input id="user-email" type="email" placeholder="user@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="user-password">كلمة المرور</Label>
                                <Input id="user-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="user-role">الصلاحية</Label>
                                <Select required value={role} onValueChange={(value) => setRole(value as Role)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الصلاحية" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="مدير النظام">مدير النظام</SelectItem>
                                        <SelectItem value="مشرف فرع">مشرف فرع</SelectItem>
                                        <SelectItem value="موظف">موظف</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="user-branch">الفرع التابع له</Label>
                             <Select required value={branch} onValueChange={(value) => setBranch(value as Branch)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الفرع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="كافة الفروع">كافة الفروع (للمدراء)</SelectItem>
                                    <SelectItem value="فرع لبن">فرع لبن</SelectItem>
                                    <SelectItem value="فرع طويق">فرع طويق</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" size="lg">حفظ المستخدم</Button>
                        </div>
                    </form>
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
                            <Input placeholder="ابحث بالاسم أو البريد الإلكتروني..." className="pr-10" value={searchTerm} onChange={e => handleSearch(e.target.value)} />
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
                                {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Badge variant={user.role === 'مدير النظام' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                                    <TableCell>{user.branch}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}><FilePenLine className="h-4 w-4" /></Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>تعديل</p></TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(user.id)}><Trash2 className="h-4 w-4" /></Button>
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
