import { useState, useEffect, useCallback } from 'react';
import { PaginationInfo } from '../types/index.js';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

// Extended pagination info with next/prev page helpers
interface ExtendedPaginationInfo extends PaginationInfo {
  next?: { page: number; limit: number };
  prev?: { page: number; limit: number };
}

interface UsePaginationProps {
  totalItems?: number;
  initialPage?: number;
  initialLimit?: number;
  onPageChange?: (page: number, limit: number) => void;
}

interface UsePaginationResult {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  totalPages: number;
  paginationInfo: ExtendedPaginationInfo | null;
  canPrevPage: boolean;
  canNextPage: boolean;
  getPageItems: (items: any[]) => any[];
}

/**
 * Custom hook for pagination
 */
const usePagination = ({
  totalItems = 0,
  initialPage = 1,
  initialLimit,
  onPageChange
}: UsePaginationProps): UsePaginationResult => {
  // Get default limit from storage or use 10 if not found
  const savedLimit = getFromStorage(STORAGE_KEYS.PAGINATION_LIMIT, 10);
  
  // Initialize state
  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit || savedLimit);
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  
  // Ensure page is within valid range
  useEffect(() => {
    if (page > totalPages) {
      setPageState(totalPages);
    }
  }, [page, totalPages]);
  
  // Update pagination when limit changes
  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    saveToStorage(STORAGE_KEYS.PAGINATION_LIMIT, newLimit);
    // Recalculate page to maintain position
    const newTotalPages = Math.max(1, Math.ceil(totalItems / newLimit));
    const currentIndex = (page - 1) * limit;
    const newPage = Math.max(1, Math.min(Math.floor(currentIndex / newLimit) + 1, newTotalPages));
    setPageState(newPage);
    
    // Call the onChange callback if provided
    if (onPageChange) {
      onPageChange(newPage, newLimit);
    }
  }, [page, limit, totalItems, onPageChange]);
  
  // Set page with validation
  const setPage = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setPageState(validPage);
    
    // Call the onChange callback if provided
    if (onPageChange) {
      onPageChange(validPage, limit);
    }
  }, [totalPages, limit, onPageChange]);
  
  // Navigation methods
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages, setPage]);
  
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page, setPage]);
  
  const firstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);
  
  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages, setPage]);
  
  // Can navigate checks
  const canNextPage = page < totalPages;
  const canPrevPage = page > 1;
  
  // Get paginated items from array
  const getPageItems = useCallback((items: any[]) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return items.slice(startIndex, endIndex);
  }, [page, limit]);
  
  // Create pagination info object for API responses
  const paginationInfo: ExtendedPaginationInfo = {
    total: totalItems,
    page,
    limit,
    totalPages,
    next: canNextPage ? { page: page + 1, limit } : undefined,
    prev: canPrevPage ? { page: page - 1, limit } : undefined
  };
  
  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    totalPages,
    paginationInfo: totalItems > 0 ? paginationInfo : null,
    canPrevPage,
    canNextPage,
    getPageItems
  };
};

export default usePagination; 