/**
 * Generic types for data visualization boilerplate
 * These types are data-agnostic and can work with any dataset
 */

// Generic filter system using field-value pairs
export interface IFilterPair {
  field: string;
  value: string | number | boolean | null;
}


// Generic data point for map visualization
export interface IMapDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  [key: string]: any; // Allow any additional fields
}

// Generic time series data point
export interface ITimeSeriesPoint {
  timestamp: string | number;
  value: number;
  label?: string;
  [key: string]: any;
}

// Generic aggregation result
export interface IAggregationResult {
  field: string;
  value: any;
  count: number;
  percentage?: number;
}

// Generic field option for filters
export interface IFieldOption {
  value: string;
  label: string;
  count?: number;
}

// Generic stats interface
export interface IOverallStats {
  [key: string]: any; // Allow dynamic stats fields
}

// Configuration for data source
export interface IDataSourceConfig {
  baseUrl: string;
  datasetId: string;
  apiKey?: string;
  fields: {
    coordinates?: string;
    timestamp?: string;
    label?: string;
  };
}

// Visualization types
export type TVisualizationType = 'map' | 'timeSeries' | 'stats' | 'aggregation';


// Generic component props
export interface IGenericFilterProps {
  field: string;
  label: string;
  type: 'select' | 'multiselect' | 'checkbox';
  placeholder?: string;
  onFilterChange: (field: string, value: any) => void;
  currentValue?: any;
}

export interface IGenericMapProps {
  data: IMapDataPoint[];
  isLoading?: boolean;
  onPointClick?: (point: IMapDataPoint) => void;
}

export interface IGenericTimeSeriesProps {
  data: ITimeSeriesPoint[];
  isLoading?: boolean;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface IGenericStatsProps {
  data: IOverallStats;
  isLoading?: boolean;
  title?: string;
}
