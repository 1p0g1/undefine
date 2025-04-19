import { Schema, model } from 'mongoose';
const wordSchema = new Schema({
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
wordSchema.methods.markAsUsed = async function () {
    this.timesUsed = (this.timesUsed || 0) + 1;
    this.lastUsedDate = new Date();
    await this.save();
};
export const Word = model('Word', wordSchema);
export default Word;
