import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductRequestsPage() {
  return (
    <>
      <Header pageTitle="طلبات المنتجات" />
      <Card>
        <CardHeader>
          <CardTitle>إدارة طلبات المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          <p>سيتم بناء واجهة طلب المنتجات وطباعة الفواتير هنا.</p>
        </CardContent>
      </Card>
    </>
  );
}
