'use client';

import { useState, useMemo } from 'react';
import Map, { Marker, Popup } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { IGenericMapProps, IMapDataPoint } from '@/types';

export default function GenericMap({ 
  data, 
  isLoading = false, 
  onPointClick 
}: IGenericMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<IMapDataPoint | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2
  });

  // Calculate bounds to fit all data points
  const bounds = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const lats = data.map(d => d.latitude).filter(lat => lat !== null && lat !== undefined);
    const lngs = data.map(d => d.longitude).filter(lng => lng !== null && lng !== undefined);
    
    if (lats.length === 0 || lngs.length === 0) return null;
    
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs)
    };
  }, [data]);

  // Auto-fit map to data when data changes
  useMemo(() => {
    if (bounds && data && data.length > 0) {
      const centerLat = (bounds.minLat + bounds.maxLat) / 2;
      const centerLng = (bounds.minLng + bounds.maxLng) / 2;
      
      setViewState(prev => ({
        ...prev,
        longitude: centerLng,
        latitude: centerLat,
        zoom: data.length === 1 ? 8 : 2
      }));
    }
  }, [bounds, data]);

  const handleMarkerClick = (point: IMapDataPoint) => {
    setSelectedPoint(point);
    onPointClick?.(point);
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data points to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        attributionControl={{}}
      >
        {/* Render all data points as simple markers */}
        {data.map((point) => (
          <Marker
            key={point.id}
            longitude={point.longitude}
            latitude={point.latitude}
            onClick={() => handleMarkerClick(point)}
          >
            <div
              className="w-3 h-3 bg-primary rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform shadow-lg"
              title={point.label || 'Data point'}
            />
          </Marker>
        ))}

        {/* Selected point popup */}
        {selectedPoint && (
          <Popup
            longitude={selectedPoint.longitude}
            latitude={selectedPoint.latitude}
            anchor="bottom"
            onClose={() => setSelectedPoint(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-2 min-w-48">
              <h3 className="font-bold text-sm mb-2">
                {selectedPoint.label || 'Data Point'}
              </h3>
              <div className="text-xs space-y-1">
                <div>
                  <span className="font-medium">Coordinates:</span>{' '}
                  {selectedPoint.latitude.toFixed(4)}, {selectedPoint.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Data counter */}
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-700">
        {data.length} points
      </div>
    </div>
  );
}