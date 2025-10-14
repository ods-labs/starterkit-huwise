'use client';

import {useState, useEffect} from 'react';
import {GenericDataProvider} from '@/contexts/GenericDataContext';
import {useMapData, useTimeSeriesData, useOverallStats} from '@/hooks/useGenericData';
import {trackPageView} from '@/utils/analytics';
import {withAssetPrefix} from "@/utils/pathUtils";
import GenericMap from '@/components/maps/GenericMap';
import {GenericFilterPanel} from '@/components/filters/GenericFilter';
import GenericStats from '@/components/stats/GenericStats';
import GenericTimeSeries from '@/components/charts/GenericTimeSeries';
import type {IDataSourceConfig, TVisualizationType} from '@/types';

// Data source configuration for this example (volcanic eruptions)
const DATA_SOURCE_CONFIG: IDataSourceConfig = {
    baseUrl: 'https://userclub.opendatasoft.com',
    datasetId: 'les-eruptions-volcaniques-dans-le-monde',
    fields: {
        coordinates: 'coordinates',
        timestamp: 'year',
        label: 'volcano_name'
    }
};

// Filter configuration for this example
const FILTER_CONFIG = [
    {
        field: 'country',
        label: '🌍 Country',
        type: 'select' as const,
        placeholder: 'All countries'
    },
    {
        field: 'volcano_type',
        label: '🏔️ Volcano Type',
        type: 'select' as const,
        placeholder: 'All types'
    },
    {
        field: 'status',
        label: '💥 Status',
        type: 'select' as const,
        placeholder: 'All status'
    },
    {
        field: 'flag_tsunami',
        label: '🌊 With Tsunami',
        type: 'checkbox' as const
    }
];

// Time Series Component
const TimeSeriesVisualization = () => {
    const {data: timeSeriesData, isLoading} = useTimeSeriesData({
        timeField: 'date',
        aggregation: 'count'
    });

    return (
        <GenericTimeSeries
            data={timeSeriesData || []}
            isLoading={isLoading}
            title="📈 Temporal Evolution"
            xAxisLabel="Year"
            yAxisLabel="Eruptions per Year"
        />
    );
};

// Stats Component
const StatsVisualization = () => {
    const {data: stats, isLoading} = useOverallStats();

    return (
        <GenericStats
            data={stats || {}}
            isLoading={isLoading}
            title="📊 Volcanic Eruptions Statistics"
        />
    );
};

// Map Component
const MapVisualization = () => {
    const {data: mapData, isLoading} = useMapData({
        coordinates: 'coordinates',
        labelField: 'volcano_name',
        limit: 1000
    });

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h2 className="text-xl font-bold">🗺️ Interactive Map of Volcanic Eruptions</h2>
                <p className="text-gray-600">
                    Explore volcanic eruptions worldwide. Click on markers for more details.
                </p>
            </div>
            <GenericMap
                data={mapData || []}
                isLoading={isLoading}
                onPointClick={(point) => console.log('Volcano clicked:', point)}
            />
            {mapData && mapData.length > 0 && (
                <div className="text-center text-sm text-gray-500">
                    💡 Interactive map powered by generic components. Use filters to explore the data.
                </div>
            )}
        </div>
    );
};

// Main content component
const MainPageContent = () => {
    const [activeVisualization, setActiveVisualization] = useState<TVisualizationType>('stats');

    // Track page view
    useEffect(() => {
        trackPageView('/');
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4 text-gray-900">
                            🌋 Generic Data Visualization Example
                        </h1>
                        <p className="text-gray-600 max-w-3xl mx-auto">
                            This demonstrates a completely generic, data-agnostic boilerplate using volcanic eruptions
                            as example data.
                            All components are reusable with any dataset by simply changing the configuration.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main layout: filters on left (1/4), visualizations on right (3/4) */}
            <div className="container mx-auto px-6 py-8" style={{pointerEvents: 'auto'}}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" style={{pointerEvents: 'auto'}}>

                    {/* Filters column (1/4) */}
                    <div className="lg:col-span-1" style={{pointerEvents: 'auto', zIndex: 10}}>
                        <GenericFilterPanel
                            filterConfigs={FILTER_CONFIG}
                            title="🔍 Dynamic Filters"
                        />
                    </div>

                    {/* Visualizations column (3/4) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Visualization switcher */}
                        <div className="bg-white border rounded-lg p-4" style={{pointerEvents: 'auto'}}>
                            <div className="flex justify-center gap-4">
                                <button
                                    className={`px-6 py-3 rounded-lg font-medium cursor-pointer transition-all ${
                                        activeVisualization === 'stats'
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    style={{pointerEvents: 'auto', zIndex: 100}}
                                    onClick={() => setActiveVisualization('stats')}
                                >
                                    📊 Statistics
                                </button>
                                <button
                                    className={`px-6 py-3 rounded-lg font-medium cursor-pointer transition-all ${
                                        activeVisualization === 'map'
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    style={{pointerEvents: 'auto', zIndex: 100}}
                                    onClick={() => setActiveVisualization('map')}
                                >
                                    🗺️ Interactive Map
                                </button>
                                <button
                                    className={`px-6 py-3 rounded-lg font-medium cursor-pointer transition-all ${
                                        activeVisualization === 'timeSeries'
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    style={{pointerEvents: 'auto', zIndex: 100}}
                                    onClick={() => setActiveVisualization('timeSeries')}
                                >
                                    📈 Time Series
                                </button>
                            </div>
                        </div>

                        {/* Visualization content */}
                        <div className="min-h-[500px]">
                            {activeVisualization === 'stats' && <StatsVisualization/>}
                            {activeVisualization === 'map' && <MapVisualization/>}
                            {activeVisualization === 'timeSeries' && <TimeSeriesVisualization/>}
                        </div>

                        {/* Generic Architecture Info */}
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-bold mb-4 text-center">🏗️ Generic Boilerplate Architecture</h3>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="font-semibold text-green-800 mb-1">Field-Value Filters</div>
                                    <div className="text-green-600">Dynamic configuration per visualization</div>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="font-semibold text-blue-800 mb-1">Generic API Service</div>
                                    <div className="text-blue-600">Data-agnostic service layer</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <div className="font-semibold text-purple-800 mb-1">Reusable Components</div>
                                    <div className="text-purple-600">Works with any dataset</div>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm">
                                <div className="font-semibold mb-2">✨ This example uses volcanic data, but the
                                    boilerplate is completely generic:
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                    <li><strong>Generic API Service:</strong> fetchMap, fetchTimeSeries,
                                        fetchAggregation, fetchFieldValues
                                    </li>
                                    <li><strong>Field-Value Filter System:</strong> No hardcoded filters, pure
                                        field-value pairs
                                    </li>
                                    <li><strong>Data-Agnostic Components:</strong> Map, Stats, TimeSeries work with any
                                        data structure
                                    </li>
                                    <li><strong>Easy Configuration:</strong> Just change the IDataSourceConfig to use
                                        your dataset
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main page with generic provider
export default function HomePage() {
    return (
        <GenericDataProvider
            dataSourceConfig={DATA_SOURCE_CONFIG}
            initialFilters={[]}
        >
            <MainPageContent/>
        </GenericDataProvider>
    );
}