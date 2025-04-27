import { HINT_INDICES } from '../client/src/types/index';
import { WordData } from "@undefine/shared-types";

describe('Hint Order Tests', () => {
  test('HINT_INDICES should have the correct order', () => {
    expect(HINT_INDICES.D).toBe(0);  // Definition (always revealed)
    expect(HINT_INDICES.E).toBe(1);  // Etymology
    expect(HINT_INDICES.F).toBe(2);  // First Letter
    expect(HINT_INDICES.I).toBe(3);  // In a Sentence
    expect(HINT_INDICES.N).toBe(4);  // Number of Letters
    expect(HINT_INDICES.E2).toBe(5); // Equivalents/Synonyms
  });

  test('HINT_INDICES should have all required hint types', () => {
    const expectedHints = ['D', 'E', 'F', 'I', 'N', 'E2'];
    const actualHints = Object.keys(HINT_INDICES);
    expect(actualHints.sort()).toEqual(expectedHints.sort());
  });

  test('HINT_INDICES values should be unique', () => {
    const values = Object.values(HINT_INDICES);
    const uniqueValues = new Set(values);
    expect(values.length).toBe(uniqueValues.size);
  });

  test('HINT_INDICES values should be sequential from 0 to 5', () => {
    const values = Object.values(HINT_INDICES);
    const expectedValues = [0, 1, 2, 3, 4, 5];
    expect(values.sort()).toEqual(expectedValues);
  });
}); 