// All test inputs are defined inline — no external mock imports.
import { describe, it, expect } from 'vitest';
import { mapDBWordToGameWord } from '../mappers.js';
import { DBWord } from '../../types/db.js';
import { GameWord } from '../../types/app.js';

describe('mapDBWordToGameWord', () => {
  it('should map a valid DBWord to GameWord', () => {
    const dbWord: DBWord = {
      id: '1',
      word: 'test',
      definition: 'a test definition',
      etymology: 'test etymology',
      first_letter: 't',
      in_a_sentence: 'This is a test sentence.',
      number_of_letters: 4,
      equivalents: ['synonym1', 'synonym2'],
      difficulty: 'Easy',
      created_at: '2023-01-01',
      updated_at: '2023-01-02'
    };

    const gameWord = mapDBWordToGameWord(dbWord);

    expect(gameWord).toEqual({
      id: '1',
      word: 'test',
      definition: 'a test definition',
      etymology: 'test etymology',
      firstLetter: 't',
      inASentence: 'This is a test sentence.',
      numberOfLetters: 4,
      equivalents: ['synonym1', 'synonym2'],
      difficulty: 'Easy',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-02'
    });
  });

  it('should handle undefined equivalents by returning an empty array', () => {
    const dbWord: Partial<DBWord> = {
      id: '1',
      word: 'test',
      definition: 'a test definition',
      etymology: 'test etymology',
      first_letter: 't',
      in_a_sentence: 'This is a test sentence.',
      number_of_letters: 4,
      difficulty: 'Easy',
      created_at: '2023-01-01',
      updated_at: '2023-01-02'
    };

    const gameWord = mapDBWordToGameWord(dbWord as DBWord);

    expect(gameWord.equivalents).toEqual([]);
  });

  it('should handle null equivalents by returning an empty array', () => {
    const dbWord: DBWord = {
      id: '1',
      word: 'test',
      definition: 'a test definition',
      etymology: 'test etymology',
      first_letter: 't',
      in_a_sentence: 'This is a test sentence.',
      number_of_letters: 4,
      equivalents: null as unknown as string[],
      difficulty: 'Easy',
      created_at: '2023-01-01',
      updated_at: '2023-01-02'
    };

    const gameWord = mapDBWordToGameWord(dbWord);

    expect(gameWord.equivalents).toEqual([]);
  });

  it('should handle non-array equivalents by returning an empty array', () => {
    const dbWord: DBWord = {
      id: '1',
      word: 'test',
      definition: 'a test definition',
      etymology: 'test etymology',
      first_letter: 't',
      in_a_sentence: 'This is a test sentence.',
      number_of_letters: 4,
      equivalents: 'synonym1,synonym2' as unknown as string[],
      difficulty: 'Easy',
      created_at: '2023-01-01',
      updated_at: '2023-01-02'
    };

    const gameWord = mapDBWordToGameWord(dbWord);

    expect(gameWord.equivalents).toEqual([]);
  });
}); 