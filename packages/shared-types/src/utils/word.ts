import { z } from 'zod';
import { validate as uuidValidate } from 'uuid';

// Word data schema with strict validation
export const WordSchema = z.object({
  id: z.string().refine(val => uuidValidate(val), {
    message: 'Invalid UUID format'
  }),
  word: z.string().min(1),
  clues: z.object({
    D: z.string(),  // Definition
    E: z.string(),  // Etymology
    F: z.string(),  // First letter
    I: z.string(),  // In a sentence
    N: z.number(),  // Number of letters
    E2: z.string().nullable()  // Equivalents as comma-separated string
  })
});

export type WordData = z.infer<typeof WordSchema>;

export function validateWord(data: unknown): WordData {
  try {
    return WordSchema.parse(data);
  } catch (error) {
    console.error('Word validation failed:', error);
    throw new Error('Invalid word data structure');
  }
}

// Helper function to validate just the UUID
export function validateWordId(id: string): boolean {
  return uuidValidate(id);
}

// Helper function to validate clues structure
export function validateClues(clues: unknown): boolean {
  try {
    WordSchema.shape.clues.parse(clues);
    return true;
  } catch {
    return false;
  }
}

// Helper function to safely split equivalents string
export function getSynonyms(equivalents: string | null): string[] {
  if (!equivalents) return [];
  return equivalents.split(',').map(s => s.trim()).filter(Boolean);
} 