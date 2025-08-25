
'use client';

import React, { useContext } from 'react';
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AiSummary } from "@/components/dashboard/ai-summary";
import { DollarSign, Landmark, Wallet, Users } from "lucide-react";
import { BranchContext } from './layout';

const branchData = {
  laban: {
    revenue: "45,231.89 ريال",
    expenses: "12,150.40 ريال",
    profit: "33,081.49 ريال",
    bonus: "1,250 ريال",
    bonusDesc: "تم توزيعها على موظفين",
  },
  tuwaiq: {
    revenue: "62,780.50 ريال",
    expenses: "18,920.75 ريال",
    profit: "43,859.75 ريال",
    bonus: "1,800 ريال",
    bonusDesc: "تم توزيعها على 3 موظفين",
  }
};


export default function DashboardPage() {
  const { currentBranch } = useContext(BranchContext);
  const data = branchData[currentBranch as keyof typeof branchData] || branchData.laban;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={data.revenue}
          icon={DollarSign}
          description="+20.1% من الشهر الماضي"
        />
        <StatCard
          title="إجمالي المصاريف"
          value={data.expenses}
          icon={Wallet}
          description="+18.1% من الشهر الماضي"
        />
        <StatCard
          title="الأرباح الصافية"
          value={data.profit}
          icon={Landmark}
          description="+21% من الشهر الماضي"
        />
         <StatCard
          title="بونص هذا الأسبوع"
          value={data.bonus}
          icon={Users}
          description={data.bonusDesc}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <RevenueChart />
        </div>
        <div className="lg:col-span-1">
            <AiSummary />
        </div>
      </div>
    </>
  );
}
