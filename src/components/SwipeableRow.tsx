import React, { useState, useRef, useEffect, ReactNode } from 'react';
import './SwipeableRow.css';

interface SwipeableRowProps {
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  threshold?: number;
  disabled?: boolean;
}

/**
 * SwipeableRow component for mobile swipe gestures
 * Allows swiping left to reveal edit/delete actions
 */
const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onEdit,
  onDelete,
  threshold = 0.4, // 40% of row width to trigger action
  disabled = false
}) => {
  // State for tracking swipe motion
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  // Refs for DOM elements
  const rowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Calculate row width for threshold
  const getRowWidth = (): number => {
    return rowRef.current?.offsetWidth || 0;
  };
  
  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };
  
  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || disabled) return;
    
    const x = e.touches[0].clientX;
    const diff = startX - x;
    
    // Only allow swiping left (positive diff)
    if (diff > 0) {
      setCurrentX(x);
    }
  };
  
  // Handle touch end
  const handleTouchEnd = () => {
    if (!isSwiping || disabled) return;
    
    const diff = startX - currentX;
    const rowWidth = getRowWidth();
    
    // If swiped more than threshold, show actions
    if (diff > rowWidth * threshold) {
      setShowActions(true);
    } else {
      // Reset position
      setShowActions(false);
    }
    
    setIsSwiping(false);
  };
  
  // Calculate transform style based on swipe state
  const getTransformStyle = (): React.CSSProperties => {
    if (!isSwiping && !showActions) {
      return { transform: 'translateX(0)' };
    }
    
    if (showActions) {
      // Show action buttons (maximum 100px)
      return { transform: 'translateX(-100px)' };
    }
    
    if (isSwiping) {
      const diff = startX - currentX;
      // Limit maximum swipe to 100px
      const translateX = Math.min(diff, 100);
      
      if (translateX <= 0) return { transform: 'translateX(0)' };
      return { transform: `translateX(-${translateX}px)` };
    }
    
    return {};
  };
  
  // Close actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showActions &&
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
        setShowActions(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActions]);
  
  return (
    <div 
      className={`swipeable-row-container ${showActions ? 'actions-visible' : ''}`}
      ref={rowRef}
    >
      <div
        className="swipeable-row-content"
        ref={contentRef}
        style={getTransformStyle()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
        
        {/* Swipe hint indicator */}
        <div className="swipe-hint" aria-hidden="true">
          <span className="swipe-hint-text">Swipe left for actions</span>
          <span className="swipe-hint-icon">←</span>
        </div>
      </div>
      
      <div className="swipeable-row-actions">
        <button 
          className="swipeable-action edit-action"
          onClick={onEdit}
          aria-label="Edit"
        >
          Edit
        </button>
        <button 
          className="swipeable-action delete-action"
          onClick={onDelete}
          aria-label="Delete"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SwipeableRow; 