export type IRSJovemOption = 'none' | 'year1' | 'year2' | 'year3' | 'year4' | 'year5'

const VAT_RATE = 0.23
const SOCIAL_SECURITY_RATE = 0.214
const SOCIAL_SECURITY_BASE = 0.7
const IRS_COEFFICIENT = 0.75
const IAS = 509.27
const IRS_JOVEM_LIMIT = 55 * IAS
const IRS_JOVEM_EXEMPTIONS: Record<IRSJovemOption, number> = {
  none: 0,
  year1: 0.5,
  year2: 0.4,
  year3: 0.3,
  year4: 0.2,
  year5: 0.1,
}

const IRS_BRACKETS = [
  { upto: 7703, rate: 0.1325 },
  { upto: 11623, rate: 0.18 },
  { upto: 16472, rate: 0.23 },
  { upto: 21321, rate: 0.26 },
  { upto: 27146, rate: 0.3 },
  { upto: 39791, rate: 0.35 },
  { upto: 64179, rate: 0.37 },
  { upto: 90000, rate: 0.45 },
  { upto: Infinity, rate: 0.48 },
]

function calculateIRSPayable(taxable: number) {
  let remaining = taxable
  let lastLimit = 0
  let total = 0
  for (const bracket of IRS_BRACKETS) {
    const segment = Math.min(remaining, bracket.upto - lastLimit)
    if (segment <= 0) break
    total += segment * bracket.rate
    remaining -= segment
    lastLimit = bracket.upto
  }
  return total
}

export function calculateTaxes({
  withVAT,
  withoutVAT,
  isMonthly,
  irsJovem,
}: {
  withVAT: number
  withoutVAT: number
  isMonthly: boolean
  irsJovem: IRSJovemOption
}) {
  const factor = isMonthly ? 12 : 1
  const grossWithVAT = withVAT * factor
  const grossWithoutVAT = withoutVAT * factor
  const vatBase = grossWithVAT / (1 + VAT_RATE)
  const vatToPay = grossWithVAT - vatBase
  const totalRevenue = vatBase + grossWithoutVAT
  const ss = totalRevenue * SOCIAL_SECURITY_BASE * SOCIAL_SECURITY_RATE
  const irsBase = totalRevenue * IRS_COEFFICIENT
  const exemption = Math.min(irsBase * IRS_JOVEM_EXEMPTIONS[irsJovem], IRS_JOVEM_LIMIT)
  const irsTaxable = Math.max(irsBase - exemption, 0)
  const irs = calculateIRSPayable(irsTaxable)
  const net = totalRevenue - ss - irs
  return { annual: { ss, irs, vat: vatToPay, net } }
}
