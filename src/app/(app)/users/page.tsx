
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from '@/lib/utils'
import { Trash2, Edit, Shield, Plus, History } from 'lucide-react'
import { AppSidebarContent } from '@/components/layout/sidebar-content'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'employee'
  branch: string
  position: string
  status: 'active' | 'inactive'
  createdAt: string
  permissions: string[]
}

interface PermissionLog {
  id: number
  userId: string
  userName: string
  action: string
  permissions: string[]
  changedBy: string
  timestamp: string
}

const ALL_PERMISSIONS = [
  { id: 'dashboard', label: 'لوحة التحكم', description: 'عرض لوحة التحكم الرئيسية' },
  { id: 'salaries', label: 'الرواتب', description: 'إدارة مسيرات الرواتب' },
  { id: 'expenses', label: 'المصروفات', description: 'إدارة المصروفات' },
  { id: 'revenue', label: 'الإيرادات', description: 'إدارة الإيرادات' },
  { id: 'products', label: 'المنتجات', description: 'إدارة المنتجات والمخزون' },
  { id: 'reports', label: 'التقارير', description: 'عرض وتصدير التقارير' },
  { id: 'users_manage', label: 'إدارة المستخدمين', description: 'إضافة وتعديل المستخدمين' },
  { id: 'settings', label: 'الإعدادات', description: 'تعديل إعدادات النظام' },
  { id: 'branches', label: 'الفروع', description: 'إدارة الفروع' },
  { id: 'employees', label: 'الموظفين', description: 'إدارة بيانات الموظفين' }
]

const BRANCHES = ['فرع لبن', 'فرع طويق', 'الإدارة']

const mockUsers: User[] = [
    {
      id: 'USR001',
      name: 'مدير النظام',
      email: 'admin@branchflow.com',
      role: 'admin',
      branch: 'الإدارة',
      position: 'مدير النظام',
      status: 'active',
      createdAt: '2024-01-01',
      permissions: ALL_PERMISSIONS.map(p => p.id)
    },
    {
      id: 'USR002',
      name: 'أحمد علي',
      email: 'ahmed@branchflow.com',
      role: 'employee',
      branch: 'فرع لبن',
      position: 'موظف مبيعات',
      status: 'active',
      createdAt: '2024-01-15',
      permissions: ['dashboard', 'revenue', 'requests']
    },
    {
      id: 'USR003',
      name: 'يوسف خالد',
      email: 'youssef@branchflow.com',
      role: 'manager',
      branch: 'فرع طويق',
      position: 'مشرف فرع',
      status: 'active',
      createdAt: '2024-02-01',
      permissions: ['dashboard', 'revenue', 'expenses', 'requests', 'reports', 'employees']
    }
]

const mockLogs: PermissionLog[] = [
    {
      id: 1,
      userId: 'USR003',
      userName: 'يوسف خالد',
      action: 'منح صلاحيات',
      permissions: ['reports', 'employees'],
      changedBy: 'مدير النظام',
      timestamp: '2024-07-01 10:30:00'
    },
]


export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [permissionLogs, setPermissionLogs] = useState<PermissionLog[]>(mockLogs)
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    branch: '',
    position: '',
    permissions: [] as string[]
  })


  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    const newUser: User = {
        id: `USR${Date.now()}`,
        ...formData,
        status: 'active',
        createdAt: new Date().toISOString()
      }
      setUsers(prev => [newUser, ...prev]);
      setIsAddDialogOpen(false)
      resetForm()
  }

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...formData, password: '' } // password not updated this way
          : u
      ))
      setIsEditDialogOpen(false)
      resetForm()
  }

  const handleDeleteUser = (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return
      setUsers(users.filter(u => u.id !== userId))
  }

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
          : u
      ))
  }

  const handleUpdatePermissions = () => {
    if (!selectedUser) return;
    setUsers(users.map(u => 
        u.id === selectedUser?.id 
          ? { ...u, permissions: formData.permissions }
          : u
    ));

    const newLog: PermissionLog = {
      id: permissionLogs.length + 1,
      userId: selectedUser.id,
      userName: selectedUser.name,
      action: 'تحديث صلاحيات',
      permissions: formData.permissions,
      changedBy: 'مدير النظام',
      timestamp: new Date().toLocaleString('ar-SA')
    }
    setPermissionLogs([newLog, ...permissionLogs]);

    setIsPermissionsDialogOpen(false);
    resetForm();
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      branch: '',
      position: '',
      permissions: []
    })
    setSelectedUser(null)
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      branch: user.branch,
      position: user.position,
      permissions: user.permissions
    })
    setIsEditDialogOpen(true)
  }

  const openPermissionsDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
        ...formData,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        position: user.position,
        permissions: user.permissions
    })
    setIsPermissionsDialogOpen(true)
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.branch.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-500'
      case 'manager': return 'bg-blue-500/20 text-blue-500'
      case 'employee': return 'bg-green-500/20 text-green-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير النظام'
      case 'manager': return 'مشرف'
      case 'employee': return 'موظف'
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <AppSidebarContent />
      <div className="flex-1 p-8 space-y-8 text-white">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">إدارة المستخدمين</h1>
            <p className="text-gray-400">إدارة حسابات المستخدمين والصلاحيات</p>
          </div>

          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="البحث عن مستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مستخدم جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-white max-w-md border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-xl">إضافة مستخدم جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <Label htmlFor="name">الاسم</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-gray-700 border-gray-600 text-white" required />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-gray-700 border-gray-600 text-white" required />
                  </div>
                  <div>
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-gray-700 border-gray-600 text-white" required />
                  </div>
                  <div>
                    <Label htmlFor="role">الدور</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600 text-white">
                        <SelectItem value="admin">مدير النظام</SelectItem>
                        <SelectItem value="manager">مشرف</SelectItem>
                        <SelectItem value="employee">موظف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="branch">الفرع</Label>
                    <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="اختر الفرع" /></SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600 text-white">
                        {BRANCHES.map(branch => (<SelectItem key={branch} value={branch}>{branch}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">المنصب</Label>
                    <Input id="position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="bg-gray-700 border-gray-600 text-white" required />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">إضافة المستخدم</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button onClick={() => setIsLogsDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700"><History className="w-4 h-4 ml-2" />سجل التغييرات</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-800 border-gray-700 p-4">
              <p className="text-gray-400 text-sm mb-2 text-center">إجمالي المستخدمين</p>
              <p className="text-3xl font-bold text-white text-center">{users.length}</p>
            </Card>
            <Card className="bg-gray-800 border-gray-700 p-4">
              <p className="text-gray-400 text-sm mb-2 text-center">المستخدمون النشطون</p>
              <p className="text-3xl font-bold text-green-500 text-center">{users.filter(u => u.status === 'active').length}</p>
            </Card>
            <Card className="bg-gray-800 border-gray-700 p-4">
              <p className="text-gray-400 text-sm mb-2 text-center">المستخدمون غير النشطين</p>
              <p className="text-3xl font-bold text-red-500 text-center">{users.filter(u => u.status === 'inactive').length}</p>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">قائمة المستخدمين</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-800">
                    <TableHead className="text-gray-400">الاسم</TableHead>
                    <TableHead className="text-gray-400">البريد الإلكتروني</TableHead>
                    <TableHead className="text-gray-400">الدور</TableHead>
                    <TableHead className="text-gray-400">الفرع</TableHead>
                    <TableHead className="text-gray-400">الحالة</TableHead>
                    <TableHead className="text-gray-400">الصلاحيات</TableHead>
                    <TableHead className="text-gray-400">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id} className="border-gray-700 hover:bg-gray-700">
                      <TableCell className="text-white">{user.name}</TableCell>
                      <TableCell className="text-gray-300">{user.email}</TableCell>
                      <TableCell><Badge className={getRoleBadgeColor(user.role)}>{getRoleLabel(user.role)}</Badge></TableCell>
                      <TableCell className="text-gray-300">{user.branch}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleToggleStatus(user.id)} className={`h-auto px-2 py-1 text-xs ${user.status === 'active' ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
                          {user.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => openPermissionsDialog(user)} variant={'ghost'} className="text-blue-500 hover:text-blue-400 flex items-center gap-1 p-1 h-auto">
                          <Shield className="w-4 h-4" />
                          {user.permissions.length} صلاحية
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button onClick={() => openEditDialog(user)} variant={'ghost'} size={'icon'} className="text-blue-500 hover:text-blue-400 h-8 w-8" title="تعديل"><Edit className="w-4 h-4" /></Button>
                          {user.role !== 'admin' && (<Button onClick={() => handleDeleteUser(user.id)} variant={'ghost'} size={'icon'} className="text-red-500 hover:text-red-400 h-8 w-8" title="حذف"><Trash2 className="w-4 h-4" /></Button>)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-gray-800 text-white max-w-md border-gray-700">
              <DialogHeader><DialogTitle className="text-xl">تعديل المستخدم</DialogTitle></DialogHeader>
              <form onSubmit={handleEditUser} className="space-y-4">
                 <div><Label>الاسم</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-gray-700 border-gray-600 text-white" required /></div>
                 <div><Label>البريد الإلكتروني</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-gray-700 border-gray-600 text-white" required /></div>
                 <div><Label>كلمة المرور (اتركها فارغة لعدم التغيير)</Label><Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-gray-700 border-gray-600 text-white" /></div>
                 <div>
                    <Label>الدور</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600 text-white">
                        <SelectItem value="admin">مدير النظام</SelectItem>
                        <SelectItem value="manager">مشرف</SelectItem>
                        <SelectItem value="employee">موظف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>الفرع</Label>
                    <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600 text-white">
                        {BRANCHES.map(branch => (<SelectItem key={branch} value={branch}>{branch}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                 <div><Label>المنصب</Label><Input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="bg-gray-700 border-gray-600 text-white" required /></div>
                 <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">حفظ التغييرات</Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Permissions Dialog */}
          <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
              <DialogContent className="bg-gray-800 text-white max-w-2xl border-gray-700">
                  <DialogHeader><DialogTitle className="text-xl">إدارة صلاحيات: {selectedUser?.name}</DialogTitle></DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                  <div className="grid grid-cols-2 gap-4">
                      {ALL_PERMISSIONS.map(permission => (
                      <div key={permission.id} className="flex items-start gap-3 rounded-lg border border-gray-700 p-3 bg-gray-900/50">
                          <input type="checkbox" id={`perm-${permission.id}`} checked={formData.permissions.includes(permission.id)} onChange={(e) => {
                              const newPermissions = e.target.checked
                                  ? [...formData.permissions, permission.id]
                                  : formData.permissions.filter(p => p !== permission.id);
                              setFormData(prev => ({...prev, permissions: newPermissions}));
                          }} className="mt-1 h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500" />
                          <div className="flex-1"><Label htmlFor={`perm-${permission.id}`} className="text-white cursor-pointer">{permission.label}</Label><p className="text-xs text-gray-400">{permission.description}</p></div>
                      </div>
                      ))}
                  </div>
                  </div>
                  <DialogFooter className="!justify-between pt-4">
                      <div>
                          <Button onClick={() => setFormData(prev => ({...prev, permissions: []}))} variant="destructive">إلغاء الكل</Button>
                          <Button onClick={() => setFormData(prev => ({...prev, permissions: ALL_PERMISSIONS.map(p => p.id)}))} variant="outline" className='mr-2'>تحديد الكل</Button>
                      </div>
                      <Button onClick={handleUpdatePermissions} className="bg-blue-600 hover:bg-blue-700">حفظ الصلاحيات</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>


          {/* Permission Logs Dialog */}
          <Dialog open={isLogsDialogOpen} onOpenChange={setIsLogsDialogOpen}>
            <DialogContent className="bg-gray-800 text-white max-w-3xl border-gray-700">
              <DialogHeader><DialogTitle className="text-xl">سجل تغييرات الصلاحيات</DialogTitle></DialogHeader>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader><TableRow className="border-gray-700 hover:bg-gray-800"><TableHead className="text-gray-400">التاريخ</TableHead><TableHead className="text-gray-400">المستخدم</TableHead><TableHead className="text-gray-400">الإجراء</TableHead><TableHead className="text-gray-400">بواسطة</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {permissionLogs.map(log => (
                      <TableRow key={log.id} className="border-gray-700">
                        <TableCell className="text-sm">{log.timestamp}</TableCell>
                        <TableCell className="text-sm">{log.userName}</TableCell>
                        <TableCell><Badge className={log.action.includes('منح') ? 'bg-green-500/20 text-green-500' : log.action.includes('إلغاء') ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}>{log.action}</Badge></TableCell>
                        <TableCell className="text-sm">{log.changedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
      </div>
    </div>
  )
}
