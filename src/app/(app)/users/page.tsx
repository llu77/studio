import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <>
      <Header pageTitle="إدارة المستخدمين" />
      <Card>
        <CardHeader>
          <CardTitle>إدارة المستخدمين والصلاحيات</CardTitle>
        </CardHeader>
        <CardContent>
          <p>سيتم بناء واجهة إضافة وتعديل وحذف المستخدمين هنا.</p>
        </CardContent>
      </Card>
    </>
  );
}
