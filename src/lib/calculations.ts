export type IRSJovemOption =
  | 'none'
  | 'year1'
  | 'year2_4'
  | 'year5_7'
  | 'year8_10';

const VAT_RATE = 0.23;
const VAT_EXEMPT_THRESHOLD = 15000;
const SOCIAL_SECURITY_RATE = 0.214;
const SOCIAL_SECURITY_BASE = 0.7;
const IRS_COEFFICIENT = 0.75;
const IAS = 509.27;
const IRS_JOVEM_LIMIT = 55 * IAS;
const IRS_JOVEM_EXEMPTIONS: Record<IRSJovemOption, number> = {
  none: 0,
  year1: 1,
  year2_4: 0.75,
  year5_7: 0.5,
  year8_10: 0.25,
};

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
];

function calculateIRSPayable(taxable: number) {
  let remaining = taxable;
  let lastLimit = 0;
  let total = 0;
  for (const bracket of IRS_BRACKETS) {
    const segment = Math.min(remaining, bracket.upto - lastLimit);
    if (segment <= 0) break;
    total += segment * bracket.rate;
    remaining -= segment;
    lastLimit = bracket.upto;
  }
  return total;
}

export function calculateTaxes({
  domestic,
  foreign,
  irsJovem,
  ssExempt = false,
}: {
  domestic: number;
  foreign: number;
  irsJovem: IRSJovemOption;
  ssExempt?: boolean;
}) {
  const totalRevenue = domestic + foreign;
  const vatToPay = domestic < VAT_EXEMPT_THRESHOLD ? 0 : domestic * VAT_RATE;
  const calculatedSS = totalRevenue * SOCIAL_SECURITY_BASE * SOCIAL_SECURITY_RATE;
  const ss = ssExempt ? 0 : calculatedSS;
  const irsBase = totalRevenue * IRS_COEFFICIENT;
  const exemption = Math.min(
    irsBase * IRS_JOVEM_EXEMPTIONS[irsJovem],
    IRS_JOVEM_LIMIT
  );
  const irsTaxable = Math.max(irsBase - exemption, 0);
  const irs = calculateIRSPayable(irsTaxable);
  const net = totalRevenue - ss - irs;
  const annual = {
    ss,
    irs,
    vat: vatToPay,
    net,
    gross: totalRevenue,
    irsBase,
    exemption,
  };
  const monthly = {
    ss: ss / 12,
    irs: irs / 12,
    vat: vatToPay / 12,
    net: net / 12,
    gross: totalRevenue / 12,
  };
  const effectiveIrsRate = irsBase > 0 ? irs / irsBase : 0;
  return { annual, monthly, effectiveIrsRate };
}
