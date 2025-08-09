import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { PieChart, Pie, Cell, Legend } from 'recharts'

const IAS = 522.5
const IRS_YOUNG_CAP = 55 * IAS
const EXEMPTION_RATES = {
  none: 0,
  year1: 1,
  year2_4: 0.75,
  year5_7: 0.5,
  year8_10: 0.25,
} as const

type IRSYear = keyof typeof EXEMPTION_RATES

function App() {
  const [withVat, setWithVat] = useState(0)
  const [withoutVat, setWithoutVat] = useState(0)
  const [isMonthly, setIsMonthly] = useState(false)
  const [irsYear, setIrsYear] = useState<IRSYear>('none')

  const multiplier = isMonthly ? 12 : 1
  const baseIncome = withVat + withoutVat
  const annualBase = baseIncome * multiplier
  const ivaAnnual = withVat * 0.23 * multiplier
  const ssAnnual = baseIncome * 0.7 * 0.214 * multiplier
  const exempt = Math.min(annualBase * EXEMPTION_RATES[irsYear], IRS_YOUNG_CAP)
  const taxable = Math.max(annualBase - exempt, 0)
  const irsAnnual = taxable * 0.13
  const netAnnual = annualBase - ssAnnual - irsAnnual

  const display = (v: number) => (isMonthly ? v / 12 : v)

  const data = [
    { name: 'IVA', value: display(ivaAnnual), color: '#3b82f6' },
    { name: 'Segurança Social', value: display(ssAnnual), color: '#ef4444' },
    { name: 'IRS', value: display(irsAnnual), color: '#f59e0b' },
    { name: 'Líquido', value: display(netAnnual), color: '#10b981' },
  ]

  return (
    <TooltipProvider>
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold text-center">Calculadora Recibos Verdes</h1>

        <div className="flex items-center space-x-2">
          <Switch id="period" checked={isMonthly} onCheckedChange={setIsMonthly} />
          <label htmlFor="period" className="text-sm">
            {isMonthly ? 'Valores mensais' : 'Valores anuais'}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label>Rendimentos com IVA (€)</label>
            <Input
              type="number"
              value={withVat ? withVat : ''}
              onChange={(e) => setWithVat(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label>Rendimentos isentos de IVA (€)</label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-muted-foreground">ℹ️</span>
                </TooltipTrigger>
                <TooltipContent>
                  Serviços a empresas com sede fora de Portugal não cobram IVA
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              type="number"
              value={withoutVat ? withoutVat : ''}
              onChange={(e) => setWithoutVat(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label>IRS Jovem</label>
            <Select value={irsYear} onValueChange={(v) => setIrsYear(v as IRSYear)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não se aplica</SelectItem>
                <SelectItem value="year1">1º ano (100% isento)</SelectItem>
                <SelectItem value="year2_4">2º-4º ano (75% isento)</SelectItem>
                <SelectItem value="year5_7">5º-7º ano (50% isento)</SelectItem>
                <SelectItem value="year8_10">8º-10º ano (25% isento)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-64 flex justify-center">
          <PieChart width={400} height={250}>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </div>

        <div className="space-y-1 text-sm">
          <p>IVA: {display(ivaAnnual).toFixed(2)}€</p>
          <p>Segurança Social: {display(ssAnnual).toFixed(2)}€</p>
          <p>IRS: {display(irsAnnual).toFixed(2)}€</p>
          <p className="font-semibold">Líquido: {display(netAnnual).toFixed(2)}€</p>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
