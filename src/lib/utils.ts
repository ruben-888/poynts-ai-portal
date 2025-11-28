import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with commas as thousands separators and fixed decimal places
 * @param value - The number to format
 * @param decimalPlaces - Number of decimal places to show (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimalPlaces: number = 2): string {
  // Handle null, undefined, or NaN
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  // Format the number with commas and fixed decimal places
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Format a number as currency (USD)
 * @param value - The number to format as currency
 * @param currencyCode - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currencyCode: string = "USD",
): string {
  // Handle null, undefined, or NaN
  if (value === null || value === undefined || isNaN(value)) {
    return "$0.00";
  }

  // Format the number as currency
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(value);
}

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string to format
 * @param options - Intl.DateTimeFormatOptions (optional)
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString || "N/A";
  }
}

/**
 * Generate a CSV file from data and download it
 * @param data - Array of objects to convert to CSV
 * @param columns - Column definitions to use for headers and data extraction
 * @param filename - Name of the CSV file to download (without extension)
 */
export function downloadTableAsCSV<TData>(
  data: TData[],
  columns: any[], // Using any[] because column structure varies
  filename: string = "export",
): void {
  // Skip if no data or columns
  if (!data.length || !columns.length) {
    console.warn("No data or columns provided for CSV export");
    return;
  }

  try {
    // Extract the headers and accessors/functions
    const headers: string[] = [];
    const valueGetters: Array<{ type: 'accessor' | 'function', value: string | ((row: any) => any) }> = [];

    columns.forEach((column) => {
      // Only skip columns that are explicitly marked to not be included in CSV
      if (
        column.header &&
        (column.accessorKey || column.accessorFn) &&
        column.enableCSVExport !== false
      ) {
        // Use the header renderer if it's a function, otherwise use the provided string
        let headerText = column.header;
        if (typeof column.header === "function") {
          // Try to extract title from DataTableColumnHeader component
          headerText =
            column.columnDef?.meta?.title || column.id || column.accessorKey;
        }

        headers.push(headerText);
        
        if (column.accessorFn) {
          valueGetters.push({ type: 'function', value: column.accessorFn });
        } else {
          valueGetters.push({ type: 'accessor', value: column.accessorKey });
        }
      }
    });

    // Create CSV content with headers
    let csvContent = headers.join(",") + "\n";

    // Add data rows
    data.forEach((row) => {
      const values = valueGetters.map((getter) => {
        let value;
        
        if (getter.type === 'function' && typeof getter.value === 'function') {
          // Call the accessor function with the row
          value = getter.value(row);
        } else if (getter.type === 'accessor' && typeof getter.value === 'string') {
          // Get the raw value from the row using reduce with type safety
          value = getter.value
            .split(".")
            .reduce(
              (obj: any, key: string) =>
                obj && typeof obj === "object" ? obj[key] : undefined,
              row as any,
            );
        }

        // Handle different data types
        if (value === null || value === undefined) {
          return "";
        } else if (typeof value === "string") {
          // Escape quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`;
        } else if (typeof value === "object") {
          // Convert objects to JSON strings
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return String(value);
        }
      });

      csvContent += values.join(",") + "\n";
    });

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Set link properties
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";

    // Add to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the URL object
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating CSV:", error);
  }
}
