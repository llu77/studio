
'use client';

import { RevenueForm } from "@/components/revenue/revenue-form";
import { RevenueTable, type RevenueRecord } from "@/components/revenue/revenue-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CirclePlus, ListOrdered } from "lucide-react";
import { useState } from "react";

const mockData: RevenueRecord[] = [
  {
    id: "REV001",
    date: "2024-07-20",
    totalRevenue: 2500,
    cash: 1000,
    card: 1500,
    distribution: [
      { employeeName: "أحمد علي", amount: 1300 },
      { employeeName: "فاطمة محمد", amount: 1200 },
    ],
    status: "Matched",
  },
  {
    id: "REV002",
    date: "2024-07-19",
    totalRevenue: 1800,
    cash: 800,
    card: 1050,
    distribution: [
      { employeeName: "محمد إسماعيل", amount: 1800 },
    ],
    status: "Discrepancy",
    discrepancyReason: "زيادة 50 ريال في صندوق الشبكة."
  },
  {
    id: "REV003",
    date: "2024-07-18",
    totalRevenue: 3200,
    cash: 1200,
    card: 2000,
    distribution: [
      { employeeName: "عبدالحي", amount: 1600 },
      { employeeName: "يوسف خالد", amount: 1500 },
    ],
    status: "Unbalanced",
  },
  {
    id: "REV004",
    date: "2024-07-17",
    totalRevenue: 2150.50,
    cash: 1000.50,
    card: 1150,
    distribution: [
      { employeeName: "عبدالحي", amount: 2150.50 },
    ],
    status: "Matched",
  },
];


export default function RevenuePage() {
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>(mockData);

  const addRevenueRecord = (record: Omit<RevenueRecord, 'id' | 'status'>) => {
    const isMismatched = Math.abs((record.cash + record.card) - record.totalRevenue) > 0.01;
    const distributedTotal = record.distribution.reduce((acc, dist) => acc + (dist.amount || 0), 0);
    const isDistributionUnbalanced = Math.abs(distributedTotal - record.totalRevenue) > 0.01;

    let status: RevenueRecord['status'] = 'Matched';
    if (isDistributionUnbalanced) {
      status = 'Unbalanced';
    } else if (isMismatched) {
      status = 'Discrepancy';
    }

    const newRecord: RevenueRecord = {
      id: `REV${String(revenueRecords.length + 1).padStart(3, '0')}`,
      ...record,
      status,
    };
    setRevenueRecords(prev => [newRecord, ...prev]);
  };
  
  const deleteRevenueRecord = (id: string) => {
    setRevenueRecords(prev => prev.filter(record => record.id !== id));
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
          <RevenueForm onSave={addRevenueRecord} />
        </TabsContent>
        <TabsContent value="view-records" className="mt-6">
          <RevenueTable records={revenueRecords} onDelete={deleteRevenueRecord} />
        </TabsContent>
      </Tabs>
  );
}
