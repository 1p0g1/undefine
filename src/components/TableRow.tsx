import React, { useState } from 'react';
import { TableRowProps } from '../types';
import SwipeableRow from './SwipeableRow';
import './TableRow.css';

/**
 * TableRow component for displaying word entries in a table
 */
const TableRow: React.FC<TableRowProps> = ({
  word,
  onEdit,
  onDelete,
  isSelected,
  toggleSelection,
  isSwipeable = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format the synonyms for display
  const formatSynonyms = (synonyms: string[] | undefined): string => {
    if (!synonyms || synonyms.length === 0) return 'None';
    return synonyms.join(', ');
  };
  
  // Handle row click to toggle expansion on mobile
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't expand if clicking on a checkbox or button
    if (
      e.target instanceof HTMLElement &&
      (e.target.tagName === 'INPUT' || 
       e.target.tagName === 'BUTTON' ||
       e.target.closest('button'))
    ) {
      return;
    }
    
    // Only expand on mobile
    if (window.innerWidth <= 768) {
      setIsExpanded(!isExpanded);
    }
  };
  
  // Handle checkbox change to toggle selection
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleSelection(word);
  };
  
  // Handle edit button click
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(word);
  };
  
  // Handle delete button click
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(word);
  };
  
  const rowContent = (
    <tr 
      className={`table-row ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}
      onClick={handleRowClick}
      data-word-id={word.word}
    >
      <td className="checkbox-cell">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          aria-label={`Select ${word.word}`}
        />
      </td>
      <td className="word-cell">
        <span className="primary-text">{word.word}</span>
        <span className="secondary-text">{word.partOfSpeech}</span>
      </td>
      <td className="definition-cell">
        <div className="definition-content">
          <div className="primary-definition">{word.definition}</div>
          {word.alternateDefinition && (
            <div className="alternate-definition">
              <span className="alt-label">Alt: </span>
              {word.alternateDefinition}
            </div>
          )}
        </div>
      </td>
      <td className="synonyms-cell">
        {formatSynonyms(word.synonyms)}
      </td>
      <td className="date-cell">
        {word.dateAdded || '-'}
      </td>
      <td className="actions-cell">
        <div className="action-buttons">
          <button
            className="btn btn-icon edit-btn"
            onClick={handleEdit}
            aria-label={`Edit ${word.word}`}
          >
            <span className="icon">✏️</span>
          </button>
          <button
            className="btn btn-icon delete-btn"
            onClick={handleDelete}
            aria-label={`Delete ${word.word}`}
          >
            <span className="icon">🗑️</span>
          </button>
        </div>
      </td>
    </tr>
  );
  
  // Show expanded view on mobile
  const expandedContent = isExpanded && (
    <tr className="expanded-row">
      <td colSpan={6}>
        <div className="expanded-content">
          <div className="expanded-section">
            <h4>Definition</h4>
            <p>{word.definition}</p>
          </div>
          
          {word.alternateDefinition && (
            <div className="expanded-section">
              <h4>Alternate Definition</h4>
              <p>{word.alternateDefinition}</p>
            </div>
          )}
          
          <div className="expanded-section">
            <h4>Synonyms</h4>
            <p>{formatSynonyms(word.synonyms)}</p>
          </div>
          
          <div className="expanded-section">
            <h4>Daily Word Date</h4>
            <p>{word.dateAdded || 'Not scheduled'}</p>
          </div>
          
          <div className="expanded-actions">
            <button
              className="btn btn-primary"
              onClick={handleEdit}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
  
  // Use SwipeableRow on mobile if enabled
  return isSwipeable && window.innerWidth <= 768 ? (
    <SwipeableRow
      onEdit={() => onEdit(word)}
      onDelete={() => onDelete(word)}
    >
      {rowContent}
      {expandedContent}
    </SwipeableRow>
  ) : (
    <>
      {rowContent}
      {expandedContent}
    </>
  );
};

export default TableRow; 