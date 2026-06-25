import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Parses an Indonesian date string (e.g. '11 Agustus,2025') into a standard ISO date string ('2025-08-11')
 */
export function parseIndonesianDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  
  const months: Record<string, string> = {
    'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
    'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
    'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
  };

  // Match "11 Agustus,2025" or "11 Agustus 2025"
  const match = dateStr.match(/(\d+)\s+([A-Za-z]+),?\s*(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthStr = match[2].toLowerCase();
    const year = match[3];
    
    const month = months[monthStr] || '01';
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
}

/**
 * Parses a string field that might be a JSON array or comma-separated values
 * common in the scraped database.
 */
export function parseArrayField(data: any): string[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  
  const strData = String(data).trim();
  if (!strData) return [];

  try {
    // Check if it looks like a JSON array ["Item", "Item"]
    if (strData.startsWith('[') && strData.endsWith(']')) {
      const parsed = JSON.parse(strData);
      return Array.isArray(parsed) ? parsed : [strData];
    }
    
    // Check if it's comma separated
    if (strData.includes(',')) {
      return strData.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    return [strData];
  } catch (e) {
    // If JSON parse fails, return as single item array or split by comma if exists
    if (strData.includes(',')) {
      return strData.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [strData];
  }
}

/**
 * Formats next airing information into a human-readable string.
 */
export function formatNextAiring(nextEpisode: number, nextAiringAt: number, detailed = false): string | null {
  const now = Math.floor(Date.now() / 1000);
  const diff = nextAiringAt - now;
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  
  if (days > 14) return detailed ? `Ep ${nextEpisode} upcoming` : `Ep ${nextEpisode}`;
  if (days > 0) {
    return detailed 
      ? `Ep ${nextEpisode} in ${days}d ${hours}h` 
      : `Ep ${nextEpisode} in ${days}d`;
  }
  if (hours > 0) return `Ep ${nextEpisode} in ${hours}h`;
  return `Ep ${nextEpisode} soon`;
}
