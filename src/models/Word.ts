import { Schema, model, Document, Model } from 'mongoose';

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

interface IWordMethods {
  markAsUsed(): Promise<void>;
}

type WordDocument = Document<unknown, {}, IWord> & IWord & IWordMethods;

interface WordModel extends Model<IWord, {}, IWordMethods> {}

const wordSchema = new Schema<IWord, WordModel, IWordMethods>({
  word: { type: String, required: true, unique: true },
  partOfSpeech: { type: String, required: true },
  definition: { type: String, required: true },
  example: { type: String },
  synonyms: [{ type: String }],
  antonyms: [{ type: String }],
  difficulty: { type: Number, default: 1 },
  lastUsedDate: { type: Date },
  timesUsed: { type: Number, default: 0 }
});

// Create text indexes for search functionality
wordSchema.index({ word: 'text', definition: 'text' });

// Add method to mark word as used
wordSchema.methods.markAsUsed = async function(this: WordDocument) {
  this.timesUsed = (this.timesUsed || 0) + 1;
  this.lastUsedDate = new Date();
  await this.save();
};

export const Word = model<IWord, WordModel>('Word', wordSchema);

export default Word; 