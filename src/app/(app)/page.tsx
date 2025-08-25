import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AiSummary } from "@/components/dashboard/ai-summary";
import { DollarSign, Landmark, Wallet } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      <Header pageTitle="لوحة التحكم" />
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
          title="إجمالي الإيرادات"
          value="45,231.89 ريال"
          icon={DollarSign}
          description="+20.1% من الشهر الماضي"
        />
        <StatCard
          title="إجمالي المصاريف"
          value="12,150.40 ريال"
          icon={Wallet}
          description="+18.1% من الشهر الماضي"
        />
        <StatCard
          title="الأرباح الصافية"
          value="33,081.49 ريال"
          icon={Landmark}
          description="+21% من الشهر الماضي"
        />
         <StatCard
          title="بونص هذا الأسبوع"
          value="1,250 ريال"
          icon={DollarSign}
          description="تم توزيعها على 5 موظفين"
        />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
            <RevenueChart />
        </div>
        <div className="lg:col-span-1 xl:col-span-1">
            <AiSummary />
        </div>
      </div>
    </>
  );
}
