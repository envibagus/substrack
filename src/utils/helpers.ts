/**
 * Utility functions for SubTrack
 */

// Simple exchange rates (base: USD)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  IDR: 15600, // 1 USD = 15,600 IDR (approximate)
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  SGD: 1.34,
  AUD: 1.53,
  CAD: 1.36,
};

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;

  // Convert to USD first, then to target currency
  const inUSD = amount / fromRate;
  return inUSD * toRate;
}

/**
 * Format currency with proper symbols and decimals
 */
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  // Currency-specific formatting options
  const currencyOptions: Record<string, { minimumFractionDigits: number; maximumFractionDigits: number }> = {
    IDR: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
    JPY: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
    USD: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    EUR: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    GBP: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    SGD: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    AUD: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    CAD: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  };

  const options = currencyOptions[currency] || { minimumFractionDigits: 2, maximumFractionDigits: 2 };

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits,
  }).format(amount);
}

/**
 * Format date to readable string (e.g., "Jan 15, 2024")
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format date to relative string (e.g., "in 3 days", "today", "tomorrow")
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= 7) return `in ${diffDays} days`;
  return formatDate(dateStr);
}

/**
 * Get days until due date
 */
export function getDaysUntilDue(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate monthly equivalent cost from any billing cycle
 */
export function getMonthlyCost(cost: number, billingCycle: string): number {
  switch (billingCycle) {
    case 'weekly':
      return (cost * 52) / 12;
    case 'monthly':
      return cost;
    case 'quarterly':
      return (cost * 4) / 12;
    case 'yearly':
      return cost / 12;
    default:
      return cost;
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function for search/filter inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Merge Tailwind classes
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
