import React from 'react';
import { PaginationProps } from '../types';
import './Pagination.css';

/**
 * Reusable pagination component with page navigation and per-page selection
 */
const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
  // Return nothing if there's no pagination info
  if (!pagination) return null;
  
  const { page, limit, total, pages } = pagination;
  
  // Calculate start and end items on current page
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  
  // Create an array of page numbers to display
  const getPageNumbers = (): number[] => {
    const maxPageButtons = 7; // Maximum number of page buttons to show
    const pageNumbers: number[] = [];
    
    if (pages <= maxPageButtons) {
      // If total pages is less than max buttons, show all pages
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first, last, current page, and pages around current
      pageNumbers.push(1); // First page
      
      const leftSiblingIndex = Math.max(page - 1, 2);
      const rightSiblingIndex = Math.min(page + 1, pages - 1);
      
      // Add ellipsis if needed before left sibling
      if (leftSiblingIndex > 2) {
        pageNumbers.push(-1); // -1 represents ellipsis
      }
      
      // Add page numbers around current page
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed after right sibling
      if (rightSiblingIndex < pages - 1) {
        pageNumbers.push(-2); // -2 represents ellipsis to distinguish from left ellipsis
      }
      
      pageNumbers.push(pages); // Last page
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  // Handler for page size change
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    onLimitChange(newLimit);
  };
  
  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {startItem}-{endItem} of {total} items
      </div>
      
      <div className="pagination-controls">
        <button
          className="pagination-button pagination-button-nav"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="First page"
        >
          <span aria-hidden="true">«</span>
        </button>
        
        <button
          className="pagination-button pagination-button-nav"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <span aria-hidden="true">‹</span>
        </button>
        
        {pageNumbers.map((pageNumber, index) => {
          // Render ellipsis
          if (pageNumber < 0) {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                …
              </span>
            );
          }
          
          // Render page button
          return (
            <button
              key={`page-${pageNumber}`}
              className={`pagination-button ${page === pageNumber ? 'pagination-button-active' : ''}`}
              onClick={() => onPageChange(pageNumber)}
              disabled={page === pageNumber}
              aria-label={`Page ${pageNumber}`}
              aria-current={page === pageNumber ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
        
        <button
          className="pagination-button pagination-button-nav"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          aria-label="Next page"
        >
          <span aria-hidden="true">›</span>
        </button>
        
        <button
          className="pagination-button pagination-button-nav"
          onClick={() => onPageChange(pages)}
          disabled={page === pages}
          aria-label="Last page"
        >
          <span aria-hidden="true">»</span>
        </button>
      </div>
      
      <div className="pagination-size">
        <label>
          Items per page:
          <select value={limit} onChange={handleLimitChange}>
            {pageSizeOptions.map((size: number) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default Pagination; 