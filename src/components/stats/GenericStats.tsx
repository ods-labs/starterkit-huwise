'use client';

import type { IGenericStatsProps } from '@/types';

export default function GenericStats({ 
  data, 
  isLoading = false, 
  title = "Overall Statistics" 
}: IGenericStatsProps) {
  if (isLoading) {
    return (
      <div className="p-6 border rounded-lg bg-white">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 border rounded-lg bg-white">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  // Extract statistics from data object
  const stats = Object.entries(data)

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map(([key, value]) => {
          return (
            <div key={key} className={`text-center p-3 rounded-lg`}>
              <div className="text-2xl font-bold">
                {typeof value === 'number' 
                  ? value.toLocaleString() 
                  : String(value)
                }
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {key.replace(/_/g, ' ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}