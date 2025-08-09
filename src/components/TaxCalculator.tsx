import { useState } from 'react'
import { Info } from 'lucide-react'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const VAT_RATE = 0.23 // IVA 23% (Portugal continental)
const SS_RATE = 0.214 // Social Security contribution rate
const SS_BASE_RATE = 0.7 // 70% of income is considered for contributions
const IRS_BASE_RATE = 0.75 // Simplified regime taxation coefficient
const IAS = 509.26

// IRS Jovem exemptions for 2024 (percent exempt and IAS limits)
// Source: https://www.e-konomista.pt/irs-jovem/
const IRS_JOVEM_RULES = {
  none: { rate: 0, limit: 0 },
  year1: { rate: 1, limit: 40 },
  year2: { rate: 0.75, limit: 30 },
  year3: { rate: 0.5, limit: 20 },
  year4: { rate: 0.5, limit: 20 },
  year5: { rate: 0.25, limit: 10 },
} as const

type IRSJovemStage = keyof typeof IRS_JOVEM_RULES

const IRS_BRACKETS = [
  { limit: 7703, rate: 0.1325 },
  { limit: 11623, rate: 0.18 },
  { limit: 16432, rate: 0.23 },
  { limit: 21041, rate: 0.265 },
  { limit: 27135, rate: 0.285 },
  { limit: 39251, rate: 0.35 },
  { limit: 51997, rate: 0.37 },
  { limit: 81479, rate: 0.435 },
  { limit: Infinity, rate: 0.45 },
]

function calculateIRS(amount: number) {
  let tax = 0
  let prev = 0
  for (const bracket of IRS_BRACKETS) {
    const taxable = Math.min(amount, bracket.limit) - prev
    if (taxable > 0) {
      tax += taxable * bracket.rate
      prev = bracket.limit
    } else {
      break
    }
  }
  return tax
}

const COLORS = ['#2563eb', '#e11d48', '#f97316', '#16a34a']

export default function TaxCalculator() {
  const [withVat, setWithVat] = useState('')
  const [withoutVat, setWithoutVat] = useState('')
  const [isMonthly, setIsMonthly] = useState(true)
  const [ssExempt, setSsExempt] = useState(false)
  const [irsStage, setIrsStage] = useState<IRSJovemStage>('none')

  const multiplier = isMonthly ? 12 : 1
  const withVatNumber = parseFloat(withVat) || 0
  const withoutVatNumber = parseFloat(withoutVat) || 0

  const annualWithVat = withVatNumber * multiplier
  const annualWithoutVat = withoutVatNumber * multiplier

  const annualVat = annualWithVat * VAT_RATE / (1 + VAT_RATE)
  const annualRevenue = annualWithVat - annualVat + annualWithoutVat

  const ss = ssExempt ? 0 : annualRevenue * SS_BASE_RATE * SS_RATE

  const collectable = annualRevenue * IRS_BASE_RATE
  const rule = IRS_JOVEM_RULES[irsStage]
  const exemption = Math.min(collectable * rule.rate, rule.limit * IAS)
  const taxableIRS = collectable - exemption
  const irs = calculateIRS(taxableIRS)

  const net = annualRevenue - ss - irs
  const totalState = ss + irs + annualVat

  const displayDiv = isMonthly ? 12 : 1

  const chartData = [
    { name: 'Segurança Social', value: ss / displayDiv },
    { name: 'IRS', value: irs / displayDiv },
    { name: 'IVA', value: annualVat / displayDiv },
    { name: 'Líquido', value: net / displayDiv },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="period">Valores mensais?</Label>
          <Switch id="period" checked={isMonthly} onCheckedChange={setIsMonthly} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="ss">Isento de Segurança Social?</Label>
          <Switch id="ss" checked={ssExempt} onCheckedChange={setSsExempt} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="withVat">Rendimentos com IVA</Label>
            <Input id="withVat" type="number" value={withVat} onChange={(e) => setWithVat(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="withoutVat">Rendimentos sem IVA</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Rendimentos para empresas com sede fora de Portugal não pagam IVA
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input id="withoutVat" type="number" value={withoutVat} onChange={(e) => setWithoutVat(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>IRS Jovem</Label>
          <Select value={irsStage} onValueChange={(v: IRSJovemStage) => setIrsStage(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Sem IRS Jovem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem IRS Jovem</SelectItem>
              <SelectItem value="year1">Ano 1</SelectItem>
              <SelectItem value="year2">Ano 2</SelectItem>
              <SelectItem value="year3">Ano 3</SelectItem>
              <SelectItem value="year4">Ano 4</SelectItem>
              <SelectItem value="year5">Ano 5</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} label>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1 text-sm">
        <p>Segurança Social: {(ss / displayDiv).toFixed(2)} €</p>
        <p>IRS: {(irs / displayDiv).toFixed(2)} €</p>
        <p>IVA: {(annualVat / displayDiv).toFixed(2)} €</p>
        <p>Líquido: {(net / displayDiv).toFixed(2)} €</p>
        <p>Total entregue ao Estado: {(totalState / displayDiv).toFixed(2)} €</p>
      </div>
    </div>
  )
}
