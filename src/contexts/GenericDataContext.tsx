'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { IFilterPair, IDataSourceConfig } from '@/types';

interface GenericDataContextType {
  // Filter management using field-value pairs
  filters: IFilterPair[];
  addFilter: (field: string, value: string | number | boolean) => void;
  removeFilter: (field: string, value?: string | number | boolean) => void;
  updateFilter: (field: string, value: string | number | boolean | null) => void;
  clearAllFilters: () => void;
  getFilterValue: (field: string) => any;
  hasFilter: (field: string) => boolean;
  
  // Data source configuration
  dataSourceConfig?: IDataSourceConfig;
  setDataSourceConfig: (config: IDataSourceConfig) => void;
}

const GenericDataContext = createContext<GenericDataContextType | null>(null);

interface GenericDataProviderProps {
  children: ReactNode;
  initialFilters?: IFilterPair[];
  dataSourceConfig?: IDataSourceConfig;
}

export function GenericDataProvider({ 
  children, 
  initialFilters = [],
  dataSourceConfig
}: GenericDataProviderProps) {
  const [filters, setFilters] = useState<IFilterPair[]>(initialFilters);
  const [currentDataSourceConfig, setCurrentDataSourceConfig] = useState<IDataSourceConfig | undefined>(dataSourceConfig);

  // Add or update a filter
  const addFilter = useCallback((field: string, value: string | number | boolean) => {
    if (value === null || value === undefined || value === '') {
      removeFilter(field);
      return;
    }

    setFilters(prevFilters => {
      const existingIndex = prevFilters.findIndex(f => f.field === field);
      
      if (existingIndex >= 0) {
        // Update existing filter
        const newFilters = [...prevFilters];
        newFilters[existingIndex] = { field, value };
        return newFilters;
      } else {
        // Add new filter
        return [...prevFilters, { field, value }];
      }
    });
  }, []);

  // Remove a filter
  const removeFilter = useCallback((field: string, value?: string | number | boolean) => {
    setFilters(prevFilters => {
      if (value !== undefined) {
        // Remove specific field-value pair
        return prevFilters.filter(f => !(f.field === field && f.value === value));
      } else {
        // Remove all filters for this field
        return prevFilters.filter(f => f.field !== field);
      }
    });
  }, []);

  // Update or remove a filter
  const updateFilter = useCallback((field: string, value: string | number | boolean | null) => {
    if (value === null || value === undefined || value === '') {
      removeFilter(field);
    } else {
      addFilter(field, value);
    }
  }, [addFilter, removeFilter]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters([]);
  }, []);

  // Get current value for a field
  const getFilterValue = useCallback((field: string): any => {
    const filter = filters.find(f => f.field === field);
    return filter?.value || null;
  }, [filters]);

  // Check if field has any filter
  const hasFilter = useCallback((field: string): boolean => {
    return filters.some(f => f.field === field);
  }, [filters]);

  // Update data source configuration
  const setDataSourceConfig = useCallback((config: IDataSourceConfig) => {
    setCurrentDataSourceConfig(config);
  }, []);

  const contextValue: GenericDataContextType = {
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearAllFilters,
    getFilterValue,
    hasFilter,
    dataSourceConfig: currentDataSourceConfig,
    setDataSourceConfig
  };

  return (
    <GenericDataContext.Provider value={contextValue}>
      {children}
    </GenericDataContext.Provider>
  );
}

// Hook to use the generic data context
export const useGenericDataContext = () => {
  const context = useContext(GenericDataContext);
  if (!context) {
    throw new Error('useGenericDataContext must be used within a GenericDataProvider');
  }
  return context;
};

// Hook to get current filters (shorthand)
export const useGenericFilters = () => {
  const context = useGenericDataContext();
  return {
    filters: context.filters,
    addFilter: context.addFilter,
    removeFilter: context.removeFilter,
    updateFilter: context.updateFilter,
    clearAllFilters: context.clearAllFilters,
    getFilterValue: context.getFilterValue,
    hasFilter: context.hasFilter
  };
};

// Hook to check if data fetching should be enabled
export const useCanFetchData = () => {
  const { dataSourceConfig } = useGenericDataContext();
  
  return {
    canFetchMap: !!dataSourceConfig,
    canFetchTimeSeries: !!dataSourceConfig,
    canFetchAggregation: !!dataSourceConfig,
    canFetchStats: !!dataSourceConfig,
    hasDataSource: !!dataSourceConfig
  };
};