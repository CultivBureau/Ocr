/**
 * Type definitions for Transport Section
 */

export interface TransportRow {
  day: string;
  date: string;
  from: string; // Starting location
  to: string; // Destination location
  fromLink?: string; // Optional link for from location
  toLink?: string; // Optional link for to location
  description?: string; // Optional description
  carType: string;
  note?: string; // Optional note with red car icon
  [key: string]: any; // Support for additional dynamic columns
}

export interface TransportColumn {
  key: string;
  label: string; // Arabic/English label
}

export interface TransportTable {
  id: string; // Unique table ID
  title: string; // Table title
  backgroundColor: 'dark-blue' | 'dark-red' | 'pink';
  columns: TransportColumn[];
  rows: TransportRow[];
}

export interface TransportSectionProps {
  id?: string;
  title?: string; // Parent section title
  showTitle?: boolean;
  tables: TransportTable[];
  direction?: "rtl" | "ltr";
  language?: "ar" | "en";
  editable?: boolean;
  onEditRow?: (tableIndex: number, rowIndex: number) => void;
  onRemoveRow?: (tableIndex: number, rowIndex: number) => void;
  onAddRow?: (tableIndex: number) => void;
  onEditTable?: (tableIndex: number) => void;
  onDeleteTable?: (tableIndex: number) => void;
  onEditSection?: () => void;
  onDeleteSection?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

