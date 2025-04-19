import { describe, it, expect } from 'vitest';
import { validate as uuidValidate } from 'uuid';
import fetch from 'node-fetch';

// Get the API URL from environment variables or use a default for tests
const API_URL = process.env.API_URL || 'http://localhost:3001';

describe('API endpoints', () => {
  it('/api/word returns a word with a valid UUID', async () => {
    const response = await fetch(`${API_URL}/api/word`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('word');
    expect(data.word).toHaveProperty('id');
    
    // Validate that the UUID is in the correct format
    expect(uuidValidate(data.word.id)).toBe(true);
  });

  it('/api/random returns a word with a valid UUID', async () => {
    const response = await fetch(`${API_URL}/api/random`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('word');
    expect(data.word).toHaveProperty('id');
    
    // Validate that the UUID is in the correct format
    expect(uuidValidate(data.word.id)).toBe(true);
  });

  it('Word data has all required properties', async () => {
    const response = await fetch(`${API_URL}/api/word`);
    const data = await response.json();
    
    // Check for required properties
    expect(data.word).toHaveProperty('word');
    expect(data.word).toHaveProperty('definition');
    expect(data.word).toHaveProperty('first_letter');
    expect(data.word).toHaveProperty('number_of_letters');
    
    // Type validations
    expect(typeof data.word.word).toBe('string');
    expect(typeof data.word.definition).toBe('string');
    expect(typeof data.word.first_letter).toBe('string');
    expect(typeof data.word.number_of_letters).toBe('number');
  });
}); 