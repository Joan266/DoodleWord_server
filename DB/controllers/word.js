import mongoose from 'mongoose';
import Word from '../schemas/word.js';
import Game from '../schemas/game.js';
// import randomWordsEs from 'random-words-es';
// Function to generate and log 300 random words
// function generateRandomWords(num) {
//   const wordsArray = randomWordsEs({ exactly: num });

//   // Log each word
//   wordsArray.forEach((word, index) => {
//     console.log(`Word ${index + 1}: ${word}`);
//   });
// }
export default {
  addWord: async (word) => {
    // Check if word is missing
    if (!word) {
      return;
    }
    try {
      const lowerCasedWord = word.toLowerCase(); // Fix typo in method name, and call the method
      const existingWord = await Word.findOne({ name: lowerCasedWord });

      if (!existingWord) {
        const newWord = new Word({ _id: new mongoose.Types.ObjectId(), name: lowerCasedWord });
        await newWord.save(); // Save the new word to the database
        console.log('Word added successfully');
      } else {
        console.log('Word already exists');
      }
    } catch (error) {
      console.error(error);
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
  async cleanDatabase() {
    try {
      // Clean the "words" collection
      await Word.aggregate([
        {
          $match: {
            $and: [
              { name: { $not: /s$/ } }, // Does not end with 's'
              { $expr: { $lt: [{ $strLenCP: "$name" }, 30] } }, // Length less than 30
            ],
          },
        },
        {
          $out: "words", // Replace the existing "words" collection with the filtered documents
        },
      ]).exec();

      console.log('Database cleaned successfully.');
    } catch (error) {
      console.error('Error cleaning database:', error);
    }
  },
};
