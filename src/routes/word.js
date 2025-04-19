import { Router } from 'express';
import { WordService } from '../services/WordService.js';
import { getDb } from '../config/database/db.js';
const router = Router();
// Get a word for the game
router.get('/api/word', async (req, res) => {
    try {
        const db = getDb();
        const wordData = await db.getRandomWord();
        if (!wordData) {
            console.error('No word found in database');
            return res.status(500).json({ error: 'No word found' });
        }
        // Log the raw word data for debugging
        console.log('Raw word data:', {
            id: wordData.id,
            word: wordData.word,
            hasDefinition: !!wordData.definition,
            hasEtymology: !!wordData.etymology,
            hasFirstLetter: !!wordData.first_letter,
            hasInSentence: !!wordData.in_a_sentence,
            hasEquivalents: !!wordData.equivalents,
            equivalentsType: typeof wordData.equivalents
        });
        // Create a new game session
        const session = await db.startGame();
        if (!session) {
            console.error('Failed to create game session');
            return res.status(500).json({ error: 'Failed to create game session' });
        }
        // Transform snake_case API data to camelCase game format
        const transformedWord = {
            id: wordData.id,
            word: wordData.word,
            definition: wordData.definition,
            etymology: wordData.etymology || '',
            firstLetter: wordData.first_letter,
            inASentence: wordData.in_a_sentence || '',
            numberOfLetters: wordData.number_of_letters,
            equivalents: Array.isArray(wordData.equivalents) ? wordData.equivalents : wordData.equivalents?.split(',').map((s) => s.trim()) || [],
            difficulty: wordData.difficulty
        };
        // Log the transformed word data for debugging
        console.log('Transformed word data:', {
            id: transformedWord.id,
            word: transformedWord.word,
            hasDefinition: !!transformedWord.definition,
            hasEtymology: !!transformedWord.etymology,
            hasFirstLetter: !!transformedWord.firstLetter,
            hasInASentence: !!transformedWord.inASentence,
            hasEquivalents: !!transformedWord.equivalents,
            equivalentsLength: transformedWord.equivalents.length
        });
        // Transform word data into clues format for frontend
        const wordResponse = {
            gameId: session.id,
            word: {
                id: transformedWord.id,
                word: transformedWord.word,
                clues: {
                    D: transformedWord.definition || 'No definition available',
                    E: transformedWord.etymology || 'No etymology available',
                    F: transformedWord.firstLetter || transformedWord.word[0].toLowerCase(),
                    I: transformedWord.inASentence || 'No example sentence available',
                    N: transformedWord.numberOfLetters || transformedWord.word.length,
                    E2: transformedWord.equivalents
                }
            }
        };
        // Log the final response for debugging
        console.log('Response data:', {
            gameId: wordResponse.gameId,
            wordId: wordResponse.word.id,
            hasClues: {
                D: !!wordResponse.word.clues.D,
                E: !!wordResponse.word.clues.E,
                F: !!wordResponse.word.clues.F,
                I: !!wordResponse.word.clues.I,
                N: !!wordResponse.word.clues.N,
                E2: Array.isArray(wordResponse.word.clues.E2) && wordResponse.word.clues.E2.length
            }
        });
        // Log exact response structure
        console.log('Full response structure:', JSON.stringify(wordResponse, null, 2));
        return res.status(200).json(wordResponse);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Failed to fetch word:', errorMessage);
        return res.status(500).json({ error: 'Failed to fetch word', details: errorMessage });
    }
});
// Get a random word
router.get('/random', async (req, res) => {
    try {
        const word = await WordService.getRandomWord();
        res.json(word);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get random word' });
    }
});
// Get today's word
router.get('/daily', async (req, res) => {
    try {
        const word = await WordService.getDailyWord();
        res.json(word);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get daily word' });
    }
});
// Admin routes
router.post('/add', async (req, res) => {
    try {
        const word = await WordService.addWord(req.body);
        res.json(word);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add word' });
    }
});
export { router as wordRouter };
