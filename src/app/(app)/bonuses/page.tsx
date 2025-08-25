import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BonusesPage() {
  return (
    <>
      <Header pageTitle="البونص" />
      <Card>
        <CardHeader>
          <CardTitle>حساب البونص</CardTitle>
        </CardHeader>
        <CardContent>
          <p>سيتم بناء واجهة حساب وتوزيع البونص الأسبوعي هنا.</p>
        </CardContent>
      </Card>
    </>
  );
}
