# Reverse Define Admin Panel

An administrative interface for managing the word database of the Reverse Define application.

## Features

- **Word Management**: Add, edit, and delete words in the database
- **Form Validation**: Client-side validation for word entries
- **Search & Filter**: Quickly find words with search and filters
- **Keyboard Shortcuts**: Efficient keyboard navigation and actions
- **Mobile Support**: Responsive design with swipe gestures on mobile
- **Accessibility**: Built with accessibility in mind

## Components

- **WordForm**: Form for adding and editing words with validation
- **TableRow**: Displays word entries in a table with expandable view on mobile
- **SwipeableRow**: Enables swipe gestures for editing and deleting on mobile
- **SearchBar**: Search functionality for finding words
- **Pagination**: Navigate through large sets of word entries
- **Toast**: Notification system for action feedback
- **Modal**: Reusable modal component
- **KeyboardShortcutsHelp**: Help modal for keyboard shortcuts

## Utilities

- **Validation**: Form validation utility functions
- **useKeyboardShortcuts**: Custom hook for keyboard shortcuts
- **useUndoRedo**: Custom hook for undo/redo functionality

## Getting Started

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Start the development server:**
   ```
   npm start
   ```

3. **Build for production:**
   ```
   npm run build
   ```

## Tech Stack

- React
- TypeScript
- CSS (with modern features)
- React Hooks (including custom hooks)

## Word Data Structure

```typescript
interface WordEntry {
  word: string;                  // The word itself
  partOfSpeech: string;          // Noun, verb, adjective, etc.
  synonyms: string[];            // Array of synonyms
  definition: string;            // Primary definition
  alternateDefinition?: string;  // Optional alternate definition
  dateAdded: string;             // Date when word will be the daily word (DD/MM/YY)
}
```
