// NEW FEATURE: Unified PDF Service
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
// import { storage } from '@/lib/firebase'; // Assuming firebase is configured

// This is a placeholder for the actual implementation using jsPDF.
// The full implementation will be done in subsequent steps.

class PDFService {
  private doc: jsPDF;
  private logo?: string;
  private defaultFont: string = 'Arial';
  
  constructor() {
    this.doc = new jsPDF();
    // In a real app, you might load a custom font here
    // this.setupArabicFont();
    this.loadCompanyLogo();
  }

  async setupArabicFont() {
    // Add custom Arabic font
    // this.doc.addFileToVFS('Amiri-Regular.ttf', arabicFontBase64);
    // this.doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    // this.doc.setFont('Amiri');
  }

  async loadCompanyLogo() {
      // In a real app, load from a secure source or config
    this.logo = 'https://picsum.photos/seed/logo/120/60';
  }

  public async generatePDF(config: {
    title: string;
    type: 'request' | 'salary' | 'products' | 'report';
    content: any;
    userData: any;
    branchData: any;
  }) {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    this.addHeader(config.title, config.branchData.name);
    this.addContent(config.type, config.content);
    this.addFooter(config.userData, config.branchData);
    this.addPageNumbers();

    return this.doc;
  }

  private addHeader(title: string, branchName: string) {
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Placeholder for logo
    if (this.logo) {
        this.doc.addImage(this.logo, 'PNG', pageWidth / 2 - 30, 10, 60, 30);
    }


    this.doc.setFontSize(24);
    this.doc.setTextColor(30, 64, 175);
    this.doc.text(title, pageWidth / 2, 50, { align: 'center' });
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(107, 114, 128);
    this.doc.text(`تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}`, 20, 20);
    this.doc.text(`مكان الطباعة: ${branchName}`, pageWidth - 20, 20, { align: 'right' });
  }

  private addContent(type: string, content: any, startY: number = 70) {
    if (type === 'report' && content.table) {
        (this.doc as any).autoTable({
            head: content.table.headers,
            body: content.table.data,
            startY: startY,
            theme: 'grid',
            styles: {
              font: this.defaultFont,
              fontSize: 11,
              cellPadding: 5,
              halign: 'right'
            },
            headStyles: {
              fillColor: [243, 244, 246],
              textColor: [31, 41, 55],
              fontStyle: 'bold'
            },
        });
    } else {
        this.doc.setFontSize(12);
        this.doc.setTextColor(31, 41, 55);
        const textContent = typeof content === 'string' ? content : content.text;
        const lines = this.doc.splitTextToSize(textContent || '', 160);
        this.doc.text(lines, 25, startY, { align: 'right', lang: 'ar' });
    }
  }

  private addFooter(userData: any, branchData: any) {
    const pageHeight = this.doc.internal.pageSize.height;
    const pageWidth = this.doc.internal.pageSize.width;
    const footerY = pageHeight - 40;
    
    this.doc.setDrawColor(209, 213, 219);
    this.doc.line(25, footerY - 10, pageWidth - 25, footerY - 10);
    
    this.doc.setFontSize(11);
    this.doc.setTextColor(75, 85, 99);
    
    this.doc.text(`الفرع: ${branchData.name}`, pageWidth - 25, footerY, { align: 'right'});
    this.doc.text(`المشرف: ${branchData.supervisorName || 'غير محدد'}`, pageWidth - 25, footerY + 7, { align: 'right'});
    
    this.doc.text('توقيع المشرف:', pageWidth - 25, footerY + 21, { align: 'right'});
    this.doc.line(pageWidth - 75, footerY + 21, pageWidth - 125, footerY + 21);
    
    if (userData) {
      this.doc.text(`الموظف: ${userData.name}`, 95, footerY, { align: 'right'});
      this.doc.text('توقيع الموظف:', 95, footerY + 21, { align: 'right'});
      this.doc.line(75, footerY + 21, 25, footerY + 21);
    }
  }

  private addPageNumbers() {
    const pageCount = (this.doc as any).internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(10);
      this.doc.setTextColor(156, 163, 175);
      this.doc.text(
        `صفحة ${i} من ${pageCount}`,
        this.doc.internal.pageSize.width / 2,
        this.doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  }
  
  public print() {
    this.doc.autoPrint();
    window.open(this.doc.output('bloburl'), '_blank');
  }

  public download(filename: string) {
    this.doc.save(`${filename}_${Date.now()}.pdf`);
  }

  public async getBlob(): Promise<Blob> {
    return this.doc.output('blob');
  }

//   public async uploadToFirebase(filename: string, storageInstance: any): Promise<string> {
//     const blob = await this.getBlob();
//     const storageRef = ref(storageInstance, `pdfs/${filename}_${Date.now()}.pdf`);
//     const snapshot = await uploadBytes(storageRef, blob);
//     return await getDownloadURL(snapshot.ref);
//   }
}

const pdfService = new PDFService();
export default pdfService;
