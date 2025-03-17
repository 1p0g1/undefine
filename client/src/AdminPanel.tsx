import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

interface WordEntry {
  word: string;
  partOfSpeech: string;
  synonyms?: string[];
  definition: string;
  alternateDefinition?: string;
  dateAdded?: string;
}

const AdminPanel: React.FC = () => {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [formData, setFormData] = useState<WordEntry>({
    word: '',
    partOfSpeech: '',
    definition: '',
    alternateDefinition: '',
    synonyms: [],
    dateAdded: formatDate(new Date())
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Format date to DD/MM/YY
  function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  }

  // Parse DD/MM/YY date string to Date object
  function parseDate(dateString: string): Date | null {
    // Expected format: DD/MM/YY
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
    const year = 2000 + parseInt(parts[2], 10); // Assuming 20xx for simplicity
    
    return new Date(year, month, day);
  }

  // Validate date format (DD/MM/YY)
  function isValidDate(dateString: string): boolean {
    // Check format
    if (!/^\d{2}\/\d{2}\/\d{2}$/.test(dateString)) return false;
    
    const date = parseDate(dateString);
    if (!date) return false;
    
    // Check if parsed date components match input
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    
    return dateString === `${day}/${month}/${year}`;
  }

  // Fetch all words
  useEffect(() => {
    const fetchWords = async () => {
      try {
        console.log('Fetching words from API...');
        setLoading(true);
        const response = await fetch('/api/admin/words');
        console.log('API response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API response data:', data);
        
        // Ensure each word has a dateAdded field, default to today for existing words that don't have it
        const wordsWithDates = data.words.map((word: WordEntry) => ({
          ...word,
          dateAdded: word.dateAdded || formatDate(new Date())
        }));
        
        setWords(wordsWithDates);
      } catch (error) {
        console.error('Error fetching words:', error);
        setError('Failed to load words. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'synonyms') {
      // Split comma-separated values into an array
      const synonymsArray = value.split(',').map(s => s.trim()).filter(s => s);
      setFormData({ ...formData, synonyms: synonymsArray });
    } else if (name === 'dateAdded') {
      // Validate date format
      setFormData({ ...formData, dateAdded: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Start editing a word
  const handleEdit = (word: WordEntry) => {
    setSelectedWord(word);
    setFormData({
      ...word,
      synonyms: word.synonyms || [],
      dateAdded: word.dateAdded || formatDate(new Date())
    });
    setIsEditing(true);
    setIsAdding(false);
  };

  // Start adding a new word
  const handleAdd = () => {
    setSelectedWord(null);
    setFormData({
      word: '',
      partOfSpeech: '',
      definition: '',
      alternateDefinition: '',
      synonyms: [],
      dateAdded: formatDate(new Date())
    });
    setIsAdding(true);
    setIsEditing(false);
  };

  // Cancel editing or adding
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setSelectedWord(null);
    setError(null);
    setSuccessMessage(null);
  };

  // Save a new or updated word
  const handleSave = async () => {
    try {
      // Validate form data
      if (!formData.word || !formData.definition || !formData.partOfSpeech) {
        setError('Word, definition, and part of speech are required.');
        return;
      }
      
      // Validate date format
      if (formData.dateAdded && !isValidDate(formData.dateAdded)) {
        setError('Date must be in DD/MM/YY format.');
        return;
      }

      let response;
      
      if (isAdding) {
        // Add a new word
        response = await fetch('/api/admin/words', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else if (isEditing && selectedWord) {
        // Update an existing word
        response = await fetch(`/api/admin/words/${selectedWord.word}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        setError('Invalid operation.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update the words list
      if (isAdding) {
        setWords([...words, data.word]);
        setSuccessMessage('Word added successfully!');
      } else {
        setWords(words.map(w => w.word === selectedWord?.word ? data.word : w));
        setSuccessMessage('Word updated successfully!');
      }

      // Reset form
      setIsEditing(false);
      setIsAdding(false);
      setSelectedWord(null);
      
      // Refresh the word list
      const refreshResponse = await fetch('/api/admin/words');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        // Ensure each word has a dateAdded field
        const wordsWithDates = refreshData.words.map((word: WordEntry) => ({
          ...word,
          dateAdded: word.dateAdded || formatDate(new Date())
        }));
        setWords(wordsWithDates);
      }
    } catch (error) {
      console.error('Error saving word:', error);
      setError(error instanceof Error ? error.message : 'Failed to save word. Please try again.');
    }
  };

  // Delete a word
  const handleDelete = async (word: WordEntry) => {
    if (!window.confirm(`Are you sure you want to delete "${word.word}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/words/${word.word}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Remove the word from the list
      setWords(words.filter(w => w.word !== word.word));
      setSuccessMessage('Word deleted successfully!');
    } catch (error) {
      console.error('Error deleting word:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete word. Please try again.');
    }
  };

  // Handle back to game navigation
  const handleBackToGame = () => {
    navigate('/');
  };

  // Render loading state
  if (loading) {
    return <div className="admin-panel loading">Loading words...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Word Management</h1>
        <button onClick={handleBackToGame} className="back-button">Back to Game</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="admin-controls">
        <button onClick={handleAdd} disabled={isAdding || isEditing}>
          Add New Word
        </button>
      </div>
      
      {(isAdding || isEditing) && (
        <div className="word-form">
          <h2>{isAdding ? 'Add New Word' : 'Edit Word'}</h2>
          
          <div className="form-group">
            <label htmlFor="word">Word:</label>
            <input
              type="text"
              id="word"
              name="word"
              value={formData.word}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="partOfSpeech">Part of Speech:</label>
            <input
              type="text"
              id="partOfSpeech"
              name="partOfSpeech"
              value={formData.partOfSpeech}
              onChange={handleInputChange}
              placeholder="e.g., noun, verb, adjective"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="definition">Definition:</label>
            <textarea
              id="definition"
              name="definition"
              value={formData.definition}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="alternateDefinition">Alternate Definition (optional):</label>
            <textarea
              id="alternateDefinition"
              name="alternateDefinition"
              value={formData.alternateDefinition || ''}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="synonyms">Synonyms (comma-separated, optional):</label>
            <input
              type="text"
              id="synonyms"
              name="synonyms"
              value={formData.synonyms ? formData.synonyms.join(', ') : ''}
              onChange={handleInputChange}
              placeholder="e.g., happy, joyful, content"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="dateAdded">Date Added (DD/MM/YY):</label>
            <input
              type="text"
              id="dateAdded"
              name="dateAdded"
              value={formData.dateAdded || formatDate(new Date())}
              onChange={handleInputChange}
              placeholder="DD/MM/YY"
            />
          </div>
          
          <div className="form-actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel} className="cancel-button">Cancel</button>
          </div>
        </div>
      )}
      
      <div className="words-list">
        <h2>Words List</h2>
        {words.length === 0 ? (
          <p>No words found. Add some words to get started.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Word</th>
                <th>Part of Speech</th>
                <th>Definition</th>
                <th>Alt. Definition</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word, index) => (
                <tr key={word.word}>
                  <td className="row-number">{index + 1}</td>
                  <td>{word.word}</td>
                  <td>{word.partOfSpeech}</td>
                  <td>{word.definition}</td>
                  <td>{word.alternateDefinition || '—'}</td>
                  <td>{word.dateAdded || formatDate(new Date())}</td>
                  <td>
                    <button onClick={() => handleEdit(word)} className="edit-button">Edit</button>
                    <button onClick={() => handleDelete(word)} className="delete-button">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 