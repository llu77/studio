
'use client';

import React, { useContext, useMemo } from 'react';
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AiSummary } from "@/components/dashboard/ai-summary";
import { DollarSign, Landmark, Wallet, Users } from "lucide-react";
import { BranchContext, DataContext } from './layout';
import { formatCurrency } from '@/lib/utils';


export default function DashboardPage() {
  const { currentBranch } = useContext(BranchContext);
  const { revenueRecords, expenses } = useContext(DataContext);

  const branchStats = useMemo(() => {
    // This is a simplified filter. In a real app with more branch-specific data,
    // you would filter expenses and revenues by branch.
    // For now, we'll assume the data context holds data for the selected branch.
    
    const totalRevenue = revenueRecords.reduce((acc, record) => acc + record.totalRevenue, 0);
    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    // Placeholder for bonus calculation
    const totalBonus = 1250; 
    
    return {
      revenue: formatCurrency(totalRevenue),
      expenses: formatCurrency(totalExpenses),
      profit: formatCurrency(netProfit),
      bonus: formatCurrency(totalBonus),
      bonusDesc: "تم توزيعها على موظفين", // This can be made dynamic later
    };

  }, [revenueRecords, expenses, currentBranch]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={branchStats.revenue}
          icon={DollarSign}
          description="+20.1% من الشهر الماضي"
        />
        <StatCard
          title="إجمالي المصاريف"
          value={branchStats.expenses}
          icon={Wallet}
          description="+18.1% من الشهر الماضي"
        />
        <StatCard
          title="الأرباح الصافية"
          value={branchStats.profit}
          icon={Landmark}
          description="+21% من الشهر الماضي"
        />
         <StatCard
          title="بونص هذا الأسبوع"
          value={branchStats.bonus}
          icon={Users}
          description={branchStats.bonusDesc}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
            <RevenueChart />
        </div>
        <div className="xl:col-span-1">
            <AiSummary />
        </div>
      </div>
    </div>
  );
}
