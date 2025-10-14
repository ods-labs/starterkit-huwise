'use client';

import { useFieldValues } from '@/hooks/useGenericData';
import { useGenericFilters } from '@/contexts/GenericDataContext';
import type { IGenericFilterProps } from '@/types';

export default function GenericFilter({
  field,
  label,
  type,
  placeholder = "All values",
  onFilterChange,
  currentValue
}: IGenericFilterProps) {
  const { data: fieldValues, isLoading } = useFieldValues(field, { 
    excludeCurrentFilters: true 
  });

  const handleChange = (value: any) => {
    // Call parent's onChange
    onFilterChange(field, value);
  };

  if (isLoading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!fieldValues || fieldValues.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-400">
          No options available
        </div>
      </div>
    );
  }

  // Select dropdown
  if (type === 'select') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <select
          value={currentValue || ''}
          onChange={(e) => handleChange(e.target.value || null)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
          style={{ pointerEvents: 'auto', zIndex: 100 }}
        >
          <option value="">{placeholder}</option>
          {fieldValues.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} {option.count ? `(${option.count})` : ''}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Checkbox (for boolean fields or presence checks)
  if (type === 'checkbox') {
    return (
      <div>
        <label className="flex items-center space-x-2 cursor-pointer" style={{ pointerEvents: 'auto', zIndex: 100 }}>
          <input
            type="checkbox"
            checked={!!currentValue}
            onChange={(e) => handleChange(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          />
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
        </label>
      </div>
    );
  }

  // Multi-select (future enhancement)
  if (type === 'multiselect') {
    // For now, return a simple multi-select placeholder
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="text-sm text-gray-500 p-2 border border-gray-300 rounded-md bg-gray-50">
          Multi-select not implemented yet
        </div>
      </div>
    );
  }

  return null;
}

// Generic Filter Panel component
interface GenericFilterPanelProps {
  filterConfigs: Array<{
    field: string;
    label: string;
    type: 'select' | 'multiselect' | 'checkbox';
    placeholder?: string;
  }>;
  title?: string;
  onReset?: () => void;
}

export function GenericFilterPanel({ 
  filterConfigs, 
  title = "🔍 Filters",
  onReset 
}: GenericFilterPanelProps) {
  const { getFilterValue, updateFilter, clearAllFilters } = useGenericFilters();

  const handleReset = () => {
    clearAllFilters();
    onReset?.();
  };

  return (
    <div className="bg-white border rounded-lg p-6 h-fit sticky top-4" style={{ pointerEvents: 'auto', zIndex: 10 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <button
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
          style={{ pointerEvents: 'auto', zIndex: 100 }}
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      <div className="space-y-6" style={{ pointerEvents: 'auto' }}>
        {filterConfigs.map((config) => (
          <GenericFilter
            key={config.field}
            field={config.field}
            label={config.label}
            type={config.type}
            placeholder={config.placeholder}
            currentValue={getFilterValue(config.field)}
            onFilterChange={updateFilter}
          />
        ))}

        {/* Active filters summary */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h3>
          <div className="text-xs text-gray-500 space-y-1">
            {filterConfigs
              .filter(config => getFilterValue(config.field))
              .map(config => (
                <div key={config.field}>
                  • {config.label}: {String(getFilterValue(config.field))}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}