import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Cell,
  Tooltip as ChartTooltip,
  Pie,
  PieChart,
  ResponsiveContainer,
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { IRSJovemOption } from '@/lib/calculations';
import { calculateTaxes } from '@/lib/calculations';
import { formatCurrencyEUR } from '@/lib/utils';

const irsOptions = [
  { value: 'none', labelKey: 'irsJovem.options.none' },
  { value: 'year1', labelKey: 'irsJovem.options.year1' },
  { value: 'year2_4', labelKey: 'irsJovem.options.year2_4' },
  { value: 'year5_7', labelKey: 'irsJovem.options.year5_7' },
  { value: 'year8_10', labelKey: 'irsJovem.options.year8_10' },
];

function App() {
  // Canonical state is ANNUAL. UI can switch between monthly and annual input.
  const [inputIsMonthly, setInputIsMonthly] = useState(true);
  const [domesticAnnual, setDomesticAnnual] = useState(30000);
  const [foreignAnnual, setForeignAnnual] = useState(0);
  const [irsJovem, setIrsJovem] = useState<IRSJovemOption>('none');
  const [ssExempt, setSsExempt] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === 'en' ? 'en' : 'pt';

  const { annual, monthly } = calculateTaxes({
    domestic: domesticAnnual,
    foreign: foreignAnnual,
    irsJovem,
    ssExempt,
  });

  const data = useMemo(() => {
    const source = inputIsMonthly ? monthly : annual;
    return [
      { key: 'ss', name: t('summary.labels.ss'), value: Math.round(source.ss) },
      {
        key: 'irs',
        name: t('summary.labels.irs'),
        value: Math.round(source.irs),
      },
      {
        key: 'vat',
        name: t('summary.labels.vat'),
        value: Math.round(source.vat),
      },
      {
        key: 'net',
        name: t('summary.labels.net'),
        value: Math.round(source.net),
      },
    ];
  }, [annual, monthly, inputIsMonthly, t]);
  const COLORS = ['#f87171', '#60a5fa', '#a78bfa', '#22c55e'];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="mx-auto max-w-3xl p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold">{t('app.title')}</h1>
          <div className="flex items-center gap-1 text-sm">
            <Link
              className={currentLang === 'pt' ? 'font-semibold' : 'opacity-50'}
              to="/pt"
            >
              <span className="fi fi-pt active:scale-95"></span>
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <Link
              className={currentLang === 'en' ? 'font-semibold' : 'opacity-50'}
              to="/en"
            >
              <span className="fi fi-us active:scale-95"></span>
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          {/* Input mode switcher */}
          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${inputIsMonthly ? 'font-semibold' : 'text-slate-600'}`}
              >
                {t('inputs.monthly')}
              </span>
              <Switch
                id="inputMode"
                checked={!inputIsMonthly}
                onCheckedChange={(checked) => setInputIsMonthly(!checked)}
              />
              <span
                className={`text-sm ${!inputIsMonthly ? 'font-semibold' : 'text-slate-600'}`}
              >
                {t('inputs.annual')}
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="foreign">{t('inputs.foreignIncome')}</Label>
              <Tooltip>
                <TooltipTrigger className="text-sm">ⓘ</TooltipTrigger>
                <TooltipContent>{t('tooltips.foreignIncome')}</TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="foreign"
              type="number"
              value={inputIsMonthly ? foreignAnnual / 12 : foreignAnnual}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const entered = Number(e.target.value);
                const annualValue = inputIsMonthly ? entered * 12 : entered;
                setForeignAnnual(
                  Number.isFinite(annualValue) ? annualValue : 0
                );
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="domestic">{t('inputs.domesticIncome')}</Label>
            <Input
              id="domestic"
              type="number"
              value={inputIsMonthly ? domesticAnnual / 12 : domesticAnnual}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const entered = Number(e.target.value);
                const annualValue = inputIsMonthly ? entered * 12 : entered;
                setDomesticAnnual(
                  Number.isFinite(annualValue) ? annualValue : 0
                );
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label>{t('irsJovem.label')}</Label>
            <Select
              value={irsJovem}
              onValueChange={(v: IRSJovemOption) => setIrsJovem(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select')} />
              </SelectTrigger>
              <SelectContent>
                {irsOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Label htmlFor="ssExempt" className=" cursor-pointer">
                {t('inputs.ssExempt')}
              </Label>
              <Tooltip>
                <TooltipTrigger className="text-sm">ⓘ</TooltipTrigger>
                <TooltipContent>{t('tooltips.ssExempt')}</TooltipContent>
              </Tooltip>
            </div>
            <Switch
              id="ssExempt"
              checked={ssExempt}
              onCheckedChange={setSsExempt}
            />
          </div>
        </div>
        {/* Summary + Chart (responsive side-by-side) */}
        <div className="grid gap-4 md:gap-4 lg:gap-6 md:grid-cols-[2fr_1fr]">
          {/* Summary Card */}
          <div className="rounded-xl overflow-hidden shadow font-brand">
            <div className="bg-green-500 text-white flex items-center justify-between p-4">
              <p className="text-sm md:text-sm lg:text-lg font-semibold leading-tight">
                {t('summary.monthlyNetTitle')}
              </p>
              <p className="text-lg md:text-xl lg:text-2xl font-extrabold leading-tight">
                {formatCurrencyEUR(monthly.net)}
              </p>
            </div>
            <div className="bg-white grid sm:grid-cols-2 divide-y divide-gray-200">
              {data.map((item, index) => (
                <div
                  key={item.name}
                  className="h-24 space-y-0.5 sm:px-3 w-full flex flex-col items-center justify-center"
                >
                  <p className="text-xs md:text-base text-slate-600">
                    {item.name}:
                  </p>
                  <p
                    className="text-lg md:text-lg lg:text-xl font-bold leading-tight"
                    style={{ color: COLORS[index] }}
                  >
                    {formatCurrencyEUR(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart + Legend */}
          <div className="space-y-3">
            <div className="h-64 no-focus-outline no-tap-highlight rounded-xl shadow bg-white p-3">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={0}
                    stroke="none"
                  >
                    {data.map((item, index) => (
                      <Cell key={item.name} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;
