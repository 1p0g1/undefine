import { describe, it, expect } from 'vitest';
import { normalizeEquivalents } from '../word.js';

describe('normalizeEquivalents', () => {
  it('should return the array if equivalents is already a string array', () => {
    const equivalents = ['synonym1', 'synonym2'];
    expect(normalizeEquivalents(equivalents)).toEqual(['synonym1', 'synonym2']);
  });

  it('should split a comma-separated string into an array', () => {
    const equivalents = 'synonym1,synonym2';
    expect(normalizeEquivalents(equivalents)).toEqual(['synonym1', 'synonym2']);
  });

  it('should filter out empty strings from a comma-separated string', () => {
    const equivalents = 'synonym1,,synonym2,';
    expect(normalizeEquivalents(equivalents)).toEqual(['synonym1', 'synonym2']);
  });

  it('should return an empty array for null', () => {
    expect(normalizeEquivalents(null)).toEqual([]);
  });

  it('should return an empty array for undefined', () => {
    expect(normalizeEquivalents(undefined)).toEqual([]);
  });

  it('should return an empty array for non-string, non-array values', () => {
    expect(normalizeEquivalents(123)).toEqual([]);
    expect(normalizeEquivalents({})).toEqual([]);
    expect(normalizeEquivalents(true)).toEqual([]);
  });
}); 