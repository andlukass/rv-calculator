import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { calculateTaxes } from "@/lib/calculations"
import type { IRSJovemOption } from "@/lib/calculations"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip } from "recharts"

const irsOptions = [
  { value: "none", label: "Sem IRS Jovem" },
  { value: "year1", label: "IRS Jovem - 1º ano" },
  { value: "year2", label: "IRS Jovem - 2º ano" },
  { value: "year3", label: "IRS Jovem - 3º ano" },
  { value: "year4", label: "IRS Jovem - 4º ano" },
  { value: "year5", label: "IRS Jovem - 5º ano" },
]

function App() {
  const [withVAT, setWithVAT] = useState(0)
  const [withoutVAT, setWithoutVAT] = useState(0)
  const [isMonthly, setIsMonthly] = useState(true)
  const [irsJovem, setIrsJovem] = useState<IRSJovemOption>("none")

  const { annual } = calculateTaxes({ withVAT, withoutVAT, isMonthly, irsJovem })
  const displayFactor = isMonthly ? 1 / 12 : 1
  const data = [
    { name: "Segurança Social", value: annual.ss * displayFactor },
    { name: "IRS", value: annual.irs * displayFactor },
    { name: "IVA", value: annual.vat * displayFactor },
    { name: "Líquido", value: annual.net * displayFactor },
  ]

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-2xl p-4 space-y-6">
        <h1 className="text-2xl font-bold text-center">Calculadora Recibos Verdes</h1>
        <div className="flex items-center space-x-2">
          <Switch id="period" checked={isMonthly} onCheckedChange={setIsMonthly} />
          <Label htmlFor="period">Valores mensais</Label>
        </div>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="withVAT">Rendimentos com IVA</Label>
            <Input
              id="withVAT"
              type="number"
              value={withVAT}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWithVAT(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="withoutVAT">Rendimentos isentos de IVA</Label>
              <Tooltip>
                <TooltipTrigger className="cursor-help text-sm">ⓘ</TooltipTrigger>
                <TooltipContent>
                  Serviços a empresas com sede fora de Portugal não pagam IVA.
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="withoutVAT"
              type="number"
              value={withoutVAT}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWithoutVAT(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label>IRS Jovem</Label>
            <Select value={irsJovem} onValueChange={(v: IRSJovemOption) => setIrsJovem(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {irsOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {data.map((_, index) => (
                  <Cell key={index} fill={["#f87171", "#60a5fa", "#a78bfa", "#34d399"][index]} />
                ))}
              </Pie>
              <ChartTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1 text-sm">
          <p>Segurança Social: {(annual.ss * displayFactor).toFixed(2)} €</p>
          <p>IRS: {(annual.irs * displayFactor).toFixed(2)} €</p>
          <p>IVA: {(annual.vat * displayFactor).toFixed(2)} €</p>
          <p>Líquido: {(annual.net * displayFactor).toFixed(2)} €</p>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
