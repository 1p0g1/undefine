import { useState, useCallback } from 'react';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage.js';
function compareValues(a, b) {
    if (a === null || a === undefined)
        return 1;
    if (b === null || b === undefined)
        return -1;
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}
/**
 * Hook for sorting and filtering data
 */
const useSortAndFilter = ({ initialSort, initialFilters, onSortChange, onFilterChange } = {}) => {
    // Get saved preferences from local storage
    const savedSort = getFromStorage(STORAGE_KEYS.SORT_PREFERENCES, { field: 'word', direction: 'asc' });
    const savedFilters = getFromStorage(STORAGE_KEYS.FILTER_PREFERENCES, {});
    // Initialize state with saved preferences or defaults
    const [sortField, setSortFieldState] = useState(initialSort?.field || savedSort.field);
    const [sortDirection, setSortDirection] = useState(initialSort?.direction || savedSort.direction);
    const [filters, setFiltersState] = useState(initialFilters || savedFilters);
    // Update sort field with side effects
    const setSortField = useCallback((field) => {
        setSortFieldState(field);
        // If changing sort field, reset direction to asc
        setSortDirection('asc');
        // Save preferences
        saveToStorage(STORAGE_KEYS.SORT_PREFERENCES, {
            field,
            direction: 'asc'
        });
        // Call the callback if provided
        if (onSortChange) {
            onSortChange(field, 'asc');
        }
    }, [onSortChange]);
    // Toggle sort direction
    const toggleSortDirection = useCallback(() => {
        const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        setSortDirection(newDirection);
        // Save preferences
        saveToStorage(STORAGE_KEYS.SORT_PREFERENCES, {
            field: sortField,
            direction: newDirection
        });
        // Call the callback if provided
        if (onSortChange) {
            onSortChange(sortField, newDirection);
        }
    }, [sortField, sortDirection, onSortChange]);
    // Reset sort to defaults
    const resetSort = useCallback(() => {
        const defaultField = 'word';
        const defaultDirection = 'asc';
        setSortFieldState(defaultField);
        setSortDirection(defaultDirection);
        // Save preferences
        saveToStorage(STORAGE_KEYS.SORT_PREFERENCES, {
            field: defaultField,
            direction: defaultDirection
        });
        // Call the callback if provided
        if (onSortChange) {
            onSortChange(defaultField, defaultDirection);
        }
    }, [onSortChange]);
    // Set a single filter
    const setFilter = useCallback((key, value) => {
        setFiltersState(prev => {
            const newFilters = { ...prev };
            // If value is undefined or empty, remove the filter
            if (value === undefined || value === '') {
                delete newFilters[key];
            }
            else {
                newFilters[key] = value;
            }
            // Save preferences
            saveToStorage(STORAGE_KEYS.FILTER_PREFERENCES, newFilters);
            // Call the callback if provided
            if (onFilterChange) {
                onFilterChange(newFilters);
            }
            return newFilters;
        });
    }, [onFilterChange]);
    // Clear all filters
    const clearFilters = useCallback(() => {
        setFiltersState({});
        // Save preferences
        saveToStorage(STORAGE_KEYS.FILTER_PREFERENCES, {});
        // Call the callback if provided
        if (onFilterChange) {
            onFilterChange({});
        }
    }, [onFilterChange]);
    // Sort and filter items
    const getSortedFilteredItems = useCallback((items) => {
        // First filter items
        let result = [...items];
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (!value)
                return;
            result = result.filter(item => {
                const itemValue = item[key];
                // Skip if the item doesn't have this field
                if (itemValue === undefined)
                    return true;
                // Case-insensitive string comparison
                if (typeof itemValue === 'string') {
                    return itemValue.toLowerCase().includes((typeof value === 'string' ? value : '').toLowerCase());
                }
                // Array of strings (like synonyms)
                if (Array.isArray(itemValue) && itemValue.every((v) => typeof v === 'string')) {
                    return itemValue.some((v) => v.toLowerCase().includes((typeof value === 'string' ? value : '').toLowerCase()));
                }
                // Exact match for other types
                return itemValue === value;
            });
        });
        // Sort items
        result.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            // Handle undefined values
            if (aValue === undefined && bValue === undefined)
                return 0;
            if (aValue === undefined)
                return 1;
            if (bValue === undefined)
                return -1;
            // Compare based on value type
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            if (Array.isArray(aValue) && Array.isArray(bValue)) {
                // Sort by array length
                return sortDirection === 'asc'
                    ? aValue.length - bValue.length
                    : bValue.length - aValue.length;
            }
            // Default comparison - handle null values
            if (aValue === null && bValue === null)
                return 0;
            if (aValue === null)
                return sortDirection === 'asc' ? -1 : 1;
            if (bValue === null)
                return sortDirection === 'asc' ? 1 : -1;
            // Safe comparison for non-null values
            const comparison = compareValues(aValue, bValue);
            return sortDirection === 'asc' ? comparison : -comparison;
        });
        return result;
    }, [filters, sortField, sortDirection]);
    return {
        sortField,
        sortDirection,
        filters,
        setSortField,
        toggleSortDirection,
        resetSort,
        setFilter,
        clearFilters,
        getSortedFilteredItems
    };
};
export default useSortAndFilter;
