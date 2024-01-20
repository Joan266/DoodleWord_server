import User from '../schemas/user.js';

export default {
  deleteUser: async (userId, callback) => {
    try {
      const deletedUser = await User.findByIdAndDelete(userId);

      if (deletedUser) {
        callback({ success: true, message: `User with ID ${userId} deleted successfully` });
      } else {
        callback({ success: false, message: `User with ID ${userId} not found` });
      }
    } catch (error) {
      callback({ success: false, message: `Error deleting user: ${error.message}` });
      throw new Error('Failed to delete user');
    }
  },
};
