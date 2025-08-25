import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeRequestsPage() {
  return (
    <>
      <Header pageTitle="طلبات الموظفين" />
      <Card>
        <CardHeader>
          <CardTitle>إدارة طلبات الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          <p>سيتم بناء واجهة تقديم ومتابعة طلبات الموظفين (سلفة, إجازة, إلخ) هنا.</p>
        </CardContent>
      </Card>
    </>
  );
}
