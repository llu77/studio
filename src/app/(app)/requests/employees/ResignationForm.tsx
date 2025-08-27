// NEW FEATURE: Official Resignation Form with E-Signature
'use client';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserContext, BranchContext } from '@/app/(app)/layout';
import SignatureCanvas from 'react-signature-canvas';
import pdfService from '@/services/pdf.service';
import { useAuth } from '@/hooks/use-auth';

interface ResignationFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

const ResignationForm: React.FC<ResignationFormProps> = ({ onSubmit, onCancel }) => {
  const { user } = useAuth(); // NEW: Get authenticated user
  const { users } = useContext(UserContext);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [supervisorData, setSupervisorData] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
        const employeeData = users.find(u => u.email === user.email);
        if (employeeData) {
            setCurrentUserData(employeeData);
            const supervisor = users.find(u => u.branch === employeeData.branch && u.role === 'مشرف فرع');
            setSupervisorData(supervisor);
        }
    }
  }, [user, users]);

  const generateResignationLetter = () => {
    if (!currentUserData) return "";
    return `
      السلام عليكم ورحمة الله وبركاته
      
      أنا ${currentUserData.name}
      رقم الهوية: ${currentUserData.id}
      
      أتقدم بطلب استقالة وعدم الرغبة في إكمال مدة العقد
      وذلك لأسباب شخصية تخصني
      
      شاكر لكم تعاونكم
      
      مشرف الفرع: ${supervisorData?.name || 'غير محدد'}
      التاريخ: ${new Date().toLocaleDateString('ar-SA')}
    `;
  };

  const handleSaveSignature = () => {
    if (!signatureRef.current?.isEmpty()) {
        toast({ title: "تم حفظ التوقيع مؤقتاً." });
    } else {
        toast({ variant: "destructive", title: "خطأ", description: "الرجاء التوقيع أولاً." });
    }
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmitResignation = async () => {
     if (signatureRef.current?.isEmpty()) {
        toast({ variant: "destructive", title: "التوقيع مطلوب", description: "الرجاء توقيع الطلب قبل الإرسال." });
        return;
    }

    setLoading(true);
    try {
      const signatureDataUrl = signatureRef.current?.toDataURL();
      
      const pdfContent = generateResignationLetter();
      await pdfService.generatePDF({
        title: 'طلب استقالة',
        type: 'request',
        content: { text: pdfContent },
        userData: currentUserData,
        branchData: {
          name: currentUserData?.branch,
          supervisorName: supervisorData?.name
        }
      });
      // In a real scenario, we'd upload the PDF and get a URL
      // const pdfUrl = await pdfService.uploadToFirebase('resignation_request');
      
      const newRequest = {
        type: 'استقالة',
        details: 'طلب استقالة رسمي',
        status: 'pending',
        // In a real app, you'd add pdfUrl and signatures here
      };

      onSubmit(newRequest);
      
    } catch (error) {
      console.error('Error submitting resignation:', error);
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء إرسال الطلب." });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUserData) {
      return <p className="text-center text-muted-foreground">جاري تحميل بيانات الموظف...</p>
  }

  return (
    <div className="resignation-form space-y-6">
      <div className="resignation-letter bg-muted/50 p-4 rounded-lg border">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: 'Tajawal, sans-serif' }}>
          {generateResignationLetter()}
        </pre>
      </div>
      
      <div className="signature-section">
        <Label className="text-base font-semibold mb-2 block">التوقيع الإلكتروني</Label>
        <div className="border rounded-lg overflow-hidden bg-background">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: 'w-full h-40'
            }}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
           <Button
            onClick={handleSaveSignature}
            variant="outline"
            size="sm"
          >
            حفظ التوقيع
          </Button>
          <Button
            onClick={clearSignature}
            variant="destructive"
             size="sm"
          >
            مسح التوقيع
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          onClick={onCancel}
          variant="ghost"
        >
          إلغاء
        </Button>
        <Button 
          onClick={handleSubmitResignation}
          disabled={loading}
          size="lg"
        >
          {loading ? 'جاري الإرسال...' : 'إرسال طلب الاستقالة'}
        </Button>
      </div>
    </div>
  );
};

export default ResignationForm;
