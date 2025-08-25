import { Header } from "@/components/layout/header";
import { RevenueForm } from "@/components/revenue/revenue-form";
import { RevenueTable } from "@/components/revenue/revenue-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CirclePlus, ListOrdered } from "lucide-react";

export default function RevenuePage() {
  return (
    <>
      <Header pageTitle="الإيرادات" />
      <Tabs defaultValue="add-revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3">
          <TabsTrigger value="add-revenue">
            <CirclePlus className="ms-2" />
            إدخال إيراد جديد
          </TabsTrigger>
          <TabsTrigger value="view-records">
            <ListOrdered className="ms-2" />
            عرض السجلات
          </TabsTrigger>
        </TabsList>
        <TabsContent value="add-revenue" className="mt-4">
          <RevenueForm />
        </TabsContent>
        <TabsContent value="view-records" className="mt-4">
          <RevenueTable />
        </TabsContent>
      </Tabs>
    </>
  );
}
