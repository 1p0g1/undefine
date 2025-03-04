"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.words = void 0;
exports.getRandomWord = getRandomWord;
exports.words = [
    {
        "word": "apple",
        "partOfSpeech": "noun",
        "definition": "A round fruit with red or green skin and a whitish interior, typically eaten raw or used in cooking. (noun)",
        "alternateDefinition": "The tree (Malus domestica) that bears apples. (noun)"
    },
    {
        "word": "big",
        "partOfSpeech": "adjective",
        "synonyms": ["large", "huge", "great"],
        "definition": "Of considerable size, extent, or intensity. (adjective)",
        "alternateDefinition": "Of considerable importance or seriousness. (adjective)"
    },
    {
        "word": "run",
        "partOfSpeech": "verb,noun",
        "synonyms": ["jog", "sprint", "dash"],
        "definition": "To move swiftly on foot so that both feet leave the ground during each stride. (verb)",
        "alternateDefinition": "An act or instance of running. (noun)"
    },
    {
        "word": "happy",
        "partOfSpeech": "adjective",
        "synonyms": ["joyful", "cheerful", "content"],
        "definition": "Feeling or showing pleasure or contentment. (adjective)",
        "alternateDefinition": "Fortunate and convenient. (adjective)"
    },
    {
        "word": "dog",
        "partOfSpeech": "noun",
        "definition": "A domesticated carnivorous mammal (Canis familiaris) typically kept as a pet or for work. (noun)",
        "alternateDefinition": "To follow someone closely and persistently. (verb)"
    },
    {
        "word": "jump",
        "partOfSpeech": "verb",
        "definition": "To push oneself off a surface and into the air by using the muscles in one's legs and feet. (verb)",
        "alternateDefinition": "An act of jumping from a surface. (noun)"
    },
    {
        "word": "quick",
        "partOfSpeech": "adjective",
        "synonyms": ["fast", "speedy", "swift"],
        "definition": "Moving fast or doing something in a short time. (adjective)",
        "alternateDefinition": "Prompt to understand, think, or learn. (adjective)"
    },
    {
        "word": "blue",
        "partOfSpeech": "adjective",
        "definition": "Of a color intermediate between green and violet, as of the sky or sea on a sunny day. (adjective)",
        "alternateDefinition": "Melancholy, sad, or depressed. (adjective)"
    },
    {
        "word": "smile",
        "partOfSpeech": "noun",
        "definition": "To form one's features into a pleased, kind, or amused expression, typically with the corners of the mouth turned up. (verb)",
        "alternateDefinition": "A pleased, kind, or amused facial expression. (noun)"
    },
    {
        "word": "rain",
        "partOfSpeech": "noun",
        "definition": "Moisture condensed from the atmosphere that falls visibly in separate drops. (noun)",
        "alternateDefinition": "To fall as rain. (verb)"
    },
    {
        "word": "cat",
        "partOfSpeech": "noun",
        "definition": "A small domesticated carnivorous mammal with soft fur, a short snout, and retractile claws, kept as a pet or for catching mice. (noun)",
        "alternateDefinition": "A wild animal of the cat family. (noun)"
    },
    {
        "word": "light",
        "partOfSpeech": "adjective,noun,verb",
        "synonyms": ["bright", "shiny", "luminous"],
        "definition": "The natural agent that stimulates sight and makes things visible. (noun)",
        "alternateDefinition": "Having little weight; not heavy. (adjective)"
    },
    {
        "word": "slow",
        "partOfSpeech": "adjective",
        "definition": "Moving or operating at a low speed; not quick or fast. (adjective)",
        "alternateDefinition": "To reduce one's speed or the speed of something. (verb)"
    },
    {
        "word": "tree",
        "partOfSpeech": "noun",
        "definition": "A perennial plant with an elongated stem, or trunk, supporting branches and leaves. (noun)",
        "alternateDefinition": "To chase someone up a tree. (verb)"
    },
    {
        "word": "strong",
        "partOfSpeech": "adjective",
        "synonyms": ["powerful", "mighty", "tough"],
        "definition": "Having great physical power and ability. (adjective)",
        "alternateDefinition": "Not easily disturbed, upset, or affected. (adjective)"
    },
    {
        "word": "fast",
        "partOfSpeech": "adjective,adverb,verb",
        "definition": "Moving or capable of moving at high speed. (adjective)",
        "alternateDefinition": "To abstain from all or some kinds of food or drink, especially as a religious observance. (verb)"
    },
    {
        "word": "kind",
        "partOfSpeech": "adjective,noun",
        "synonyms": ["caring", "nice", "compassionate"],
        "definition": "A group of people or things having similar characteristics. (noun)",
        "alternateDefinition": "Having or showing a friendly, generous, and considerate nature. (adjective)"
    },
    {
        "word": "bright",
        "partOfSpeech": "adjective",
        "definition": "Emitting or reflecting a lot of light; shining. (adjective)",
        "alternateDefinition": "Intelligent and quick-witted. (adjective)"
    },
    {
        "word": "deep",
        "partOfSpeech": "adjective,adverb,noun",
        "synonyms": ["profound", "low", "serious"],
        "definition": "Extending far down from the top or surface. (adjective)",
        "alternateDefinition": "Profound or intense in quality or emotion. (adjective)"
    },
    {
        "word": "red",
        "partOfSpeech": "adjective",
        "definition": "Of a color at the end of the spectrum next to orange and opposite violet; resembling the color of blood. (adjective)",
        "alternateDefinition": "A color at the end of the spectrum next to orange and opposite violet. (noun)"
    }
];
function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * exports.words.length);
    return exports.words[randomIndex];
}
