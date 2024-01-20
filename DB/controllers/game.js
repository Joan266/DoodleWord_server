import Game from '../schemas/game.js';
import Room from '../schemas/room.js';

export default {
  startGame: async (roomId, callback) => {
    try {
      // Get the users from the room
      const room = await Room.findById(roomId);
      const { users } = room;
      if (users.length < 2) {
        callback({
          success: false,
          message: 'Users number too low to play',
        });
        return;
      }
      const game = await Game.findOne({ room: roomId });

      game.artists = users;
      game.scores = [];
      game.round = 1;
      game.phase = 1;
      // Save the game
      await game.save();
      const nextArtistId = game.artists[0];
      callback({
        success: true,
        message: 'Game started successfully',
        data: { round: game.round, nextArtistId, phase: game.phase },
      });
    } catch (error) {
      console.error(error);
      callback({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  },
  addWordToGameList: async ({ word, gameId }, callback) => {
    try {
      const game = await Game.findById(gameId);

      if (!game) {
        return callback({
          success: false,
          message: 'Game not found.',
        });
      }

      if (game.phase !== 1) {
        return callback({
          success: false,
          message: 'The game has to be in phase 1 when adding a word for phase 2.',
        });
      }

      game.words = [...game.words, word];
      game.phase = 2;
      await game.save();
      console.log(game);

      callback({
        success: true,
        message: 'Word added successfully',
      });
    } catch (error) {
      console.error(error);
      callback({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  },
  userScored: async ({ userId, gameId }, callback) => {
    try {
      // Use Game.findOne instead of Game.findById to properly check for existence
      const game = await Game.findOne({ _id: gameId });

      // Check if the game exists
      if (!game) {
        callback({
          success: false,
          message: 'Game not found',
        });
        return;
      }

      // Check if the user has already scored
      const hasUserScored = game.scores.includes(userId);
      if (hasUserScored) {
        callback({
          success: false,
          message: 'User already scored',
        });
        return;
      }

      // Add user to scores array
      game.scores.push(userId);

      // Save the updated game
      await game.save();

      // Get the index of the user's score in the scores array
      const scoreIndex = game.scores.indexOf(userId);
      const score = game.artists.length - scoreIndex;
      // Respond with success message
      callback({
        success: true,
        message: 'User added to the scores array',
        score,
      });
    } catch (error) {
      console.error(error);

      // Respond with error message
      callback({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  },
  isNextArtist: async ({ gameId, artistId }, callback) => {
    try {
      const game = await Game.findById(gameId);
      const artistIndex = game.artists.indexOf(artistId);
      console.log(game);
      console.log(`artistId:${artistId}, artistIndex:${artistIndex}`);
      if (artistIndex === -1) {
        callback({
          success: false,
          message: 'Current artist not found in the artists game array.',
        });
        return;
      }
      game.scores = [];
      await game.save();
      if (artistIndex === game.artists.length - 1) {
        if (game.round === game.total_rounds) {
          game.phase = 0;
          game.round = 1;
          await game.save();
          callback({
            success: true,
            message: 'No more artists left to play in the last round. End of the game. Phase 0.',
            data: { round: game.round, phase: game.phase, nextArtistId: false },
          });
          return;
        }

        const nextArtistId = game.artists[0];
        game.round += 1;
        game.phase = 1;
        await game.save();

        callback({
          success: true,
          message: 'No more artists left to play in this round. Moving to the next round. Phase 1.',
          data: { round: game.round, phase: game.phase, nextArtistId },
        });
        return;
      }

      const nextArtistId = game.artists[artistIndex + 1];
      game.phase = 1;
      await game.save();
      callback({
        success: true,
        message: 'There is a next artist to play.Phase 1.',
        data: { round: game.round, phase: game.phase, nextArtistId },
      });
    } catch (error) {
      console.error(error);
      callback({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  },
};
