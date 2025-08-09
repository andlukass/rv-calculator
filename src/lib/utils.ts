import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyEUR(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'pt-PT';
  const locale = lang === 'en' ? 'en-GB' : 'pt-PT';
  return amount.toLocaleString(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(2)}%`;
}
