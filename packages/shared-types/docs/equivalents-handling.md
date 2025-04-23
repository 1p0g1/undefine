# Equivalents Property Handling Policy

## Background

The `equivalents` property represents synonyms or related words in the application. Historically, there have been inconsistencies in how this property is stored in the database and how it's used in the application, leading to runtime errors.

## Database vs. Application Types

- **Database Type**: `string[] | null` (in `DBWord`)
- **Application Type**: `string[]` (in `GameWord`)

## Policy

### ✅ All mappers MUST:

1. **Normalize DB shape to app shape**:
   - Convert `string[] | null` to `string[]`
   - Never allow `null` or `undefined` to propagate to the application layer

2. **Use the centralized utility function**:
   - Always use `normalizeEquivalents()` from `utils/word.ts`
   - Never implement custom splitting logic in mappers or services

3. **Handle all possible DB shapes**:
   - `undefined` → `[]`
   - `null` → `[]`
   - `string` → Split by comma and filter empty strings
   - `string[]` → Use as is

### 🚫 Never:

1. Assume DB values are correctly shaped for frontend consumption
2. Use `.split()` directly on potentially non-string values
3. Allow ambiguous handling of the `equivalents` property

## Implementation

```typescript
// ✅ CORRECT: Use the centralized utility function
import { normalizeEquivalents } from '../utils/word';

function mapDBWordToGameWord(dbWord: DBWord): GameWord {
  return {
    // ...
    equivalents: normalizeEquivalents(dbWord.equivalents),
    // ...
  };
}

// ❌ INCORRECT: Don't implement custom splitting logic
function mapDBWordToGameWord(dbWord: DBWord): GameWord {
  return {
    // ...
    equivalents: dbWord.equivalents ? dbWord.equivalents.split(',') : [],
    // ...
  };
}
```

## Testing

All mappers that handle the `equivalents` property should include tests for:

1. Valid string array input
2. Null input
3. Undefined input
4. String input (comma-separated)
5. Other non-array types

## Enforcement

This policy should be enforced through:

1. Code reviews
2. Automated tests
3. Linting rules (where possible)
4. Documentation

## References

- `normalizeEquivalents()` utility function in `utils/word.ts`
- Mapper tests in `utils/__tests__/mappers.test.ts`
- Word utility tests in `utils/__tests__/word.test.ts` 