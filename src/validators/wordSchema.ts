import { z } from 'zod';

// Define a schema for validating Word objects
export const WordSchema = z.object({
  id: z.string().uuid({
    message: "Invalid UUID format for word ID"
  }),
  word: z.string().min(1, {
    message: "Word must not be empty"
  }),
  definition: z.string().min(1, {
    message: "Definition must not be empty"
  }),
  etymology: z.string().optional().default(''),
  first_letter: z.string().min(1, {
    message: "First letter must not be empty"
  }),
  in_a_sentence: z.string().optional().default(''),
  number_of_letters: z.number().int().positive({
    message: "Number of letters must be a positive integer"
  }),
  equivalents: z.union([
    z.array(z.string()),
    z.string().transform(str => str.split(',').map(s => s.trim())),
    z.null().transform(() => [])
  ]).default([]),
  difficulty: z.string().optional().default('Medium'),
  date: z.string().nullable().optional()
});

// Export the Word type from the schema for TypeScript usage
export type Word = z.infer<typeof WordSchema>;

// Helper function to validate a Word object
export function validateWord(word: unknown): { valid: boolean; word?: Word; error?: string } {
  try {
    const validatedWord = WordSchema.parse(word);
    return { valid: true, word: validatedWord };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        valid: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { valid: false, error: 'Unknown validation error' };
  }
}

// Helper function to safely validate a UUID string
export function validateUUID(id: string): boolean {
  return z.string().uuid().safeParse(id).success;
} 