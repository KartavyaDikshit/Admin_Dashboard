import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(new Date(date))
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/&/g, '-and-')   // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+|-+$/g, ''); // Trim - from start and end
}

export function generateSKU(title: string, id?: string): string {
  const prefix = 'TBI'
  const year = new Date().getFullYear()
  const titlePart = title
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 6)
    .toUpperCase()
  const randomPart = id ? id.substring(0, 8) : Math.floor(1000 + Math.random() * 9000).toString();
  
  return `${prefix}-${titlePart}-${year}-${randomPart}`
}

export function getMarketYears() {
  const currentYear = new Date().getFullYear();
  const forecastStartYear = currentYear;
  const forecastEndYear = currentYear + 9; // 10-year period including the start year
  return {
    currentYear,
    forecastStartYear,
    forecastEndYear,
    forecastPeriod: `${forecastStartYear}-${forecastEndYear}`
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function extractMarketStats(text: string | null | undefined) {
  if (!text) return { cagr: null, marketSize: null };

  // Strip HTML tags
  const cleanText = text.replace(/<[^>]*>?/gm, ' ');

  // Extract CAGR
  // Matches: "CAGR of 7.5%", "CAGR of 7.5 %", "7.5% CAGR", "CAGR: 7.5%", "7.5% (CAGR)", "(CAGR) of 7.5%"
  const cagrMatch = cleanText.match(/(?:CAGR of|CAGR:|CAGR|\(CAGR\) of)\s*([\d\.,]+)\s*%/i) || 
                    cleanText.match(/([\d\.,]+)\s*%\s*(?:CAGR|\(CAGR\))/i);
  const cagr = cagrMatch ? `${cagrMatch[1]}%` : null;

  // Extract Market Size
  // Matches: "valued at USD 5.80 billion", "size of USD 5.8 billion", "reach USD 10 billion", "revenue of $5B"
  // Handles "USD" or "$"
  // Handles "billion", "million", "trillion", "B", "M", "T" (case insensitive)
  const sizeMatch = cleanText.match(/(?:valued at|size of|reach|revenue of|valuation of|worth)\s*(?:USD|\$)\s*([\d\.,]+\s*(?:billion|million|trillion|B|M|T))/i);
  
  // Ensure we capitalize the unit if it's just a letter
  let formattedSize = null;
  if (sizeMatch) {
    let val = sizeMatch[1];
    // If unit is missing, it might just be a number, but our regex requires unit-like text or at least a space? 
    // The regex `[\d\.,]+\s*(?:...)` requires the unit part.
    formattedSize = `USD ${val}`;
  }

  return { cagr, marketSize: formattedSize };
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  };
}