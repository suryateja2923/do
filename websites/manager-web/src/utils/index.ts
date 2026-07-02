/**
 * Date Formatter Utility
 */
export const formatDate = (dateStr: string | Date, includeTime: boolean = false): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  
  if (includeTime) {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Currency Formatter Utility
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Trigger browser download for raw files
 */
export const downloadFile = (url: string, filename: string): void => {
  if (typeof window === 'undefined') return;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export arbitrary dataset to CSV and trigger browser download
 */
export const exportCSV = (data: Record<string, any>[], filename: string): void => {
  if (typeof window === 'undefined' || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header];
        const stringified = val === null || val === undefined ? '' : String(val);
        // Escape quotes
        return `"${stringified.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  downloadFile(url, `${filename}.csv`);
};

/**
 * Truncate character lengths in string fields
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Debounce wrapper for event delays
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Copies a string to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export default {
  formatDate,
  formatCurrency,
  downloadFile,
  exportCSV,
  truncateText,
  debounce,
  copyToClipboard,
};
