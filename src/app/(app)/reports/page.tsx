import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <>
      <Header pageTitle="التقارير" />
      <Card>
        <CardHeader>
          <CardTitle>التقارير والإحصائيات</CardTitle>
        </CardHeader>
        <CardContent>
          <p>سيتم بناء واجهة عرض التقارير والرسوم البيانية وتصدير PDF هنا.</p>
        </CardContent>
      </Card>
    </>
  );
}
