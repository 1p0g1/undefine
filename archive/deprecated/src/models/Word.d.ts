export interface IWord {
    word: string;
    partOfSpeech: string;
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
    difficulty?: number;
    lastUsedDate?: Date;
    timesUsed?: number;
}
export declare const Word: any;
export default Word;
