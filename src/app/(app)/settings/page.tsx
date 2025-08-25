import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <Header pageTitle="الإعدادات" />
      <Card>
        <CardHeader>
          <CardTitle>إعدادات النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <p>سيتم بناء واجهة إدارة إعدادات التطبيق (المنتجات, الفروع, إلخ) هنا.</p>
        </CardContent>
      </Card>
    </>
  );
}
