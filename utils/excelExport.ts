// Secure Excel Export Utility using SheetJS (xlsx)
// More secure and lightweight alternative to ExcelJS

// Note: Install with: npm install xlsx
// import * as XLSX from 'xlsx';

export interface ExportData {
  [key: string]: string | number | boolean | null | undefined;
}

// Fallback CSV export if SheetJS is not available
export const exportToCSV = (data: ExportData[], filename: string): void => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Headers row
    headers.map(header => `"${header}"`).join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle null/undefined values
        if (value === null || value === undefined) return '""';
        // Escape quotes and wrap in quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
  
  console.log(`✅ CSV exported: ${filename}.csv`);
};

// Excel export using SheetJS (when available)
export const exportToExcel = (data: ExportData[], filename: string, sheetName: string = 'Data'): void => {
  try {
    // Check if SheetJS is available
    if (typeof window !== 'undefined' && (window as any).XLSX) {
      const XLSX = (window as any).XLSX;
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      // Generate and download file
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      
      console.log(`✅ Excel exported: ${filename}.xlsx`);
    } else {
      // Fallback to CSV if SheetJS not available
      console.log('SheetJS not available, falling back to CSV export');
      exportToCSV(data, filename);
    }
  } catch (error) {
    console.error('Excel export failed, falling back to CSV:', error);
    exportToCSV(data, filename);
  }
};

// Helper function to format data for export
export const formatDataForExport = (data: any[], mapping: Record<string, string>): ExportData[] => {
  return data.map(item => {
    const formattedItem: ExportData = {};
    
    Object.entries(mapping).forEach(([key, label]) => {
      const value = item[key];
      
      // Format different data types
      if (value === null || value === undefined) {
        formattedItem[label] = '';
      } else if (typeof value === 'boolean') {
        formattedItem[label] = value ? 'Yes' : 'No';
      } else if (value instanceof Date) {
        formattedItem[label] = value.toLocaleDateString();
      } else if (typeof value === 'string' && value.includes('T')) {
        // Handle ISO date strings
        try {
          formattedItem[label] = new Date(value).toLocaleDateString();
        } catch {
          formattedItem[label] = value;
        }
      } else {
        formattedItem[label] = String(value);
      }
    });
    
    return formattedItem;
  });
};

// Dynamic import for SheetJS (loads only when needed)
export const loadSheetJS = async (): Promise<any> => {
  try {
    const XLSX = await import('xlsx');
    return XLSX;
  } catch (error) {
    console.warn('SheetJS not available, using CSV fallback');
    return null;
  }
};
