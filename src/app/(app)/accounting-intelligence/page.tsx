'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  analyzeBenfordLaw,
  detectDuplicates,
  analyzeRoundNumbers,
  calculateLiquidityRatios,
  calculateEfficiencyRatios,
  detectStatisticalAnomalies,
  analyzeBehavioralPatterns,
  predictFinancialMetric,
  performComplianceChecks,
  generateIntelligentRecommendations,
  type BenfordAnalysis,
  type DuplicateTransaction,
  type RoundNumberAnalysis,
  type LiquidityRatios,
  type EfficiencyRatios,
  type StatisticalAnomaly,
  type BehavioralPattern,
  type FinancialPrediction,
  type ComplianceCheck,
  type IntelligentRecommendation
} from '@/lib/accounting-intelligence'

interface AnalysisResult {
  benford: BenfordAnalysis | null
  duplicates: DuplicateTransaction[]
  roundNumbers: RoundNumberAnalysis | null
  liquidity: LiquidityRatios | null
  efficiency: EfficiencyRatios | null
  anomalies: StatisticalAnomaly[]
  behavioral: Map<string, BehavioralPattern>
  predictions: Map<string, FinancialPrediction>
  compliance: ComplianceCheck[]
  recommendations: IntelligentRecommendation[]
}

export default function AccountingIntelligencePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'fraud' | 'ratios' | 'anomalies' | 'predictions' | 'compliance' | 'recommendations'>('fraud')
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    performAnalysis()
  }, [selectedPeriod])

  const checkAuth = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/')
    }
  }

  const performAnalysis = async () => {
    setLoading(true)
    try {
      // بيانات تجريبية للتحليل
      const transactions = generateMockTransactions()
      const financialData = generateMockFinancialData()
      const activities = generateMockActivities()
      const historicalRevenue = [95000, 102000, 108000, 115000, 120000, 125000, 130000, 135000]
      
      // تنفيذ التحليلات
      const benford = analyzeBenfordLaw(transactions.map(t => t.amount))
      const duplicates = detectDuplicates(transactions)
      const roundNumbers = analyzeRoundNumbers(transactions)
      const liquidity = calculateLiquidityRatios(financialData)
      const efficiency = calculateEfficiencyRatios({
        ...financialData,
        creditSales: financialData.revenue * 0.8,
        averageReceivables: 45000,
        averageTotalAssets: 500000
      })
      const anomalies = detectStatisticalAnomalies(transactions.map(t => t.amount))
      const behavioral = analyzeBehavioralPatterns(activities)
      
      // التنبؤات
      const predictions = new Map<string, FinancialPrediction>()
      predictions.set('revenue', predictFinancialMetric(historicalRevenue))
      predictions.set('expenses', predictFinancialMetric(historicalRevenue.map(r => r * 0.78)))
      
      // فحوصات الامتثال
      const compliance = performComplianceChecks({
        transactions,
        financialRatios: {
          currentRatio: liquidity.currentRatio.value,
          debtToEquity: 1.5
        }
      })
      
      // التوصيات الذكية
      const recommendations = generateIntelligentRecommendations({
        benfordAnalysis: benford,
        liquidityRatios: liquidity,
        efficiencyRatios: efficiency,
        anomalies,
        behavioralPatterns: behavioral,
        predictions: predictions.get('revenue'),
        complianceChecks: compliance
      })
      
      setAnalysisResult({
        benford,
        duplicates,
        roundNumbers,
        liquidity,
        efficiency,
        anomalies,
        behavioral,
        predictions,
        compliance,
        recommendations
      })
    } catch (error) {
      console.error('Error performing analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockTransactions = () => {
    const transactions = []
    for (let i = 0; i < 500; i++) {
      const amount = Math.random() < 0.1 
        ? Math.round(Math.random() * 10) * 1000  // أرقام مستديرة مشبوهة
        : Math.random() * 50000 + 100
      
      transactions.push({
        id: `TRX-${i}`,
        amount,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        employeeId: `EMP-${Math.floor(Math.random() * 10)}`,
        description: `معاملة ${i}`,
        approved: amount < 10000 || Math.random() > 0.2
      })
    }
    
    // إضافة معاملات مكررة
    for (let i = 0; i < 5; i++) {
      transactions.push({
        id: `DUP-${i}`,
        amount: 9999,
        date: new Date().toISOString(),
        employeeId: 'EMP-SUSPECT',
        description: 'معاملة مكررة',
        approved: false
      })
    }
    
    return transactions
  }

  const generateMockFinancialData = () => ({
    currentAssets: 250000,
    currentLiabilities: 150000,
    inventory: 50000,
    cash: 75000,
    revenue: 135000,
    costOfGoodsSold: 81000,
    averageInventory: 45000
  })

  const generateMockActivities = () => {
    const activities = []
    const users = ['user1', 'user2', 'user3', 'suspect']
    const actions = ['login', 'view_report', 'edit_transaction', 'approve_payment', 'export_data']
    
    for (let i = 0; i < 200; i++) {
      const userId = users[Math.floor(Math.random() * users.length)]
      const hour = userId === 'suspect' 
        ? Math.random() < 0.7 ? 2 : 14  // نشاط مشبوه في أوقات غريبة
        : Math.floor(Math.random() * 8) + 9
      
      activities.push({
        userId,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        action: actions[Math.floor(Math.random() * actions.length)],
        amount: Math.random() < 0.3 ? Math.random() * 10000 : undefined
      })
    }
    
    return activities
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': case 'high': return 'text-red-500 bg-red-500/10'
      case 'medium': case 'warning': return 'text-yellow-500 bg-yellow-500/10'
      case 'low': case 'healthy': return 'text-green-500 bg-green-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحليل الذكي...</div>
      </div>
    )
  }

  return (
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">نظام الذكاء المحاسبي</h1>
          <p className="text-gray-400">كشف الاحتيال والتحليل المتقدم باستخدام الذكاء الاصطناعي</p>
        </div>

        {/* شريط التبويبات */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'fraud', label: 'كشف الاحتيال', icon: '🔍' },
            { id: 'ratios', label: 'النسب المالية', icon: '📊' },
            { id: 'anomalies', label: 'الشذوذ', icon: '⚠️' },
            { id: 'predictions', label: 'التنبؤات', icon: '🔮' },
            { id: 'compliance', label: 'الامتثال', icon: '✅' },
            { id: 'recommendations', label: 'التوصيات', icon: '💡' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* كشف الاحتيال */}
        {activeTab === 'fraud' && analysisResult && (
          <div className="space-y-6">
            {/* قانون بنفورد */}
            {analysisResult.benford && (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  🔢 تحليل قانون بنفورد
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">Chi-Square</p>
                    <p className="text-2xl font-bold text-white">{analysisResult.benford.chiSquare}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">مستوى الخطر</p>
                    <p className={`text-xl font-bold ${getRiskColor(analysisResult.benford.riskLevel)}`}>
                      {analysisResult.benford.riskLevel === 'high' ? 'عالي' :
                       analysisResult.benford.riskLevel === 'medium' ? 'متوسط' : 'منخفض'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">الحالة</p>
                    <p className={`text-xl font-bold ${analysisResult.benford.isAnomaly ? 'text-red-500' : 'text-green-500'}`}>
                      {analysisResult.benford.isAnomaly ? '⚠️ شذوذ محتمل' : '✅ طبيعي'}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-300">{analysisResult.benford.message}</p>
                </div>
                
                {/* رسم بياني للتوزيع */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-3">توزيع الأرقام الأولى</h4>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit, index) => (
                      <div key={digit} className="flex items-center gap-4">
                        <div className="w-8 text-gray-400">{digit}</div>
                        <div className="flex-1 flex gap-2">
                          <div className="flex-1 bg-gray-700 rounded h-6 relative">
                            <div 
                              className="absolute inset-y-0 left-0 bg-blue-600 rounded"
                              style={{ width: `${(analysisResult.benford?.distribution[index] || 0) * 100}%` }}
                            />
                          </div>
                          <div className="flex-1 bg-gray-700 rounded h-6 relative">
                            <div 
                              className="absolute inset-y-0 left-0 bg-green-600 rounded"
                              style={{ width: `${(analysisResult.benford?.expectedDistribution[index] || 0) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-20 text-right text-sm text-gray-400">
                          {((analysisResult.benford?.deviations[index] || 0)).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-8 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <span className="text-gray-400">الفعلي</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded"></div>
                      <span className="text-gray-400">المتوقع</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* المعاملات المكررة */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                🔄 المعاملات المكررة المشبوهة
              </h3>
              {analysisResult.duplicates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-right py-3 px-4 text-gray-400">المعرف</th>
                        <th className="text-right py-3 px-4 text-gray-400">المبلغ</th>
                        <th className="text-right py-3 px-4 text-gray-400">التاريخ</th>
                        <th className="text-center py-3 px-4 text-gray-400">التكرار</th>
                        <th className="text-center py-3 px-4 text-gray-400">الخطر</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResult.duplicates.slice(0, 10).map((dup, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="py-3 px-4 text-gray-300">{dup.id}</td>
                          <td className="py-3 px-4 text-yellow-500">{formatCurrency(dup.amount)}</td>
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(dup.date).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-1 bg-orange-900/50 text-orange-400 rounded">
                              {dup.count}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              dup.risk === 'high' ? 'bg-red-900/50 text-red-400' :
                              dup.risk === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-green-900/50 text-green-400'
                            }`}>
                              {dup.risk === 'high' ? 'عالي' :
                               dup.risk === 'medium' ? 'متوسط' : 'منخفض'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">لا توجد معاملات مكررة مشبوهة</p>
              )}
            </Card>

            {/* الأرقام المستديرة */}
            {analysisResult.roundNumbers && (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  🎯 تحليل الأرقام المستديرة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">المعاملات المشبوهة</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {analysisResult.roundNumbers.totalSuspicious}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">النسبة المئوية</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {analysisResult.roundNumbers.percentageSuspicious.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">الحالة</p>
                    <p className={`text-xl font-bold ${
                      analysisResult.roundNumbers.percentageSuspicious > 10 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {analysisResult.roundNumbers.percentageSuspicious > 10 ? '⚠️ مشبوه' : '✅ طبيعي'}
                    </p>
                  </div>
                </div>
                {analysisResult.roundNumbers.suspiciousTransactions.length > 0 && (
                  <div className="mt-4 p-4 bg-red-900/20 border border-red-600 rounded-lg">
                    <p className="text-sm text-red-400">
                      تم اكتشاف {analysisResult.roundNumbers.suspiciousTransactions.length} معاملة 
                      بأنماط أرقام مشبوهة تتطلب المراجعة
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* النسب المالية */}
        {activeTab === 'ratios' && analysisResult && (
          <div className="space-y-6">
            {/* نسب السيولة */}
            {analysisResult.liquidity && (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">💧 نسب السيولة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-2">النسبة الجارية</h4>
                    <div className={`text-3xl font-bold mb-2 ${getRiskColor(analysisResult.liquidity.currentRatio.status)}`}>
                      {analysisResult.liquidity.currentRatio.value}
                    </div>
                    <p className="text-sm text-gray-400">{analysisResult.liquidity.currentRatio.message}</p>
                    <div className="mt-3 p-2 bg-gray-600 rounded text-xs text-gray-300">
                      المعيار: 1.5 - 3.0
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-2">النسبة السريعة</h4>
                    <div className={`text-3xl font-bold mb-2 ${getRiskColor(analysisResult.liquidity.quickRatio.status)}`}>
                      {analysisResult.liquidity.quickRatio.value}
                    </div>
                    <p className="text-sm text-gray-400">{analysisResult.liquidity.quickRatio.message}</p>
                    <div className="mt-3 p-2 bg-gray-600 rounded text-xs text-gray-300">
                      المعيار: {'>'} 1.0
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-2">نسبة النقدية</h4>
                    <div className={`text-3xl font-bold mb-2 ${getRiskColor(analysisResult.liquidity.cashRatio.status)}`}>
                      {analysisResult.liquidity.cashRatio.value}
                    </div>
                    <p className="text-sm text-gray-400">{analysisResult.liquidity.cashRatio.message}</p>
                    <div className="mt-3 p-2 bg-gray-600 rounded text-xs text-gray-300">
                      المعيار: {'>'} 0.2
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* نسب الكفاءة */}
            {analysisResult.efficiency && (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">⚙️ نسب الكفاءة</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">دوران المخزون</p>
                    <p className="text-xl font-bold text-blue-500">
                      {analysisResult.efficiency.inventoryTurnover}x
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analysisResult.efficiency.daysInventoryOutstanding} يوم
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">دوران المدينين</p>
                    <p className="text-xl font-bold text-green-500">
                      {analysisResult.efficiency.receivablesTurnover}x
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analysisResult.efficiency.daysReceivablesOutstanding} يوم
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">دوران الأصول</p>
                    <p className="text-xl font-bold text-purple-500">
                      {analysisResult.efficiency.assetTurnover}x
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-700 rounded-lg col-span-2 md:col-span-3">
                    <p className="text-sm text-gray-400 mb-1">دورة التشغيل</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {analysisResult.efficiency.operatingCycle} يوم
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      المخزون + المدينين = دورة كاملة
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* الشذوذ */}
        {activeTab === 'anomalies' && analysisResult && (
          <div className="space-y-6">
            {/* الشذوذ الإحصائي */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">📈 الشذوذ الإحصائي</h3>
              {analysisResult.anomalies.length > 0 ? (
                <div className="space-y-3">
                  {analysisResult.anomalies.map((anomaly, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getRiskColor(anomaly.severity)}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{anomaly.description}</p>
                          <p className="text-sm mt-1">القيمة: {formatCurrency(anomaly.value)}</p>
                          <p className="text-sm">Z-Score: {anomaly.zScore}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          anomaly.severity === 'high' ? 'bg-red-600 text-white' :
                          anomaly.severity === 'medium' ? 'bg-yellow-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {anomaly.severity === 'high' ? 'حرج' :
                           anomaly.severity === 'medium' ? 'متوسط' : 'منخفض'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">لا توجد قيم شاذة إحصائياً</p>
              )}
            </Card>

            {/* الأنماط السلوكية */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">👤 الأنماط السلوكية المشبوهة</h3>
              {analysisResult.behavioral.size > 0 ? (
                <div className="space-y-4">
                  {Array.from(analysisResult.behavioral.values())
                    .filter(pattern => pattern.unusualActivity)
                    .map(pattern => (
                      <div key={pattern.userId} className="p-4 bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-semibold text-white">
                            المستخدم: {pattern.userId}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">درجة الخطر:</span>
                            <span className={`text-2xl font-bold ${
                              pattern.riskScore > 70 ? 'text-red-500' :
                              pattern.riskScore > 40 ? 'text-yellow-500' :
                              'text-green-500'
                            }`}>
                              {pattern.riskScore}%
                            </span>
                          </div>
                        </div>
                        
                        {pattern.patterns.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-400 mb-2">الأنماط المكتشفة:</p>
                            <ul className="list-disc list-inside text-sm text-gray-300">
                              {pattern.patterns.map((p, i) => (
                                <li key={i}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {pattern.recommendations.length > 0 && (
                          <div className="p-3 bg-blue-900/20 border border-blue-600 rounded">
                            <p className="text-sm text-blue-400 mb-1">التوصيات:</p>
                            <ul className="list-disc list-inside text-sm text-blue-300">
                              {pattern.recommendations.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-400">لا توجد أنماط سلوكية مشبوهة</p>
              )}
            </Card>
          </div>
        )}

        {/* التنبؤات */}
        {activeTab === 'predictions' && analysisResult && (
          <div className="space-y-6">
            {Array.from(analysisResult.predictions.entries()).map(([metric, prediction]) => (
              <Card key={metric} className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  🔮 تنبؤ {metric === 'revenue' ? 'الإيرادات' : 'المصروفات'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">القيمة المتوقعة</p>
                    <p className="text-2xl font-bold text-blue-500">
                      {formatCurrency(prediction.nextPeriod)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">مستوى الثقة</p>
                    <p className="text-2xl font-bold text-green-500">
                      {prediction.confidence}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">الاتجاه</p>
                    <p className="text-2xl font-bold">
                      {prediction.trend === 'increasing' ? '📈 تصاعدي' :
                       prediction.trend === 'decreasing' ? '📉 تنازلي' : '➡️ مستقر'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">العامل الموسمي</p>
                    <p className="text-2xl font-bold text-purple-500">
                      {prediction.seasonalFactor}x
                    </p>
                  </div>
                </div>
                
                {prediction.riskFactors.length > 0 && (
                  <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                    <p className="text-sm text-yellow-400 mb-2">عوامل الخطر:</p>
                    <ul className="list-disc list-inside text-sm text-yellow-300">
                      {prediction.riskFactors.map((risk, i) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* الامتثال */}
        {activeTab === 'compliance' && analysisResult && (
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">✅ فحوصات الامتثال</h3>
            {analysisResult.compliance.length > 0 ? (
              <div className="space-y-3">
                {analysisResult.compliance.map((check, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    check.passed ? 'bg-green-900/20 border-green-600' : 
                    check.severity === 'error' ? 'bg-red-900/20 border-red-600' :
                    'bg-yellow-900/20 border-yellow-600'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {check.passed ? '✅' : check.severity === 'error' ? '❌' : '⚠️'}
                          </span>
                          <h4 className="text-lg font-semibold text-white">{check.rule}</h4>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{check.details}</p>
                        {check.action && (
                          <p className="text-sm text-blue-400">
                            <strong>الإجراء المطلوب:</strong> {check.action}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        check.severity === 'error' ? 'bg-red-600 text-white' :
                        check.severity === 'warning' ? 'bg-yellow-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {check.severity === 'error' ? 'خطأ' :
                         check.severity === 'warning' ? 'تحذير' : 'معلومة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">جميع فحوصات الامتثال ناجحة</p>
            )}
          </Card>
        )}

        {/* التوصيات */}
        {activeTab === 'recommendations' && analysisResult && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">💡 التوصيات الذكية</h3>
              {analysisResult.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            rec.priority === 'critical' ? 'bg-red-600 text-white' :
                            rec.priority === 'high' ? 'bg-orange-600 text-white' :
                            rec.priority === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {rec.priority === 'critical' ? 'حرج' :
                             rec.priority === 'high' ? 'عالي' :
                             rec.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </span>
                          <h4 className="text-lg font-semibold text-white">{rec.category}</h4>
                        </div>
                        {rec.estimatedROI && (
                          <span className="text-green-500 font-bold">
                            ROI: {rec.estimatedROI}%
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-400">التوصية:</p>
                          <p className="text-white">{rec.recommendation}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">التأثير المتوقع:</p>
                          <p className="text-green-400">{rec.expectedImpact}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">خطة التنفيذ:</p>
                          <p className="text-blue-400">{rec.implementation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">لا توجد توصيات في الوقت الحالي</p>
              )}
            </Card>
            
            {/* زر التحديث */}
            <div className="flex justify-center">
              <button
                onClick={performAnalysis}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                🔄 إعادة التحليل
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
