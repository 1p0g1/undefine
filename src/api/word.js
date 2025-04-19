import { SupabaseClient } from '../config/database/SupabaseClient.js';
const db = SupabaseClient.getInstance();
export async function handler(req, res) {
    try {
        // Get a random word
        const word = await db.getRandomWord();
        if (!word) {
            console.error('Failed to fetch word');
            return res.status(500).json({ error: 'Failed to fetch valid word' });
        }
        // Start new game session
        const session = await db.startGame();
        if (!session) {
            console.error('Failed to create game session');
            return res.status(500).json({ error: 'Failed to create game session' });
        }
        // Return flat response structure expected by frontend
        return res.status(200).json({
            gameId: session.id,
            word: word.word,
            definition: word.definition,
            clues: {
                D: word.definition,
                E: word.etymology || 'No etymology available',
                F: word.first_letter || '',
                I: word.in_a_sentence || 'No example sentence available',
                N: word.number_of_letters || 0,
                E2: word.equivalents || []
            }
        });
    }
    catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
