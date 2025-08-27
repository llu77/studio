
'use client';

import { RevenueForm } from "@/components/revenue/revenue-form";
import { RevenueTable, type RevenueRecord } from "@/components/revenue/revenue-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CirclePlus, ListOrdered } from "lucide-react";
import { useContext } from "react";
import { DataContext } from "../layout";
import { useToast } from "@/hooks/use-toast";

export type { RevenueRecord };

export default function RevenuePage() {
  const { revenueRecords, addRevenueRecord, deleteRevenueRecord } = useContext(DataContext);
  const { toast } = useToast();

  const handleSaveRevenue = async (data: Omit<RevenueRecord, 'id' | 'status' | 'branch'>, branch: string) => {
    const result = await addRevenueRecord(data, branch);
    if (result.success) {
      toast({
        title: "نجاح",
        description: "تم حفظ بيانات الإيراد بنجاح.",
        className: "bg-primary text-primary-foreground",
      });
      return true; // Indicate success to the form
    } else {
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: "لم يتم حفظ السجل. الرجاء المحاولة مرة أخرى.",
      });
      return false; // Indicate failure to the form
    }
  };

  return (
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
        <TabsContent value="add-revenue" className="mt-6">
          <RevenueForm onSave={handleSaveRevenue} />
        </TabsContent>
        <TabsContent value="view-records" className="mt-6">
          <RevenueTable records={revenueRecords} onDelete={deleteRevenueRecord} />
        </TabsContent>
      </Tabs>
  );
}
