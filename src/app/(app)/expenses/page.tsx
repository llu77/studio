import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpensesPage() {
  return (
    <>
      <Header pageTitle="المصاريف" />
      <Card>
        <CardHeader>
          <CardTitle>إدارة المصاريف</CardTitle>
        </CardHeader>
        <CardContent>
          <p>سيتم بناء واجهة إدخال وتتبع المصاريف هنا.</p>
        </CardContent>
      </Card>
    </>
  );
}
