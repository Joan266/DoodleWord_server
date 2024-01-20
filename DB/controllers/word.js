import mongoose from 'mongoose';
import Word from '../schemas/word.js';
import Game from '../schemas/game.js';

export default {
  addWord: async (req, res) => {
    const { word } = req.body;
    // Check if word is missing
    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    try {
      const lowerCasedWord = word.toLowerCase(); // Fix typo in method name, and call the method
      const existingWord = await Word.findOne({ name: lowerCasedWord });

      if (!existingWord) {
        const newWord = new Word({ _id: new mongoose.Types.ObjectId(), name: lowerCasedWord });
        await newWord.save(); // Save the new word to the database
        res.status(200).json({ message: 'Word added successfully', newWord });
      } else {
        res.status(400).json({ error: 'Word already exists' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add word' });
    }
  },
  randomWords: async (req, res) => {
    const { num, gameId } = req.body;
    console.log(req.body);
    // Check if parameters are missing
    if (!num || !gameId) {
      return res.status(400).json({ error: 'Parameters are required' });
    }

    try {
      const game = await Game.findById(gameId);
      const { words: gameWords } = game;

      // Find random words that are not in the gameWords list
      const randomWords = await Word.aggregate([
        { $match: { name: { $nin: gameWords } } },
        { $sample: { size: parseInt(num) } },
      ]);

      res.status(200).json({ randomWords });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate random words' });
    }
  },
};
