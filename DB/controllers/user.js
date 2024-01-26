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
      const room = await Room.findOne({ _id: roomId }).populate('game', 'artistId').exec();
      if (room) {
        callback({ success: true, message: `checking if ${userId} is artist in room ${room.game}` });
      }
      callback({ success: false, message: `Error room not existing.` });
    } catch (error) {
      callback({ success: false, message: `Error checking if user is Artist: ${error.message}` });
      throw new Error('Failed to delete user');
    }
  },
};
