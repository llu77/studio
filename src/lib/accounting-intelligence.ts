// نظام الذكاء المحاسبي المتقدم
import crypto from 'crypto'

// ============= كشف الاحتيال =============

// قانون بنفورد - التوزيع المتوقع للأرقام الأولى
const BENFORD_DISTRIBUTION = [
  0.301, // 1
  0.176, // 2
  0.125, // 3
  0.097, // 4
  0.079, // 5
  0.067, // 6
  0.058, // 7
  0.051, // 8
  0.046  // 9
]

export interface BenfordAnalysis {
  chiSquare: number
  isAnomaly: boolean
  distribution: number[]
  expectedDistribution: number[]
  deviations: number[]
  riskLevel: 'low' | 'medium' | 'high'
  message: string
}

// تحليل قانون بنفورد
export function analyzeBenfordLaw(numbers: number[]): BenfordAnalysis {
  if (numbers.length < 100) {
    return {
      chiSquare: 0,
      isAnomaly: false,
      distribution: [],
      expectedDistribution: BENFORD_DISTRIBUTION,
      deviations: [],
      riskLevel: 'low',
      message: 'عينة صغيرة جداً للتحليل الموثوق'
    }
  }

  // حساب توزيع الأرقام الأولى الفعلي
  const firstDigitCounts = new Array(9).fill(0)
  
  numbers.forEach(num => {
    const absNum = Math.abs(num)
    if (absNum >= 1) {
      const firstDigit = parseInt(absNum.toString()[0])
      if (firstDigit >= 1 && firstDigit <= 9) {
        firstDigitCounts[firstDigit - 1]++
      }
    }
  })

  const total = firstDigitCounts.reduce((sum, count) => sum + count, 0)
  const actualDistribution = firstDigitCounts.map(count => count / total)

  // حساب Chi-Square
  let chiSquare = 0
  const deviations: number[] = []
  
  for (let i = 0; i < 9; i++) {
    const expected = BENFORD_DISTRIBUTION[i] * total
    const actual = firstDigitCounts[i]
    if (expected > 0) {
      chiSquare += Math.pow(actual - expected, 2) / expected
    }
    deviations.push(Math.abs(actualDistribution[i] - BENFORD_DISTRIBUTION[i]) * 100)
  }

  // تحديد مستوى الخطر
  let riskLevel: 'low' | 'medium' | 'high'
  let message: string
  
  if (chiSquare > 15.51) {
    riskLevel = 'high'
    message = 'انحراف يتجاوز 15.51 - احتمالية تلاعب عالية'
  } else if (chiSquare > 11.07) {
    riskLevel = 'medium'
    message = 'انحراف بين 11.07-15.51 - يتطلب مراجعة'
  } else {
    riskLevel = 'low'
    message = 'انحراف أقل من 11.07 - طبيعي'
  }

  return {
    chiSquare: Math.round(chiSquare * 100) / 100,
    isAnomaly: chiSquare > 15.51,
    distribution: actualDistribution.map(d => Math.round(d * 1000) / 1000),
    expectedDistribution: BENFORD_DISTRIBUTION,
    deviations,
    riskLevel,
    message
  }
}

// كشف المعاملات المكررة
export interface DuplicateTransaction {
  id: string
  amount: number
  date: string
  employeeId?: string
  description?: string
  count: number
  risk: 'low' | 'medium' | 'high'
}

export function detectDuplicates(
  transactions: Array<{
    id: string
    amount: number
    date: string
    employeeId?: string
    description?: string
  }>,
  tolerance: number = 0.01,
  timeWindowHours: number = 24
): DuplicateTransaction[] {
  const duplicates: Map<string, DuplicateTransaction[]> = new Map()
  
  transactions.forEach((trans, index) => {
    const transDate = new Date(trans.date)
    
    // البحث عن معاملات مشابهة
    transactions.slice(index + 1).forEach(otherTrans => {
      const otherDate = new Date(otherTrans.date)
      const timeDiff = Math.abs(transDate.getTime() - otherDate.getTime()) / (1000 * 60 * 60)
      const amountDiff = Math.abs(trans.amount - otherTrans.amount)
      
      // التحقق من التطابق
      if (timeDiff <= timeWindowHours && amountDiff <= tolerance) {
        const key = `${Math.round(trans.amount)}_${trans.employeeId || 'unknown'}`
        
        if (!duplicates.has(key)) {
          duplicates.set(key, [])
        }
        
        const existing = duplicates.get(key)!
        const found = existing.find(d => d.id === trans.id)
        
        if (!found) {
          existing.push({
            ...trans,
            count: 2,
            risk: timeDiff < 1 ? 'high' : timeDiff < 12 ? 'medium' : 'low'
          })
        } else {
          found.count++
          if (found.count > 3) found.risk = 'high'
        }
      }
    })
  })
  
  return Array.from(duplicates.values()).flat()
}

// تحليل الأرقام المستديرة
export interface RoundNumberAnalysis {
  suspiciousTransactions: Array<{
    id: string
    amount: number
    pattern: string
    risk: 'medium' | 'high'
  }>
  totalSuspicious: number
  percentageSuspicious: number
}

export function analyzeRoundNumbers(
  transactions: Array<{ id: string; amount: number }>
): RoundNumberAnalysis {
  const suspicious: Array<{
    id: string
    amount: number
    pattern: string
    risk: 'medium' | 'high'
  }> = []
  
  const patterns = [
    { regex: /000$/, risk: 'medium' as const, name: 'ينتهي بثلاث أصفار' },
    { regex: /999$/, risk: 'high' as const, name: 'ينتهي بثلاث تسعات' },
    { regex: /^(\d)\1+$/, risk: 'high' as const, name: 'رقم متكرر' },
    { regex: /^[1-9]0+$/, risk: 'medium' as const, name: 'رقم يليه أصفار' }
  ]
  
  transactions.forEach(trans => {
    const amountStr = Math.abs(Math.round(trans.amount)).toString()
    
    patterns.forEach(pattern => {
      if (pattern.regex.test(amountStr)) {
        suspicious.push({
          id: trans.id,
          amount: trans.amount,
          pattern: pattern.name,
          risk: pattern.risk
        })
      }
    })
  })
  
  return {
    suspiciousTransactions: suspicious,
    totalSuspicious: suspicious.length,
    percentageSuspicious: (suspicious.length / transactions.length) * 100
  }
}

// ============= النسب المالية =============

export interface LiquidityRatios {
  currentRatio: {
    value: number
    status: 'healthy' | 'warning' | 'critical'
    message: string
  }
  quickRatio: {
    value: number
    status: 'healthy' | 'warning' | 'critical'
    message: string
  }
  cashRatio: {
    value: number
    status: 'healthy' | 'warning' | 'critical'
    message: string
  }
}

export function calculateLiquidityRatios(data: {
  currentAssets: number
  currentLiabilities: number
  inventory: number
  cash: number
}): LiquidityRatios {
  const { currentAssets, currentLiabilities, inventory, cash } = data
  
  // النسبة الجارية
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0
  let currentStatus: 'healthy' | 'warning' | 'critical'
  let currentMessage: string
  
  if (currentRatio >= 1.5 && currentRatio <= 3.0) {
    currentStatus = 'healthy'
    currentMessage = 'نسبة سيولة صحية'
  } else if (currentRatio >= 1.0 && currentRatio < 1.5) {
    currentStatus = 'warning'
    currentMessage = 'سيولة منخفضة نسبياً'
  } else if (currentRatio < 1.0) {
    currentStatus = 'critical'
    currentMessage = 'مشكلة سيولة حرجة'
  } else {
    currentStatus = 'warning'
    currentMessage = 'سيولة زائدة غير مستغلة'
  }
  
  // النسبة السريعة
  const quickRatio = currentLiabilities > 0 
    ? (currentAssets - inventory) / currentLiabilities 
    : 0
  let quickStatus: 'healthy' | 'warning' | 'critical'
  let quickMessage: string
  
  if (quickRatio >= 1.0) {
    quickStatus = 'healthy'
    quickMessage = 'قدرة جيدة على سداد الالتزامات'
  } else if (quickRatio >= 0.7) {
    quickStatus = 'warning'
    quickMessage = 'قدرة محدودة على السداد السريع'
  } else {
    quickStatus = 'critical'
    quickMessage = 'صعوبة في سداد الالتزامات قصيرة الأجل'
  }
  
  // نسبة النقدية
  const cashRatio = currentLiabilities > 0 ? cash / currentLiabilities : 0
  let cashStatus: 'healthy' | 'warning' | 'critical'
  let cashMessage: string
  
  if (cashRatio >= 0.2) {
    cashStatus = 'healthy'
    cashMessage = 'نقدية كافية'
  } else if (cashRatio >= 0.1) {
    cashStatus = 'warning'
    cashMessage = 'نقدية منخفضة'
  } else {
    cashStatus = 'critical'
    cashMessage = 'نقص حاد في النقدية'
  }
  
  return {
    currentRatio: {
      value: Math.round(currentRatio * 100) / 100,
      status: currentStatus,
      message: currentMessage
    },
    quickRatio: {
      value: Math.round(quickRatio * 100) / 100,
      status: quickStatus,
      message: quickMessage
    },
    cashRatio: {
      value: Math.round(cashRatio * 100) / 100,
      status: cashStatus,
      message: cashMessage
    }
  }
}

export interface EfficiencyRatios {
  inventoryTurnover: number
  daysInventoryOutstanding: number
  receivablesTurnover: number
  daysReceivablesOutstanding: number
  assetTurnover: number
  operatingCycle: number
}

export function calculateEfficiencyRatios(data: {
  costOfGoodsSold: number
  averageInventory: number
  creditSales: number
  averageReceivables: number
  revenue: number
  averageTotalAssets: number
}): EfficiencyRatios {
  const {
    costOfGoodsSold,
    averageInventory,
    creditSales,
    averageReceivables,
    revenue,
    averageTotalAssets
  } = data
  
  const inventoryTurnover = averageInventory > 0 
    ? costOfGoodsSold / averageInventory 
    : 0
  
  const daysInventoryOutstanding = inventoryTurnover > 0 
    ? 365 / inventoryTurnover 
    : 365
  
  const receivablesTurnover = averageReceivables > 0 
    ? creditSales / averageReceivables 
    : 0
  
  const daysReceivablesOutstanding = receivablesTurnover > 0 
    ? 365 / receivablesTurnover 
    : 365
  
  const assetTurnover = averageTotalAssets > 0 
    ? revenue / averageTotalAssets 
    : 0
  
  const operatingCycle = daysInventoryOutstanding + daysReceivablesOutstanding
  
  return {
    inventoryTurnover: Math.round(inventoryTurnover * 100) / 100,
    daysInventoryOutstanding: Math.round(daysInventoryOutstanding),
    receivablesTurnover: Math.round(receivablesTurnover * 100) / 100,
    daysReceivablesOutstanding: Math.round(daysReceivablesOutstanding),
    assetTurnover: Math.round(assetTurnover * 100) / 100,
    operatingCycle: Math.round(operatingCycle)
  }
}

// ============= كشف الشذوذ الإحصائي =============

export interface StatisticalAnomaly {
  value: number
  zScore: number
  isOutlier: boolean
  severity: 'low' | 'medium' | 'high'
  description: string
}

// حساب Z-Score للكشف عن القيم الشاذة
export function detectStatisticalAnomalies(
  values: number[],
  threshold: number = 3
): StatisticalAnomaly[] {
  if (values.length < 3) {
    return []
  }
  
  // حساب المتوسط والانحراف المعياري
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  
  const anomalies: StatisticalAnomaly[] = []
  
  values.forEach(value => {
    const zScore = stdDev > 0 ? Math.abs((value - mean) / stdDev) : 0
    
    if (zScore > threshold) {
      let severity: 'low' | 'medium' | 'high'
      let description: string
      
      if (zScore > 4) {
        severity = 'high'
        description = `قيمة شاذة جداً (Z=${zScore.toFixed(2)})`
      } else if (zScore > 3.5) {
        severity = 'medium'
        description = `قيمة شاذة (Z=${zScore.toFixed(2)})`
      } else {
        severity = 'low'
        description = `انحراف ملحوظ (Z=${zScore.toFixed(2)})`
      }
      
      anomalies.push({
        value,
        zScore: Math.round(zScore * 100) / 100,
        isOutlier: true,
        severity,
        description
      })
    }
  })
  
  return anomalies
}

// ============= تحليل السلوك =============

export interface BehavioralPattern {
  userId: string
  unusualActivity: boolean
  patterns: string[]
  riskScore: number
  recommendations: string[]
}

export function analyzeBehavioralPatterns(
  activities: Array<{
    userId: string
    timestamp: string
    action: string
    amount?: number
  }>
): Map<string, BehavioralPattern> {
  const userPatterns = new Map<string, BehavioralPattern>()
  
  // تجميع الأنشطة حسب المستخدم
  const userActivities = new Map<string, typeof activities>()
  
  activities.forEach(activity => {
    if (!userActivities.has(activity.userId)) {
      userActivities.set(activity.userId, [])
    }
    userActivities.get(activity.userId)!.push(activity)
  })
  
  // تحليل كل مستخدم
  userActivities.forEach((userActs, userId) => {
    const patterns: string[] = []
    let riskScore = 0
    const recommendations: string[] = []
    
    // تحليل الأوقات
    const hours = userActs.map(a => new Date(a.timestamp).getHours())
    const afterHoursActivity = hours.filter(h => h < 6 || h > 22).length
    
    if (afterHoursActivity > userActs.length * 0.3) {
      patterns.push('نشاط متكرر خارج ساعات العمل')
      riskScore += 30
      recommendations.push('مراجعة صلاحيات الوصول خارج ساعات العمل')
    }
    
    // تحليل التكرار
    const actionCounts = new Map<string, number>()
    userActs.forEach(a => {
      actionCounts.set(a.action, (actionCounts.get(a.action) || 0) + 1)
    })
    
    actionCounts.forEach((count, action) => {
      if (count > userActs.length * 0.5) {
        patterns.push(`تكرار مفرط للعملية: ${action}`)
        riskScore += 20
        recommendations.push(`مراجعة الحاجة لتكرار ${action}`)
      }
    })
    
    // تحليل المبالغ
    const amounts = userActs.filter(a => a.amount).map(a => a.amount!)
    if (amounts.length > 0) {
      const anomalies = detectStatisticalAnomalies(amounts)
      if (anomalies.length > 0) {
        patterns.push('مبالغ شاذة في المعاملات')
        riskScore += anomalies.length * 15
        recommendations.push('التحقق من المعاملات ذات المبالغ الشاذة')
      }
    }
    
    userPatterns.set(userId, {
      userId,
      unusualActivity: riskScore > 50,
      patterns,
      riskScore: Math.min(100, riskScore),
      recommendations
    })
  })
  
  return userPatterns
}

// ============= نظام التنبؤ المالي =============

export interface FinancialPrediction {
  nextPeriod: number
  confidence: number
  trend: 'increasing' | 'decreasing' | 'stable'
  seasonalFactor: number
  riskFactors: string[]
}

// تنبؤ بسيط باستخدام المتوسط المتحرك الموزون
export function predictFinancialMetric(
  historicalData: number[],
  weights?: number[]
): FinancialPrediction {
  if (historicalData.length < 3) {
    return {
      nextPeriod: historicalData[historicalData.length - 1] || 0,
      confidence: 0,
      trend: 'stable',
      seasonalFactor: 1,
      riskFactors: ['بيانات تاريخية غير كافية']
    }
  }
  
  // أوزان افتراضية (الأحدث أكثر أهمية)
  if (!weights) {
    weights = []
    for (let i = 0; i < historicalData.length; i++) {
      weights.push(Math.exp(-i * 0.3))
    }
  }
  
  // تطبيع الأوزان
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  const normalizedWeights = weights.map(w => w / totalWeight)
  
  // حساب المتوسط المرجح
  let prediction = 0
  for (let i = 0; i < historicalData.length; i++) {
    prediction += historicalData[historicalData.length - 1 - i] * normalizedWeights[i]
  }
  
  // تحديد الاتجاه
  const recentAvg = historicalData.slice(-3).reduce((sum, val) => sum + val, 0) / 3
  const olderAvg = historicalData.slice(-6, -3).reduce((sum, val) => sum + val, 0) / 3
  
  let trend: 'increasing' | 'decreasing' | 'stable'
  if (recentAvg > olderAvg * 1.05) {
    trend = 'increasing'
  } else if (recentAvg < olderAvg * 0.95) {
    trend = 'decreasing'
  } else {
    trend = 'stable'
  }
  
  // حساب العامل الموسمي
  const seasonalFactor = historicalData.length >= 12 
    ? historicalData[historicalData.length - 12] / olderAvg 
    : 1
  
  // تحديد عوامل الخطر
  const riskFactors: string[] = []
  const volatility = Math.sqrt(
    historicalData.reduce((sum, val) => sum + Math.pow(val - recentAvg, 2), 0) / historicalData.length
  )
  
  if (volatility > recentAvg * 0.3) {
    riskFactors.push('تذبذب عالي في البيانات')
  }
  
  if (trend === 'decreasing' && prediction < recentAvg * 0.8) {
    riskFactors.push('انخفاض متسارع متوقع')
  }
  
  if (Math.abs(seasonalFactor - 1) > 0.2) {
    riskFactors.push('تأثير موسمي قوي')
  }
  
  // حساب مستوى الثقة
  const confidence = Math.max(0, Math.min(100, 100 - volatility / recentAvg * 100))
  
  return {
    nextPeriod: Math.round(prediction * 100) / 100,
    confidence: Math.round(confidence),
    trend,
    seasonalFactor: Math.round(seasonalFactor * 100) / 100,
    riskFactors
  }
}

// ============= نظام الامتثال =============

export interface ComplianceCheck {
  rule: string
  passed: boolean
  severity: 'info' | 'warning' | 'error'
  details: string
  action?: string
}

export function performComplianceChecks(data: {
  transactions?: any[]
  approvals?: any[]
  users?: any[]
  financialRatios?: any
}): ComplianceCheck[] {
  const checks: ComplianceCheck[] = []
  
  // فحص فصل المهام
  if (data.approvals) {
    const selfApprovals = data.approvals.filter(a => a.createdBy === a.approvedBy)
    if (selfApprovals.length > 0) {
      checks.push({
        rule: 'فصل المهام',
        passed: false,
        severity: 'error',
        details: `تم اكتشاف ${selfApprovals.length} حالة موافقة ذاتية`,
        action: 'إلغاء الموافقات الذاتية وإعادة التوجيه'
      })
    }
  }
  
  // فحص حدود المعاملات
  if (data.transactions) {
    const largeTransactions = data.transactions.filter(t => t.amount > 100000)
    const unapprovedLarge = largeTransactions.filter(t => !t.approved)
    
    if (unapprovedLarge.length > 0) {
      checks.push({
        rule: 'حدود الموافقة',
        passed: false,
        severity: 'error',
        details: `${unapprovedLarge.length} معاملة كبيرة بدون موافقة`,
        action: 'تعليق المعاملات حتى الموافقة'
      })
    }
  }
  
  // فحص النسب المالية
  if (data.financialRatios) {
    if (data.financialRatios.currentRatio < 1.0) {
      checks.push({
        rule: 'السيولة المطلوبة',
        passed: false,
        severity: 'warning',
        details: 'النسبة الجارية أقل من 1.0',
        action: 'مراجعة خطة السيولة'
      })
    }
    
    if (data.financialRatios.debtToEquity > 2.0) {
      checks.push({
        rule: 'حد المديونية',
        passed: false,
        severity: 'warning',
        details: 'نسبة الدين إلى حقوق الملكية تتجاوز 2.0',
        action: 'تقليل الاقتراض أو زيادة رأس المال'
      })
    }
  }
  
  // فحص الصلاحيات
  if (data.users) {
    const adminUsers = data.users.filter(u => u.role === 'admin')
    if (adminUsers.length > data.users.length * 0.2) {
      checks.push({
        rule: 'مبدأ الصلاحيات الأقل',
        passed: false,
        severity: 'warning',
        details: 'عدد المسؤولين يتجاوز 20% من المستخدمين',
        action: 'مراجعة وتقليل الصلاحيات الإدارية'
      })
    }
  }
  
  return checks
}

// ============= نظام التوصيات الذكية =============

export interface IntelligentRecommendation {
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
  expectedImpact: string
  implementation: string
  estimatedROI?: number
}

export function generateIntelligentRecommendations(
  analysis: {
    benfordAnalysis?: BenfordAnalysis
    liquidityRatios?: LiquidityRatios
    efficiencyRatios?: EfficiencyRatios
    anomalies?: StatisticalAnomaly[]
    behavioralPatterns?: Map<string, BehavioralPattern>
    predictions?: FinancialPrediction
    complianceChecks?: ComplianceCheck[]
  }
): IntelligentRecommendation[] {
  const recommendations: IntelligentRecommendation[] = []
  
  // توصيات بناءً على قانون بنفورد
  if (analysis.benfordAnalysis?.riskLevel === 'high') {
    recommendations.push({
      category: 'كشف الاحتيال',
      priority: 'critical',
      recommendation: 'إجراء تدقيق جنائي فوري للمعاملات المالية',
      expectedImpact: 'كشف ومنع الاحتيال المحتمل',
      implementation: 'تعيين مدقق خارجي مستقل خلال 48 ساعة'
    })
  }
  
  // توصيات السيولة
  if (analysis.liquidityRatios?.currentRatio.status === 'critical') {
    recommendations.push({
      category: 'إدارة السيولة',
      priority: 'critical',
      recommendation: 'تحسين السيولة بشكل عاجل',
      expectedImpact: 'تجنب العجز عن السداد',
      implementation: 'تسريع التحصيل، تأجيل المدفوعات غير الحرجة، التفاوض على تسهيلات ائتمانية'
    })
  }
  
  // توصيات الكفاءة
  if (analysis.efficiencyRatios && analysis.efficiencyRatios.daysReceivablesOutstanding > 60) {
    recommendations.push({
      category: 'إدارة المدينين',
      priority: 'high',
      recommendation: 'تحسين عملية التحصيل',
      expectedImpact: `تقليل فترة التحصيل بـ ${analysis.efficiencyRatios.daysReceivablesOutstanding - 45} يوم`,
      implementation: 'نظام متابعة آلي، خصومات للسداد المبكر، إجراءات تحصيل صارمة',
      estimatedROI: 15
    })
  }
  
  // توصيات السلوك
  if (analysis.behavioralPatterns) {
    const highRiskUsers = Array.from(analysis.behavioralPatterns.values())
      .filter(p => p.riskScore > 70)
    
    if (highRiskUsers.length > 0) {
      recommendations.push({
        category: 'الأمن والمراقبة',
        priority: 'high',
        recommendation: `مراجعة أنشطة ${highRiskUsers.length} مستخدمين عالي الخطورة`,
        expectedImpact: 'منع الأنشطة الاحتيالية الداخلية',
        implementation: 'تدقيق مفصل للأنشطة، تقييد الصلاحيات، تدريب على الامتثال'
      })
    }
  }
  
  // توصيات الامتثال
  if (analysis.complianceChecks) {
    const failedChecks = analysis.complianceChecks.filter(c => !c.passed)
    
    failedChecks.forEach(check => {
      recommendations.push({
        category: 'الامتثال والحوكمة',
        priority: check.severity === 'error' ? 'critical' : 'medium',
        recommendation: check.action || 'معالجة مشكلة الامتثال',
        expectedImpact: `ضمان الامتثال لقاعدة: ${check.rule}`,
        implementation: check.details
      })
    })
  }
  
  // توصيات التنبؤ
  if (analysis.predictions?.trend === 'decreasing' && analysis.predictions.riskFactors.length > 0) {
    recommendations.push({
      category: 'التخطيط المالي',
      priority: 'medium',
      recommendation: 'وضع خطة طوارئ للانخفاض المتوقع',
      expectedImpact: 'التخفيف من تأثير الانخفاض المتوقع',
      implementation: 'تنويع مصادر الإيرادات، خفض التكاليف المتغيرة، بناء احتياطي'
    })
  }
  
  // ترتيب التوصيات حسب الأولوية
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  
  return recommendations
}



// ملف المعادلات والخوارزميات الحسابية المحسنة

// معادلات الرواتب
export interface SalaryCalculation {
  basicSalary: number
  overtime: number
  overtimeRate: number
  deductions: {
    tax: number
    insurance: number
    loans: number
    absences: number
    other: number
  }
  allowances: {
    housing: number
    transportation: number
    food: number
    phone: number
    other: number
  }
  bonuses: {
    performance: number
    annual: number
    special: number
  }
}

// حساب الضريبة التصاعدية (حسب النظام السعودي)
export function calculateProgressiveTax(salary: number): number {
  const taxBrackets = [
    { min: 0, max: 5000, rate: 0 },
    { min: 5000, max: 10000, rate: 0.05 },
    { min: 10000, max: 20000, rate: 0.10 },
    { min: 20000, max: 50000, rate: 0.15 },
    { min: 50000, max: Infinity, rate: 0.20 }
  ]

  let tax = 0
  for (const bracket of taxBrackets) {
    if (salary > bracket.min) {
      const taxableAmount = Math.min(salary - bracket.min, bracket.max - bracket.min)
      tax += taxableAmount * bracket.rate
    }
  }
  return tax
}

// حساب التأمينات الاجتماعية (GOSI)
export function calculateSocialInsurance(salary: number, isLocal: boolean = true): number {
  const localRate = 0.10 // 10% للمواطنين
  const expatRate = 0.02 // 2% للوافدين
  const maxInsurableSalary = 45000 // الحد الأقصى للراتب الخاضع للتأمين
  
  const insuredSalary = Math.min(salary, maxInsurableSalary)
  return insuredSalary * (isLocal ? localRate : expatRate)
}

// حساب ساعات العمل الإضافي
export function calculateOvertime(
  hoursWorked: number,
  hourlyRate: number,
  overtimeMultiplier: number = 1.5
): number {
  const standardHours = 8 * 22 // 8 ساعات × 22 يوم عمل
  const overtimeHours = Math.max(0, hoursWorked - standardHours)
  return overtimeHours * hourlyRate * overtimeMultiplier
}

// حساب الخصومات للغياب
export function calculateAbsenceDeduction(
  dailySalary: number,
  absenceDays: number,
  deductionRate: number = 1
): number {
  return dailySalary * absenceDays * deductionRate
}

// حساب البدلات كنسبة من الراتب الأساسي
export function calculateAllowances(basicSalary: number): {
  housing: number
  transportation: number
  food: number
} {
  return {
    housing: basicSalary * 0.25, // 25% بدل سكن
    transportation: basicSalary * 0.10, // 10% بدل مواصلات
    food: basicSalary * 0.05 // 5% بدل غذاء
  }
}

// حساب المكافآت بناءً على الأداء
export function calculatePerformanceBonus(
  basicSalary: number,
  performanceScore: number // من 0 إلى 100
): number {
  const bonusPercentage = performanceScore / 100 * 0.30 // حتى 30% من الراتب
  return basicSalary * bonusPercentage
}

// حساب الراتب الصافي الشامل
export function calculateNetSalary(calc: SalaryCalculation): {
  grossSalary: number
  totalDeductions: number
  totalAllowances: number
  totalBonuses: number
  netSalary: number
  breakdown: any
} {
  // حساب إجمالي البدلات
  const totalAllowances = Object.values(calc.allowances).reduce((sum, val) => sum + val, 0)
  
  // حساب إجمالي المكافآت
  const totalBonuses = Object.values(calc.bonuses).reduce((sum, val) => sum + val, 0)
  
  // حساب ساعات العمل الإضافي
  const overtimeAmount = calc.overtime * calc.overtimeRate
  
  // الراتب الإجمالي
  const grossSalary = calc.basicSalary + totalAllowances + totalBonuses + overtimeAmount
  
  // حساب الضريبة على الراتب الإجمالي
  const taxAmount = calculateProgressiveTax(grossSalary)
  
  // إجمالي الخصومات
  const totalDeductions = 
    taxAmount +
    calc.deductions.insurance +
    calc.deductions.loans +
    calc.deductions.absences +
    calc.deductions.other
  
  // الراتب الصافي
  const netSalary = grossSalary - totalDeductions
  
  return {
    grossSalary,
    totalDeductions,
    totalAllowances,
    totalBonuses,
    netSalary,
    breakdown: {
      basic: calc.basicSalary,
      overtime: overtimeAmount,
      allowances: calc.allowances,
      bonuses: calc.bonuses,
      deductions: {
        ...calc.deductions,
        tax: taxAmount
      }
    }
  }
}

// حسابات الإحصائيات المالية
export interface FinancialStats {
  revenues: number[]
  expenses: number[]
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

// حساب معدل النمو
export function calculateGrowthRate(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return ((newValue - oldValue) / oldValue) * 100
}

// حساب المتوسط المتحرك
export function calculateMovingAverage(values: number[], period: number): number[] {
  const result: number[] = []
  for (let i = period - 1; i < values.length; i++) {
    const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    result.push(sum / period)
  }
  return result
}

// حساب الانحراف المعياري
export function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDifferences = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}

// تنبؤ الإيرادات باستخدام الانحدار الخطي البسيط
export function forecastRevenue(historicalData: number[]): {
  nextPeriod: number
  trend: 'increasing' | 'decreasing' | 'stable'
  confidence: number
} {
  const n = historicalData.length
  const x = Array.from({ length: n }, (_, i) => i + 1)
  const y = historicalData
  
  // حساب معاملات الانحدار الخطي
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  // التنبؤ للفترة التالية
  const nextPeriod = slope * (n + 1) + intercept
  
  // تحديد الاتجاه
  const trend = slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable'
  
  // حساب معامل الثقة (R²)
  const yMean = sumY / n
  const totalSS = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
  const residualSS = y.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept
    return sum + Math.pow(yi - predicted, 2)
  }, 0)
  const confidence = 1 - (residualSS / totalSS)
  
  return {
    nextPeriod: Math.max(0, nextPeriod),
    trend,
    confidence: Math.min(1, Math.max(0, confidence))
  }
}

// حساب نسبة الربحية
export function calculateProfitMargin(revenue: number, expenses: number): number {
  if (revenue === 0) return 0
  return ((revenue - expenses) / revenue) * 100
}

// حساب العائد على الاستثمار (ROI)
export function calculateROI(gain: number, cost: number): number {
  if (cost === 0) return 0
  return ((gain - cost) / cost) * 100
}

// حساب نقطة التعادل
export function calculateBreakEvenPoint(
  fixedCosts: number,
  pricePerUnit: number,
  variableCostPerUnit: number
): number {
  const contributionMargin = pricePerUnit - variableCostPerUnit
  if (contributionMargin <= 0) return Infinity
  return fixedCosts / contributionMargin
}

// تحليل التدفق النقدي
export function analyzeCashFlow(
  inflows: number[],
  outflows: number[]
): {
  netCashFlow: number
  cumulativeCashFlow: number[]
  cashFlowTrend: 'positive' | 'negative' | 'neutral'
  liquidityRatio: number
} {
  const netFlows = inflows.map((inflow, i) => inflow - (outflows[i] || 0))
  const netCashFlow = netFlows.reduce((sum, flow) => sum + flow, 0)
  
  const cumulativeCashFlow: number[] = []
  let cumulative = 0
  for (const flow of netFlows) {
    cumulative += flow
    cumulativeCashFlow.push(cumulative)
  }
  
  const trend = netCashFlow > 0 ? 'positive' : netCashFlow < 0 ? 'negative' : 'neutral'
  
  const totalInflows = inflows.reduce((sum, val) => sum + val, 0)
  const totalOutflows = outflows.reduce((sum, val) => sum + val, 0)
  const liquidityRatio = totalOutflows > 0 ? totalInflows / totalOutflows : 1
  
  return {
    netCashFlow,
    cumulativeCashFlow,
    cashFlowTrend: trend,
    liquidityRatio
  }
}

// حساب مؤشرات الأداء الرئيسية (KPIs)
export function calculateKPIs(data: {
  revenue: number
  expenses: number
  employees: number
  customers: number
  products: number
}): {
  revenuePerEmployee: number
  revenuePerCustomer: number
  expenseRatio: number
  productivityIndex: number
} {
  return {
    revenuePerEmployee: data.employees > 0 ? data.revenue / data.employees : 0,
    revenuePerCustomer: data.customers > 0 ? data.revenue / data.customers : 0,
    expenseRatio: data.revenue > 0 ? (data.expenses / data.revenue) * 100 : 0,
    productivityIndex: data.employees > 0 ? (data.revenue - data.expenses) / data.employees : 0
  }
}
