import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  { value: "year1", label: "1º ano" },
  { value: "year2_4", label: "2º ao 4º ano" },
  { value: "year5_7", label: "5º ao 7º ano" },
  { value: "year8_10", label: "8º ao 10º ano" },
]

function App() {
  const [domestic, setDomestic] = useState(0)
  const [foreign, setForeign] = useState(0)
  const [irsJovem, setIrsJovem] = useState<IRSJovemOption>("none")

  const { annual } = calculateTaxes({ domestic, foreign, irsJovem })
  const data = [
    { name: "Segurança Social", value: Math.round(annual.ss) },
    { name: "IRS", value: Math.round(annual.irs) },
    { name: "IVA", value: Math.round(annual.vat) },
    { name: "Líquido", value: Math.round(annual.net) },
  ]
  const COLORS = ["#f87171", "#60a5fa", "#a78bfa", "#34d399"]

  return (
    <TooltipProvider delayDuration={100}>
      <div className="mx-auto max-w-2xl p-4 space-y-6">
        <h1 className="text-2xl font-bold text-center">Calculadora Recibos Verdes</h1>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="domestic">Rendimentos em Portugal</Label>
            <Input
              id="domestic"
              type="number"
              value={domestic}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDomestic(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="foreign">Rendimentos no estrangeiro</Label>
              <Tooltip>
                <TooltipTrigger className="cursor-help text-sm">ⓘ</TooltipTrigger>
                <TooltipContent>
                  Serviços a entidades com sede fora de Portugal não pagam IVA.
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="foreign"
              type="number"
              value={foreign}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForeign(Number(e.target.value))}
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
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <ChartTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1 text-sm">
          {data.map((item, index) => (
            <p key={item.name} className="flex items-center gap-2">
              <span
                className="w-3 h-3"
                style={{ backgroundColor: COLORS[index] }}
              />
              {item.name}: {item.value} €
            </p>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
