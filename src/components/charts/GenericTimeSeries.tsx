'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { IGenericTimeSeriesProps } from '@/types';

export default function GenericTimeSeries({ 
  data, 
  isLoading = false, 
  title = "Time Series",
  xAxisLabel = "Time",
  yAxisLabel = "Value"
}: IGenericTimeSeriesProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        
        <div className="p-6 border rounded-lg bg-white">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-gray-600">{xAxisLabel} vs {yAxisLabel}</p>
        </div>
        
        <div className="p-6 border rounded-lg bg-white">
          <div className="text-gray-500 text-center">No time series data available</div>
        </div>
      </div>
    );
  }

  // Prepare data for Recharts - ensure we have clean data
  const chartData = data.map((point) => ({
    date: point.label || point.timestamp,
    value: point.value,
    timestamp: point.timestamp
  })).sort((a, b) => {
    // Sort by timestamp/date - handle both string and number types
    const dateA = String(a.date);
    const dateB = String(b.date);
    return dateA.localeCompare(dateB);
  });

  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-gray-600">{xAxisLabel} vs {yAxisLabel}</p>
      </div>
      
      <div className="p-6 border rounded-lg bg-white">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `${xAxisLabel}: ${label}`}
                formatter={(value) => [value, yAxisLabel]}
              />
              <Bar 
                dataKey="value" 
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-center mt-4 text-sm text-gray-500">
          Total: {totalValue.toLocaleString()} | {chartData.length} data points
        </div>
      </div>
    </div>
  );
}