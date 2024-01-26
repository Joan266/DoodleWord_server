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
};
