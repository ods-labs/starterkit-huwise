'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useGenericFilters, useCanFetchData, useGenericDataContext } from '@/contexts/GenericDataContext';
import GenericDataApiService from '@/services/genericDataApi';
import type {
    IMapDataPoint,
    ITimeSeriesPoint,
    IAggregationResult,
    IFieldOption,
    IOverallStats,
    IFilterPair
} from '@/types';

// Convert generic filters to API filter pairs
const convertFiltersToApiFormat = (filters: IFilterPair[]): IFilterPair[] => {
  return filters.filter(f => f.value !== null && f.value !== undefined && f.value !== '');
};

// Create query keys for caching
const createQueryKeys = () => ({
  mapData: (filters: IFilterPair[], config: any) => ['generic-map', JSON.stringify(filters), JSON.stringify(config)] as const,
  timeSeries: (filters: IFilterPair[], config: any) => ['generic-timeseries', JSON.stringify(filters), JSON.stringify(config)] as const,
  aggregation: (filters: IFilterPair[], field: string, config: any) => ['generic-aggregation', field, JSON.stringify(filters), JSON.stringify(config)] as const,
  fieldValues: (field: string, filters: IFilterPair[], config: any) => ['generic-field-values', field, JSON.stringify(filters), JSON.stringify(config)] as const,
  stats: (filters: IFilterPair[], config: any) => ['generic-stats', JSON.stringify(filters), JSON.stringify(config)] as const,
});

// Hook for map data
export const useMapData = (options?: {
  coordinates?: string;
  labelField?: string;
  limit?: number;
}) => {
  const { filters } = useGenericFilters();
  const { canFetchMap } = useCanFetchData();
  const { dataSourceConfig } = useGenericDataContext();
  
  const queryKeys = useMemo(() => createQueryKeys(), []);
  
  const apiFilters = convertFiltersToApiFormat(filters);

  return useQuery({
    queryKey: queryKeys.mapData(apiFilters, { ...dataSourceConfig, ...options }),
    queryFn: async (): Promise<IMapDataPoint[]> => {
      if (!dataSourceConfig) throw new Error('Data source not configured');
      
      const apiService = new GenericDataApiService(dataSourceConfig);
      return await apiService.fetchMap(
        apiFilters,
        options?.coordinates || dataSourceConfig.fields?.coordinates || '',
        options?.labelField || dataSourceConfig.fields?.label || 'name',
        options?.limit || 1000
      );
    },
    enabled: canFetchMap,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Hook for time series data
export const useTimeSeriesData = (options?: {
  timeField?: string;
  valueField?: string;
  aggregation?: string;
}) => {
  const { filters } = useGenericFilters();
  const { canFetchTimeSeries } = useCanFetchData();
  const { dataSourceConfig } = useGenericDataContext();
  
  const queryKeys = useMemo(() => createQueryKeys(), []);
  
  const apiFilters = convertFiltersToApiFormat(filters);

  return useQuery({
    queryKey: queryKeys.timeSeries(apiFilters, { ...dataSourceConfig, ...options }),
    queryFn: async (): Promise<ITimeSeriesPoint[]> => {
      if (!dataSourceConfig) throw new Error('Data source not configured');
      
      const apiService = new GenericDataApiService(dataSourceConfig);
      return await apiService.fetchTimeSeries(
        apiFilters,
        options?.timeField || dataSourceConfig.fields?.timestamp || 'date',
        options?.valueField || 'value',
        options?.aggregation || 'count'
      );
    },
    enabled: canFetchTimeSeries,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};

// Hook for aggregation data
export const useAggregationData = (
  groupByField: string,
  options?: {
    valueField?: string;
    aggregation?: string;
  }
) => {
  const { filters } = useGenericFilters();
  const { canFetchAggregation } = useCanFetchData();
  const { dataSourceConfig } = useGenericDataContext();
  
  const queryKeys = useMemo(() => createQueryKeys(), []);
  
  const apiFilters = convertFiltersToApiFormat(filters);

  return useQuery({
    queryKey: queryKeys.aggregation(apiFilters, groupByField, { ...dataSourceConfig, ...options }),
    queryFn: async (): Promise<IAggregationResult[]> => {
      if (!dataSourceConfig) throw new Error('Data source not configured');
      
      const apiService = new GenericDataApiService(dataSourceConfig);
      return await apiService.fetchAggregation(
        apiFilters,
        groupByField,
        options?.valueField,
        options?.aggregation || 'count'
      );
    },
    enabled: canFetchAggregation && !!groupByField,
    staleTime: 20 * 60 * 1000, // 20 minutes
    retry: 2,
  });
};

// Hook for field values (used by filters)
export const useFieldValues = (
  fieldName: string,
  options?: {
    limit?: number;
    excludeCurrentFilters?: boolean;
  }
) => {
  const { filters } = useGenericFilters();
  const { dataSourceConfig } = useGenericDataContext();
  
  const queryKeys = useMemo(() => createQueryKeys(), []);
  
  // Optionally exclude filters for the current field to get all possible values
  const apiFilters = options?.excludeCurrentFilters
    ? filters.filter(f => f.field !== fieldName)
    : filters;
  
  const filteredApiFilters = convertFiltersToApiFormat(apiFilters);

  return useQuery({
    queryKey: queryKeys.fieldValues(fieldName, filteredApiFilters, { ...dataSourceConfig, ...options }),
    queryFn: async (): Promise<IFieldOption[]> => {
      if (!dataSourceConfig || !fieldName) return [];
      
      const apiService = new GenericDataApiService(dataSourceConfig);
      return await apiService.fetchFieldValues(
        fieldName,
        filteredApiFilters,
        options?.limit || 100
      );
    },
    enabled: !!dataSourceConfig && !!fieldName,
    staleTime: 60 * 60 * 1000, // 1 hour (field values change rarely)
    retry: 1,
  });
};

// Hook for overall statistics
export const useOverallStats = () => {
  const { filters } = useGenericFilters();
  const { canFetchStats } = useCanFetchData();
  const { dataSourceConfig } = useGenericDataContext();
  
  const queryKeys = useMemo(() => createQueryKeys(), []);
  
  const apiFilters = convertFiltersToApiFormat(filters);

  return useQuery({
    queryKey: queryKeys.stats(apiFilters, dataSourceConfig),
    queryFn: async (): Promise<IOverallStats> => {
      if (!dataSourceConfig) throw new Error('Data source not configured');
      
      const apiService = new GenericDataApiService(dataSourceConfig);
      return await apiService.fetchStats(apiFilters);
    },
    enabled: canFetchStats,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};
