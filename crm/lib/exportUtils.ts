/**
 * Floveera CRM Shared Export & File Utility
 * RFC-4180 compliant CSV export, safe MIME handling, and authenticated server file downloads.
 */

export interface CsvColumn<T = any> {
  header: string;
  key?: keyof T | string;
  formatter?: (row: T) => any;
}

export interface CsvExportOptions<T = any> {
  filename: string;
  title?: string;
  metadata?: Record<string, string | number>;
  columns: CsvColumn<T>[];
  data: T[];
}

/**
 * Escapes a single CSV cell according to RFC-4180
 */
export function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringVal = String(value);
  // If the cell contains commas, quotes, or newlines, surround it in quotes and double internal quotes
  if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return stringVal;
}

/**
 * Generates an RFC-4180 compliant CSV string with UTF-8 BOM so Excel opens INR and Unicode cleanly
 */
export function generateCsvString<T = any>(options: CsvExportOptions<T>): string {
  const { title, metadata, columns, data } = options;
  const lines: string[] = [];

  // UTF-8 Byte Order Mark for Microsoft Excel
  const BOM = '\uFEFF';

  // Optional Report Title Header
  if (title) {
    lines.push(escapeCsvCell(title));
  }

  // Optional Metadata Block
  if (metadata && Object.keys(metadata).length > 0) {
    Object.entries(metadata).forEach(([key, val]) => {
      lines.push(`${escapeCsvCell(key)},${escapeCsvCell(val)}`);
    });
    lines.push(''); // Empty line separator
  }

  // Column Headers
  const headerLine = columns.map(col => escapeCsvCell(col.header)).join(',');
  lines.push(headerLine);

  // Data Rows
  if (data && data.length > 0) {
    data.forEach(row => {
      const rowLine = columns.map(col => {
        let val;
        if (col.formatter) {
          val = col.formatter(row);
        } else if (col.key && typeof col.key === 'string' && col.key in (row as any)) {
          val = (row as any)[col.key];
        } else {
          val = '';
        }
        return escapeCsvCell(val);
      }).join(',');
      lines.push(rowLine);
    });
  } else {
    // Empty dataset notice row
    lines.push(escapeCsvCell('No records found for the selected criteria.'));
  }

  return BOM + lines.join('\r\n');
}

/**
 * Trigger immediate browser download of a Blob with proper object URL cleanup
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup after browser has triggered the download
  setTimeout(() => {
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(downloadUrl);
  }, 1000);
}

/**
 * Export data array directly to a downloaded CSV file
 */
export function exportToCsv<T = any>(options: CsvExportOptions<T>): void {
  const csvContent = generateCsvString(options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = options.filename.endsWith('.csv') ? options.filename : `${options.filename}.csv`;
  triggerBlobDownload(blob, filename);
}

/**
 * Download a file from backend API with authentication cookies, error handling,
 * and automatic parsing of Content-Disposition filename
 */
export async function downloadServerReportFile(
  url: string,
  fallbackFilename: string
): Promise<{ success: boolean; filename: string }> {
  const res = await fetch(url, {
    credentials: 'include'
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.message || `Server export error (${res.status} ${res.statusText})`);
  }

  const disposition = res.headers.get('content-disposition');
  let filename = fallbackFilename;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blob = await res.blob();
  triggerBlobDownload(blob, filename);
  return { success: true, filename };
}
