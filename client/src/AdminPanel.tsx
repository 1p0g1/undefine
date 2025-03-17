import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './AdminPanel.css';

interface WordEntry {
  word: string;
  partOfSpeech: string;
  synonyms?: string[];
  definition: string;
  alternateDefinition?: string;
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
    synonyms: []
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch all words
  useEffect(() => {
    const fetchWords = async () => {
      try {
        console.log('Fetching words from API...');
        setLoading(true);
        const response = await fetch('/api/admin/words', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('API response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API response data:', data);
        setWords(data.words);
      } catch (error) {
        console.error('Error fetching words:', error);
        setError('Failed to load words. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [token]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'synonyms') {
      // Split comma-separated values into an array
      const synonymsArray = value.split(',').map(s => s.trim()).filter(s => s);
      setFormData({ ...formData, synonyms: synonymsArray });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Start editing a word
  const handleEdit = (word: WordEntry) => {
    setSelectedWord(word);
    setFormData({
      ...word,
      synonyms: word.synonyms || []
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
      synonyms: []
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

      let response;
      
      if (isAdding) {
        // Add a new word
        response = await fetch('/api/admin/words', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });
      } else if (isEditing && selectedWord) {
        // Update an existing word
        response = await fetch(`/api/admin/words/${selectedWord.word}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
      const refreshResponse = await fetch('/api/admin/words', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setWords(refreshData.words);
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  // Handle logout
  const handleLogout = () => {
    logout();
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
        <button onClick={handleLogout} className="logout-button">Logout</button>
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
                <th>Word</th>
                <th>Part of Speech</th>
                <th>Definition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) => (
                <tr key={word.word}>
                  <td>{word.word}</td>
                  <td>{word.partOfSpeech}</td>
                  <td>{word.definition}</td>
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