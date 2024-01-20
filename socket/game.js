import gameController from '../DB/controllers/game.js';

function wordIndicesGenerator(wordName) {
  // Convert the word into an array of characters
  const letters = wordName.split('');

  // Calculate the number of letters to replace (30% of the length)
  const numOfWordIndices = Math.ceil(0.3 * letters.length);

  // Generate an array of indices to replace without duplicates
  const wordIndices = [];

  while (wordIndices.length < numOfWordIndices) {
    const randomIndex = Math.floor(Math.random() * letters.length);

    // Check if the index is not already in the array
    if (!wordIndices.includes(randomIndex)) {
      wordIndices.push(randomIndex);
    }
  }

  return wordIndices;
}

export default async (socket, code, io) => {
  const startGame = async (data) => {
    const { roomId } = data;
    console.log(`game_client:start_game, roomId: ${roomId}`);
    gameController.startGame(roomId, (result) => {
      console.log(result.message);
      if (result.success) {
        console.log(`game_client:start_game result: ${result.data}`);
        io.to(code).emit("game_server:set_game_state", result.data);
      }
    });
  };
  const startPhase2 = async (data) => {
    const { word, gameId } = data;
    console.log(`game_client:start_phase_2, wordName: ${word.name}, gameId:${gameId}`);
    gameController.addWordToGameList({ word, gameId }, (result) => {
      console.log(result.message);
      if (result.success) {
        const wordIndices = wordIndicesGenerator(word.name);
        io.to(code).emit("game_server:start_phase_2", { word, wordIndices });
      }
    });
  };
  const endPhase2 = async (data) => {
    const { artistId, gameId } = data;
    console.log(`game_client:end_phase_2`);
    gameController.isNextArtist({ gameId, artistId }, (result) => {
      console.log(result.message);
      if (result.success) {
        console.log(`game_client:end_phase_2 result: ${result.data}`);
        io.to(code).emit("game_server:set_game_state", result.data);
      }
    });
  };
  const userScored = async (data) => {
    const { userId, gameId } = data;
    console.log(`game_client:user_scored, userId:${userId}`);
    gameController.userScored({ userId, gameId }, (result) => {
      console.log(result.message);
      if (result.success) {
        console.log(`game_client:user_scored score result: ${result.score}`);
        io.to(code).emit("game_server:user_scored", { score: result.score, userId });
      }
    });
  };
  socket.on('game_client:start_game', startGame);
  socket.on('game_client:start_phase_2', startPhase2);
  socket.on('game_client:end_phase_2', endPhase2);
  socket.on('game_client:user_scored', userScored);
};
