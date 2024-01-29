import User from '../schemas/user.js';
import Room from '../schemas/room.js';

export default {
  artistDropOut: async ({ roomId, userId }, callback) => {
    try {
      const room = await Room.findById(roomId).populate('game').exec();
      if (!room || !room.game) {
        return callback({
          success: false,
          message: 'Fail to find user room',
        });
      }
      const { game } = room;
      if (game.phase === 0) {
        return callback({
          success: false,
          message: 'Phase 0.',
        });
      }
      const artistIndex = game.artists.indexOf(userId);
      if (artistIndex === -1) {
        return callback({
          success: false,
          message: 'ArtistDropOut not found in the artists game array.',
        });
      }
      game.artists.pull(userId);
      await game.save();
      if (game.artists.length < 2) {
        game.scores = [];
        game.phase = 0;
        game.round = 1;
        await game.save();
        return callback({
          success: true,
          message: 'Just one player left no end of the game.',
          data: { round: game.round, phase: game.phase, nextArtistId: false },
        });
      }
      if (userId === game.artistId) {
        game.scores = [];
        if (artistIndex === game.artists.length) {
          if (game.round === game.total_rounds) {
            game.phase = 0;
            game.round = 1;
            await game.save();
            return callback({
              success: true,
              message: 'No more artists left to play in the last round. End of the game. Phase 0.',
              data: { round: game.round, phase: game.phase, nextArtistId: false },
            });
          }
          const nextArtistId = game.artists[0];
          game.round += 1;
          game.phase = 1;
          game.artistId = nextArtistId;
          await game.save();

          return callback({
            success: true,
            message: 'No more artists left to play in this round. Moving to the next round. Phase 1.',
            data: { round: game.round, phase: game.phase, nextArtistId },
          });
        }

        const nextArtistId = game.artists[artistIndex];
        game.artistId = nextArtistId;
        game.phase = 1;
        await game.save();
        return callback({
          success: true,
          message: 'There is a next artist to play.Phase 1.',
          data: { round: game.round, phase: game.phase, nextArtistId },
        });
      }
      callback({
        success: false,
        message: 'User is not an artistDropOut',
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
  deleteUser: async ({ userId }, callback) => {
    try {
      const deletedUser = await User.findByIdAndDelete(userId);
      if (!deletedUser) {
        return callback({
          success: false,
          message: 'Fail to delete user',
        });
      }
      callback({
        success: true,
        message: 'User deleted successfully.',
      });
    } catch (error) {
      callback({
        success: false,
        message: `Error deleting user: ${error.message}`,
      });
      throw new Error('Failed to delete user');
    }
  },
  ownerDropOut: async ({ userId, roomId }, callback) => {
    const room = await Room.findById(roomId).populate('owner').exec();
    if (!room) {
      return callback({
        success: false,
        message: 'Room not found',
      });
    }
    room.users.pull(userId);
    await room.save();
    if (room.users.length === 0) {
      return callback({
        success: false,
        message: 'No need for new owner.',
      });
    }
    if (!room.owner || room.owner._id === userId) {
      const randomUser = room.users[Math.floor(Math.random() * room.users.length)];
      room.owner = randomUser;
      await room.save();
      return callback({
        success: true,
        message: 'New owner selected',
        newOwner: randomUser,
      });
    }
    callback({
      success: false,
      message: 'No need to promote user to owner.',
    });
  },
};
