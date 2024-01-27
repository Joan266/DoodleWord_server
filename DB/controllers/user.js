import User from '../schemas/user.js';
import Room from '../schemas/room.js';

export default {
  deleteUser: async ({ userId, roomId }, callback) => {
    try {
      const deletedUser = await User.findByIdAndDelete(userId);

      if (deletedUser) {
        const roomUpdate = await Room.findByIdAndUpdate(roomId, { $pull: { users: userId } });
        if (roomUpdate) {
          callback({ success: true, message: `User with ID ${userId} deleted successfully` });
        } else {
          callback({ success: false, message: `Failed to update room users array` });
        }
      } else {
        callback({ success: false, message: `User with ID ${userId} not found` });
      }
    } catch (error) {
      callback({ success: false, message: `Error deleting user: ${error.message}` });
      throw new Error('Failed to delete user');
    }
  },
  isUserArtist: async ({ userId, roomId }, callback) => {
    try {
      const room = await Room.findOne({ _id: roomId }).populate('game', 'artistId _id').exec();

      if (!room || !room.game || !room.game.artistId) {
        return callback({ success: false, message: 'No artistId found in the game.' });
      }

      const { artistId, _id } = room.game;

      if (artistId === userId) {
        return callback({
          success: true,
          message: `userId ${userId} and artistId ${artistId} match`,
          gameId: _id,
          artistId,
        });
      }

      callback({
        success: false,
        message: `userId ${userId} and artistId ${artistId} don't match`,
      });
    } catch (error) {
      callback({
        success: false,
        message: `Error checking if user is Artist: ${error.message}`,
      });
    }
  },
};
