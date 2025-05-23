import { describe, it, expect } from 'vitest';
import { mapDBWordToGameWord } from '../mappers.js';
describe('mapDBWordToGameWord', () => {
    it('should map a valid DBWord to GameWord', () => {
        const dbWord = {
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
        const dbWord = {
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
        const gameWord = mapDBWordToGameWord(dbWord);
        expect(gameWord.equivalents).toEqual([]);
    });
    it('should handle null equivalents by returning an empty array', () => {
        const dbWord = {
            id: '1',
            word: 'test',
            definition: 'a test definition',
            etymology: 'test etymology',
            first_letter: 't',
            in_a_sentence: 'This is a test sentence.',
            number_of_letters: 4,
            equivalents: null,
            difficulty: 'Easy',
            created_at: '2023-01-01',
            updated_at: '2023-01-02'
        };
        const gameWord = mapDBWordToGameWord(dbWord);
        expect(gameWord.equivalents).toEqual([]);
    });
    it('should handle non-array equivalents by returning an empty array', () => {
        const dbWord = {
            id: '1',
            word: 'test',
            definition: 'a test definition',
            etymology: 'test etymology',
            first_letter: 't',
            in_a_sentence: 'This is a test sentence.',
            number_of_letters: 4,
            equivalents: 'synonym1,synonym2',
            difficulty: 'Easy',
            created_at: '2023-01-01',
            updated_at: '2023-01-02'
        };
        const gameWord = mapDBWordToGameWord(dbWord);
        expect(gameWord.equivalents).toEqual([]);
    });
});
//# sourceMappingURL=mappers.test.js.map