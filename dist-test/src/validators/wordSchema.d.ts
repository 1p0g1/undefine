import { z } from 'zod';
export declare const WordSchema: z.ZodObject<{
    id: z.ZodString;
    word: z.ZodString;
    definition: z.ZodString;
    etymology: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    first_letter: z.ZodString;
    in_a_sentence: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    number_of_letters: z.ZodNumber;
    equivalents: z.ZodDefault<z.ZodUnion<[z.ZodArray<z.ZodString, "many">, z.ZodEffects<z.ZodString, string[], string>, z.ZodEffects<z.ZodNull, never[], null>]>>;
    difficulty: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    word: string;
    definition: string;
    etymology: string;
    first_letter: string;
    in_a_sentence: string;
    number_of_letters: number;
    equivalents: string[] | never[];
    difficulty: string;
    date?: string | null | undefined;
}, {
    id: string;
    word: string;
    definition: string;
    first_letter: string;
    number_of_letters: number;
    etymology?: string | undefined;
    in_a_sentence?: string | undefined;
    equivalents?: string | string[] | null | undefined;
    difficulty?: string | undefined;
    date?: string | null | undefined;
}>;
export type Word = z.infer<typeof WordSchema>;
export declare function validateWord(word: unknown): {
    valid: boolean;
    word?: Word;
    error?: string;
};
export declare function validateUUID(id: string): boolean;
//# sourceMappingURL=wordSchema.d.ts.map