// Secure CSV Export Utility - No external dependencies
// Replaces ExcelJS to avoid vulnerabilities

export interface ExportData {
  [key: string]: string | number | boolean | null | undefined;
}

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

// Helper function to format data for CSV export
export const formatDataForCSV = (data: any[], mapping: Record<string, string>): ExportData[] => {
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
