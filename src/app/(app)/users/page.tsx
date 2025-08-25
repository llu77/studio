
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CirclePlus, FilePenLine, Trash2, Search, ListOrdered } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import React, { useState, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserContext, type User, type Role, type Branch } from "@/app/(app)/layout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function UsersPage() {
    const { toast } = useToast();
    const { users, addUser, deleteUser } = useContext(UserContext);
    const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role | ''>('');
    const [branch, setBranch] = useState<Branch | ''>('');

    React.useEffect(() => {
        handleSearch(searchTerm);
    }, [users, searchTerm]);


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

        addUser(newUser);

        // Reset form and close dialog
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
        setBranch('');
        setIsDialogOpen(false);

        toast({
            title: "تم حفظ المستخدم بنجاح",
            description: "سيتم إرسال دعوة للمستخدم الجديد عبر البريد الإلكتروني.",
            className: "bg-primary text-primary-foreground",
        });
    };

    const handleDeleteUser = (userId: string) => {
        const userToDelete = users.find(user => user.id === userId);
        deleteUser(userId);
        
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
    <Card>
        <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle>إدارة المستخدمين</CardTitle>
                    <CardDescription>عرض وإضافة وتعديل المستخدمين في النظام.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                     <div className="relative w-full flex-1 md:w-auto md:flex-grow-0">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="ابحث بالاسم أو البريد..." className="pr-10 w-full" value={searchTerm} onChange={e => handleSearch(e.target.value)} />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <CirclePlus className="mr-2 h-4 w-4" />
                                إضافة مستخدم
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                             <form onSubmit={handleSaveUser}>
                                <DialogHeader>
                                    <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                                    <DialogDescription>أدخل بيانات المستخدم الجديد وحدد صلاحياته.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="user-name">الاسم الكامل</Label>
                                        <Input id="user-name" placeholder="مثال: خالد محمد" required value={name} onChange={e => setName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="user-email">البريد الإلكتروني</Label>
                                        <Input id="user-email" type="email" placeholder="user@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="user-password">كلمة المرور</Label>
                                        <Input id="user-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                                    </div>
                                     <div className="space-y-2">
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
                                    <div className="space-y-2">
                                        <Label htmlFor="user-branch">الفرع</Label>
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
                                <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                                <TableCell><Badge variant={user.role === 'مدير النظام' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                                <TableCell>{user.branch}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 justify-end">
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
                </div>
            </TooltipProvider>
             {filteredUsers.length === 0 && (
                <div className="py-10 text-center text-muted-foreground">
                    لم يتم العثور على مستخدمين مطابقين.
                </div>
            )}
        </CardContent>
    </Card>
  );
}
