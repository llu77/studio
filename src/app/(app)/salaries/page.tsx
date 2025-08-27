
'use client'

import { useEffect, useState, useMemo, useRef, RefObject, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Check, X, ThumbsUp, ThumbsDown, Printer } from 'lucide-react'
import { UserContext, User } from '../layout' // NEW FEATURE: Import UserContext

type SalaryStatus = 'pending' | 'approved' | 'paid' | 'rejected';

interface SalaryRecord {
  id: number
  date: string
  employeeId: string
  employeeName: string
  branch: string
  basicSalary: number
  deductions: number
  bonuses: number
  netSalary: number
  status: SalaryStatus
  createdBy: string
  createdAt: string
}

// NEW FEATURE: Removed mockEmployees. Will use UserContext.
const mockSalaries: SalaryRecord[] = [
    { id: 1, date: '2024-07-31', employeeId: 'USR002', employeeName: 'محمود عماره', branch: 'فرع لبن', basicSalary: 4500, deductions: 200, bonuses: 300, netSalary: 4600, status: 'paid', createdBy: 'المدير العام', createdAt: '2024-07-28' },
    { id: 2, date: '2024-07-31', employeeId: 'USR005', employeeName: 'محمد إسماعيل', branch: 'فرع طويق', basicSalary: 6000, deductions: 500, bonuses: 750, netSalary: 6250, status: 'paid', createdBy: 'المدير العام', createdAt: '2024-07-28' },
    { id: 3, date: '2024-08-31', employeeId: 'USR002', employeeName: 'محمود عماره', branch: 'فرع لبن', basicSalary: 4500, deductions: 150, bonuses: 0, netSalary: 4350, status: 'approved', createdBy: 'المدير العام', createdAt: '2024-08-28' },
    { id: 4, date: '2024-08-31', employeeId: 'USR001', employeeName: 'عبدالحي', branch: 'فرع لبن', basicSalary: 4200, deductions: 100, bonuses: 200, netSalary: 4300, status: 'pending', createdBy: 'مشرف فرع', createdAt: '2024-08-29' },
    { id: 5, date: '2024-08-31', employeeId: 'USR004', employeeName: 'السيد', branch: 'فرع لبن', basicSalary: 4300, deductions: 0, bonuses: 150, netSalary: 4450, status: 'pending', createdBy: 'مشرف فرع', createdAt: '2024-08-29' },
];

const getStatusText = (status: SalaryStatus) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار'
      case 'approved': return 'موافق عليه'
      case 'paid': return 'مدفوع'
      case 'rejected': return 'مرفوض'
      default: return status
    }
}

const PrintableSalaryReport = ({ records, title }: { records: SalaryRecord[], title: string }) => (
    <div className="p-8">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>الراتب الأساسي</TableHead>
                    <TableHead>الحوافز</TableHead>
                    <TableHead>الخصومات</TableHead>
                    <TableHead>الراتب الصافي</TableHead>
                    <TableHead>الحالة</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.map((salary) => (
                    <TableRow key={salary.id}>
                        <TableCell>{salary.employeeName}</TableCell>
                        <TableCell>{formatCurrency(salary.basicSalary)}</TableCell>
                        <TableCell>{formatCurrency(salary.bonuses)}</TableCell>
                        <TableCell className="text-destructive">{formatCurrency(salary.deductions)}</TableCell>
                        <TableCell className="font-bold text-primary">{formatCurrency(salary.netSalary)}</TableCell>
                        <TableCell>{getStatusText(salary.status)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);



export default function Salaries() {
  const [salaries, setSalaries] = useState<SalaryRecord[]>(mockSalaries)
  // NEW FEATURE: Get users from context
  const { users } = useContext(UserContext); 
  const employees = useMemo(() => users.filter(u => u.role === 'موظف' || u.role === 'مشرف فرع'), [users]);
  
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const { toast } = useToast();
  const [printableReportData, setPrintableReportData] = useState<{ records: SalaryRecord[], title: string } | null>(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    basicSalary: '',
    deductions: '',
    bonuses: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (printableReportData) {
        window.print();
        setPrintableReportData(null); 
    }
  }, [printableReportData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'employeeId') {
      const employee = employees.find(emp => emp.id === value)
      if (employee) {
        // In a real app, base salary would come from employee data
        setFormData(prev => ({
          ...prev,
          employeeId: value,
          basicSalary: '4000' 
        }))
      }
    }
  }

  const calculateNetSalary = () => {
    const basicSalary = parseFloat(formData.basicSalary) || 0
    const deductions = parseFloat(formData.deductions) || 0
    const bonuses = parseFloat(formData.bonuses) || 0
    return basicSalary - deductions + bonuses
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!formData.employeeId || !formData.basicSalary) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الرجاء اختيار الموظف والتأكد من إدخال الراتب الأساسي.'
      })
      return;
    }
    
    setSubmitting(true)
    const newSalary: SalaryRecord = {
        id: salaries.length + 1,
        date: formData.date,
        employeeId: formData.employeeId,
        employeeName: employees.find(e => e.id === formData.employeeId)?.name || 'غير معروف',
        branch: employees.find(e => e.id === formData.employeeId)?.branch || 'غير معروف',
        basicSalary: parseFloat(formData.basicSalary),
        deductions: parseFloat(formData.deductions) || 0,
        bonuses: parseFloat(formData.bonuses) || 0,
        netSalary: calculateNetSalary(),
        status: 'pending',
        createdBy: 'المدير الحالي', // Should be dynamic in a real app
        createdAt: new Date().toISOString()
    };
    setSalaries(prev => [newSalary, ...prev]);
    setFormData({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        basicSalary: '',
        deductions: '',
        bonuses: ''
    })
    setSubmitting(false)
    toast({
        title: "تم إضافة مسير الراتب",
        description: "المسير الآن في حالة الانتظار للموافقة.",
        className: "bg-primary text-primary-foreground",
    });
  }

  const handleBulkStatusChange = (newStatus: SalaryStatus) => {
    if(selectedRows.length === 0) return;
    setSalaries(salaries.map(salary => 
      selectedRows.includes(salary.id) ? { ...salary, status: newStatus } : salary
    ));
    setSelectedRows([]);
    toast({
        title: "تم تحديث السجلات بنجاح",
        description: `تم تحديث حالة ${selectedRows.length} سجل إلى "${getStatusText(newStatus)}".`
    });
  };

  const handlePrintSalary = (salary: SalaryRecord) => {
     setPrintableReportData({ records: [salary], title: `كشف راتب الموظف: ${salary.employeeName}` });
  }

  const handleBulkPrint = () => {
     const recordsToPrint = selectedRows.length > 0 
        ? salaries.filter(s => selectedRows.includes(s.id))
        : salaries;
    if (recordsToPrint.length === 0) {
      toast({
        variant: 'destructive',
        title: 'لا يوجد شيء للطباعة',
        description: 'الرجاء تحديد سجلات أولاً أو التأكد من وجود سجلات لعرضها.'
      });
      return;
    }
     setPrintableReportData({ records: recordsToPrint, title: 'تقرير مسير الرواتب الشامل' });
  }

  const getStatusColor = (status: SalaryStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500'
      case 'approved': return 'bg-blue-500/20 text-blue-500'
      case 'paid': return 'bg-green-500/20 text-green-500'
      case 'rejected': return 'bg-red-500/20 text-red-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const totalSalaries = salaries.reduce((sum, salary) => sum + salary.netSalary, 0)
  const totalBasic = salaries.reduce((sum, salary) => sum + salary.basicSalary, 0)
  const totalDeductions = salaries.reduce((sum, salary) => sum + salary.deductions, 0)
  const totalBonuses = salaries.reduce((sum, salary) => sum + salary.bonuses, 0)

  const pendingSalaries = useMemo(() => salaries.filter(s => s.status === 'pending'), [salaries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <>
      <div className="printable-content hidden">
          {printableReportData && <PrintableSalaryReport {...printableReportData} />}
      </div>
      <div className="non-printable flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">الرواتب</h1>
              <p className="text-gray-400">إدارة مسيرات الرواتب والمستحقات ودورات الموافقة.</p>
            </div>
            <Button
              onClick={handleBulkPrint}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Printer className="ml-2 h-4 w-4" />
              طباعة التقرير الشامل
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">إجمالي الرواتب</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(totalSalaries)}
                </p>
              </div>
            </Card>
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">الرواتب الأساسية</p>
                <p className="text-2xl font-bold text-blue-500">
                  {formatCurrency(totalBasic)}
                </p>
              </div>
            </Card>
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">إجمالي الخصومات</p>
                <p className="text-2xl font-bold text-red-500">
                  {formatCurrency(totalDeductions)}
                </p>
              </div>
            </Card>
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">إجمالي الحوافز</p>
                <p className="text-2xl font-bold text-purple-500">
                  {formatCurrency(totalBonuses)}
                </p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">إضافة مسيرة راتب جديدة</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>الموظف</Label>
                    <Select name="employeeId" value={formData.employeeId} onValueChange={(value) => handleInputChange({ target: { name: 'employeeId', value } } as any)} required>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="اختر الموظف" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white">
                            {employees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                {employee.name} - {employee.role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>التاريخ</Label>
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>الراتب الأساسي</Label>
                    <Input
                      type="number"
                      name="basicSalary"
                      value={formData.basicSalary}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className='flex gap-4'>
                    <div>
                      <Label>الخصومات</Label>
                      <Input
                        type="number"
                        name="deductions"
                        value={formData.deductions}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label>الحوافز</Label>
                      <Input
                        type="number"
                        name="bonuses"
                        value={formData.bonuses}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">الصافي:</span>
                      <span className="text-green-400 font-bold text-lg">
                        {formatCurrency(calculateNetSalary())}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? 'جاري الحفظ...' : 'حفظ مسيرة الراتب'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
              <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                          <CardTitle className="text-xl font-semibold text-white">مسيرات الرواتب</CardTitle>
                          <CardDescription className="text-gray-400 mt-1">
                              {selectedRows.length > 0 ? `تم تحديد ${selectedRows.length} سجل.` : `يوجد ${pendingSalaries.length} سجل بانتظار الموافقة.`}
                          </CardDescription>
                      </div>
                      {selectedRows.length > 0 && (
                          <div className="flex gap-2">
                              <Button onClick={() => handleBulkStatusChange('approved')} className="bg-green-600 hover:bg-green-700"><ThumbsUp className="mr-2 h-4 w-4" />موافقة</Button>
                              <Button onClick={() => handleBulkStatusChange('rejected')} variant="destructive"><ThumbsDown className="mr-2 h-4 w-4" />رفض</Button>
                              <Button onClick={() => handleBulkStatusChange('paid')} className="bg-blue-600 hover:bg-blue-700"><Check className="mr-2 h-4 w-4" />دفع</Button>
                          </div>
                      )}
                  </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="w-10 text-center">
                              <Checkbox
                                  checked={selectedRows.length === salaries.length && salaries.length > 0}
                                  onCheckedChange={(checked) => {
                                      if (checked) {
                                          setSelectedRows(salaries.map(s => s.id));
                                      } else {
                                          setSelectedRows([]);
                                      }
                                  }}
                              />
                        </TableHead>
                        <TableHead className="text-gray-400">التاريخ</TableHead>
                        <TableHead className="text-gray-400">الموظف</TableHead>
                        <TableHead className="text-gray-400">الصافي</TableHead>
                        <TableHead className="text-gray-400">الحالة</TableHead>
                        <TableHead className="text-gray-400">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaries.map((salary) => (
                        <TableRow key={salary.id} className="border-gray-700" data-state={selectedRows.includes(salary.id) ? 'selected' : ''}>
                          <TableCell className="text-center">
                              <Checkbox
                                  checked={selectedRows.includes(salary.id)}
                                  onCheckedChange={(checked) => {
                                      if (checked) {
                                          setSelectedRows([...selectedRows, salary.id]);
                                      } else {
                                          setSelectedRows(selectedRows.filter(id => id !== salary.id));
                                      }
                                  }}
                              />
                          </TableCell>
                          <TableCell>{formatDate(salary.date)}</TableCell>
                          <TableCell>{salary.employeeName}</TableCell>
                          <TableCell className="text-green-400 font-medium">
                            {formatCurrency(salary.netSalary)}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(salary.status)}`}>
                              {getStatusText(salary.status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handlePrintSalary(salary)}
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-gray-700"
                            >
                              طباعة
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </>
  )
}

    