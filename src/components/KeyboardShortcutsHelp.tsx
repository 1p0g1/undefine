import React, { useEffect, useRef } from 'react';
import { KeyboardShortcutsHelpProps } from '../types';
import './KeyboardShortcutsHelp.css';

/**
 * Component to display keyboard shortcuts in a modal
 */
const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
  shortcuts = {
    global: [],
    form: [],
    table: []
  }
}) => {
  // Reference to the modal content
  const modalRef = useRef<HTMLDivElement>(null);
  // Reference to the first focusable element in the modal
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  // Reference to the last focusable element in the modal
  const lastFocusableRef = useRef<HTMLButtonElement>(null);
  
  // Handle escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
      
      // Implement focus trap
      if (e.key === 'Tab' && isOpen) {
        // If shift + tab on first element, focus the last element
        if (e.shiftKey && document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
        // If tab on last element, focus the first element
        else if (!e.shiftKey && document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Focus the first element when the modal opens
    if (isOpen && firstFocusableRef.current) {
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="keyboard-shortcuts-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <div 
        className="keyboard-shortcuts-modal"
        ref={modalRef}
      >
        <div className="keyboard-shortcuts-header">
          <h2 id="keyboard-shortcuts-title">Keyboard Shortcuts</h2>
          <button
            ref={firstFocusableRef}
            className="close-button"
            onClick={onClose}
            aria-label="Close keyboard shortcuts dialog"
          >
            &times;
          </button>
        </div>
        
        <div className="keyboard-shortcuts-content">
          {shortcuts.global && shortcuts.global.length > 0 && (
            <div className="shortcuts-section">
              <h3>Global Shortcuts</h3>
              <ul className="shortcuts-list">
                {shortcuts.global.map((shortcut, index) => (
                  <li key={`global-${index}`} className="shortcut-item">
                    <span className="shortcut-key">{shortcut.key}</span>
                    <span className="shortcut-description">{shortcut.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {shortcuts.form && shortcuts.form.length > 0 && (
            <div className="shortcuts-section">
              <h3>Form Shortcuts</h3>
              <ul className="shortcuts-list">
                {shortcuts.form.map((shortcut, index) => (
                  <li key={`form-${index}`} className="shortcut-item">
                    <span className="shortcut-key">{shortcut.key}</span>
                    <span className="shortcut-description">{shortcut.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {shortcuts.table && shortcuts.table.length > 0 && (
            <div className="shortcuts-section">
              <h3>Table Shortcuts</h3>
              <ul className="shortcuts-list">
                {shortcuts.table.map((shortcut, index) => (
                  <li key={`table-${index}`} className="shortcut-item">
                    <span className="shortcut-key">{shortcut.key}</span>
                    <span className="shortcut-description">{shortcut.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="keyboard-shortcuts-footer">
          <button
            ref={lastFocusableRef}
            className="btn btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp; 