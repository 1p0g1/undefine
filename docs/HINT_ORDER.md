# Hint Order Documentation

## Overview
This document describes the order in which hints are revealed to players in the word-guessing game. The hint order is a crucial part of the game mechanics, providing players with progressive assistance while maintaining challenge and engagement.

## Hint Types
The game uses six types of hints, revealed in a specific order:

1. **Definition (D)** - Always revealed first
   - Basic meaning of the word
   - Always available from the start of the game

2. **Etymology (E)**
   - Origin and history of the word
   - Revealed after the first incorrect guess

3. **First Letter (F)**
   - The first letter of the word
   - Revealed after two incorrect guesses

4. **In a Sentence (I)**
   - Example usage in context
   - Revealed after three incorrect guesses

5. **Number of Letters (N)**
   - Word length
   - Revealed after four incorrect guesses

6. **Equivalents/Synonyms (E2)**
   - Similar words or synonyms
   - Revealed after five incorrect guesses

## Implementation Details

### Constants
The hint order is defined in `client/src/types/index.ts` using the `HINT_INDICES` constant:

```typescript
export const HINT_INDICES: Record<ClueType, number> = {
  D: 0,  // Definition (always revealed)
  E: 1,  // Etymology
  F: 2,  // First Letter
  I: 3,  // In a Sentence
  N: 4,  // Number of Letters
  E2: 5, // Equivalents/Synonyms
};
```

### Components Using Hint Order
- `HintContent.tsx`: Renders hints based on which ones are revealed
- `DefineBoxes.tsx`: Displays the "DEFINE" boxes with the correct order
- `useHintRevealer.ts`: Hook that manages hint revelation logic

### Type Safety
The hint order is enforced through:
- TypeScript types and interfaces
- Runtime assertions in debug mode
- Comprehensive test suite in `tests/hint-order.test.ts`

## Best Practices
When working with hints:
1. Always use the `HINT_INDICES` constant for hint order
2. Check if a hint exists before trying to display it
3. Use type guards to ensure hint data integrity
4. Follow the established order for consistency

## Testing
The hint order is verified through automated tests that ensure:
- Correct sequence of indices
- Presence of all required hint types
- Uniqueness of hint indices
- Sequential ordering from 0 to 5

## Future Considerations
When modifying the hint system:
1. Update all components that use `HINT_INDICES`
2. Maintain type safety and runtime checks
3. Update tests to reflect any changes
4. Keep documentation in sync with implementation 