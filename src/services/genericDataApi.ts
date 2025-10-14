/**
 * Generic Data API Service using Huwise SDK
 *
 * This service provides generic data fetching capabilities that work with any dataset.
 * It uses the Huwise API client SDK for efficient and typed API calls.
 */

import {ApiClient, fromCatalog} from '@opendatasoft/api-client';
import {
    IAggregationResult,
    IDataSourceConfig,
    IOverallStats,
    IFieldOption,
    IFilterPair,
    IMapDataPoint,
    ITimeSeriesPoint
} from "@/types";

class GenericDataApiService {
    private client: ApiClient;
    private config: IDataSourceConfig;

    constructor(config: IDataSourceConfig) {
        this.config = config;
        this.client = new ApiClient({
            domain: config.baseUrl,
            apiKey: config.apiKey,
        });
    }

    /**
     * Applies refine filters for field-value pairs
     */
    private applyRefineFilters(query: any, filters: IFilterPair[]): any {
        let modifiedQuery = query;
        filters.forEach(filter => {
            if (filter.value !== null && filter.value !== undefined && filter.value !== '') {
                modifiedQuery = modifiedQuery.refine(`${filter.field}:${filter.value}`);
            }
        });
        return modifiedQuery;
    }

    /**
     * Generic fetch for map data
     * Returns data points with lat/lng for map display
     * Handles both separate lat/lng fields and combined coordinates field
     */
    async fetchMap(
        filters: IFilterPair[] = [],
        coordinatesField = 'coordinates',
        labelField = 'name',
        limit = 1000
    ): Promise<IMapDataPoint[]> {
        try {
            let query = fromCatalog()
                .dataset(this.config.datasetId)
                .export('json')
                .select(`${coordinatesField}, ${labelField}`)
                .limit(limit);

            // Apply refine filters
            query = this.applyRefineFilters(query, filters);

            const response: any = await this.client.get(query.toString());

            if (!response || !Array.isArray(response)) {
                return [];
            }

            return response.map((record: any) => {
                let latitude = 0;
                let longitude = 0;

                // Handle coordinates field (can be array [lat, lng] or object {lat, lng} or string "lat,lng")
                const coordinates = record[coordinatesField];

                if (coordinates) {
                    if (Array.isArray(coordinates) && coordinates.length >= 2) {
                        // Format: [lat, lng] ou [lng, lat] - assumons [lat, lng]
                        latitude = parseFloat(coordinates[0]) || 0;
                        longitude = parseFloat(coordinates[1]) || 0;
                    } else if (typeof coordinates === 'object' && coordinates.lat && coordinates.lon) {
                        // Format: {lat: x, lon: y} - format spécifique du dataset
                        latitude = parseFloat(coordinates.lat) || 0;
                        longitude = parseFloat(coordinates.lon) || 0;
                    } else if (typeof coordinates === 'object' && coordinates.lat && coordinates.lng) {
                        // Format: {lat: x, lng: y}
                        latitude = parseFloat(coordinates.lat) || 0;
                        longitude = parseFloat(coordinates.lng) || 0;
                    } else if (typeof coordinates === 'object' && coordinates.latitude && coordinates.longitude) {
                        // Format: {latitude: x, longitude: y}
                        latitude = parseFloat(coordinates.latitude) || 0;
                        longitude = parseFloat(coordinates.longitude) || 0;
                    } else if (typeof coordinates === 'string') {
                        // Format: "lat,lng"
                        const parts = coordinates.split(',');
                        if (parts.length >= 2) {
                            latitude = parseFloat(parts[0].trim()) || 0;
                            longitude = parseFloat(parts[1].trim()) || 0;
                        }
                    }
                }

                // Vérifier si les coordonnées sont dans l'ordre inverse (lng, lat au lieu de lat, lng)
                // Si latitude > 90 ou < -90, probablement lng, lat
                if (Math.abs(latitude) > 90 && Math.abs(longitude) <= 90) {
                    [latitude, longitude] = [longitude, latitude];
                }

                return {
                    id: record.record_id || Math.random().toString(36),
                    latitude,
                    longitude,
                    label: record[labelField] || 'Unknown',
                    ...record
                };
            }).filter(point =>
                !isNaN(point.latitude) && !isNaN(point.longitude) &&
                Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180 &&
                point.latitude !== 0 && point.longitude !== 0 // Exclure les coordonnées (0,0) qui sont souvent invalides
            );
        } catch (error) {
            console.error('Error fetching map data:', error);
            throw new Error('Failed to fetch map data');
        }
    }

    /**
     * Generic fetch for time series data
     * Groups data by time field and aggregates by a value field
     */
    async fetchTimeSeries(
        filters: IFilterPair[] = [],
        timeField = 'date',
        valueField = 'value',
        aggregation = 'count'
    ): Promise<ITimeSeriesPoint[]> {
        try {
            let selectClause: string;
            if (aggregation === 'count') {
                selectClause = `${timeField}, count(*) as value`;
            } else {
                selectClause = `${timeField}, ${aggregation}(${valueField}) as value`;
            }

            let query = fromCatalog()
                .dataset(this.config.datasetId)
                .export('json')
                .select(selectClause)
                .groupBy(`date_format(${timeField}, "YYYY") as date`)
                .orderBy(`${timeField} ASC`);

            // Apply refine filters
            query = this.applyRefineFilters(query, filters);

            const response: any = await this.client.get(query.toString());

            if (!response || !Array.isArray(response)) {
                return [];
            }

            return response.map((record: any) => ({
                timestamp: record[timeField] || '',
                value: parseFloat(record.value) || 0,
                label: record[timeField] || ''
            })).filter(point => point.timestamp);
        } catch (error) {
            console.error('Error fetching time series data:', error);
            throw new Error('Failed to fetch time series data');
        }
    }

    /**
     * Generic fetch for aggregated data
     * Groups by specified field and returns counts/aggregations
     */
    async fetchAggregation(
        filters: IFilterPair[] = [],
        groupByField: string,
        valueField?: string,
        aggregation = 'count'
    ): Promise<IAggregationResult[]> {
        try {
            let selectClause: string;
            if (aggregation === 'count') {
                selectClause = `${groupByField}, count(*) as count`;
            } else if (valueField) {
                selectClause = `${groupByField}, ${aggregation}(${valueField}) as aggregated_value, count(*) as count`;
            } else {
                selectClause = `${groupByField}, count(*) as count`;
            }

            let query = fromCatalog()
                .dataset(this.config.datasetId)
                .export('json')
                .select(selectClause)
                .groupBy(groupByField)
                .orderBy('count DESC');

            // Apply refine filters
            query = this.applyRefineFilters(query, filters);

            const response: any = await this.client.get(query.toString());

            if (!response || !Array.isArray(response)) {
                return [];
            }

            return response.map((record: any) => ({
                field: groupByField,
                value: record[groupByField],
                count: parseInt(record.count) || 0,
                aggregatedValue: record.aggregated_value ? parseFloat(record.aggregated_value) : undefined
            })).filter(result => result.value !== null && result.value !== undefined);
        } catch (error) {
            console.error('Error fetching aggregation data:', error);
            throw new Error('Failed to fetch aggregation data');
        }
    }

    /**
     * Generic fetch for field values
     * Returns unique values for a given field - used for populating filters
     */
    async fetchFieldValues(
        fieldName: string,
        filters: IFilterPair[] = [],
        limit = 100
    ): Promise<IFieldOption[]> {
        try {
            let query = fromCatalog()
                .dataset(this.config.datasetId)
                .export('json')
                .select(`${fieldName}, count(*) as count`)
                .groupBy(fieldName)
                .orderBy('count DESC')
                .limit(limit);

            // Apply refine filters
            query = this.applyRefineFilters(query, filters);

            const response: any = await this.client.get(query.toString());

            if (!response || !Array.isArray(response)) {
                return [];
            }

            return response.map((record: any) => {
                const value = record[fieldName];
                const stringValue = value?.toString() || '';

                return {
                    value: stringValue,
                    label: stringValue || 'Unknown',
                    count: parseInt(record.count) || 0
                };
            }).filter(item => item.value.trim() !== '');
        } catch (error) {
            console.error('Error fetching field values:', error);
            throw new Error(`Failed to fetch values for field: ${fieldName}`);
        }
    }

    /**
     * Generic fetch for overall statistics
     * Returns basic stats about the dataset with applied filters
     */
    async fetchStats(filters: IFilterPair[] = []): Promise<IOverallStats> {
        try {
            let query = fromCatalog()
                .dataset(this.config.datasetId)
                .export('json')
                .select('count(*) as total_records, sum(volcano_deaths) as volcano_deaths, avg(elevation) as avg_elevation')
                .limit(1);

            // Apply refine filters
            query = this.applyRefineFilters(query, filters);

            const response: any = await this.client.get(query.toString());

            if (!response || !Array.isArray(response) || response.length === 0) {
                return {
                    total_records: 0,
                    volcano_deaths: 0,
                    avg_elevation: 0
                } as IOverallStats;
            }

            return {...response[0]};
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw new Error('Failed to fetch statistics');
        }
    }
}

export default GenericDataApiService;