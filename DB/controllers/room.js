import mongoose from 'mongoose';
import Room from '../schemas/room.js';
import User from '../schemas/user.js';
import Game from '../schemas/game.js';

function getRandomColor() {
  const colors = [
    // Pastel versions
    "#FFC0CB", "#98FB98", "#ADD8E6", "#FFDAB9", "#DB7093", "#00FF7F",
    "#FF6347", "#FFEC8B", "#C1FFC1", "#00CED1", "#E6E6FA", "#FF69B4",
    // Darker versions
    "#800000", "#008000", "#000080", "#FF4500", "#4B0082", "#006400",
    "#FF4500", "#DAA520", "#556B2F", "#008B8B", "#4B0082", "#8A2BE2",
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

const generateRandomCode = () => {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
};

export default {
  createRoom: async (req, res) => {
    const { userName } = req.body;
    // Check if userName is missing
    if (!userName) {
      return res.status(400).json({ error: 'userName is required' });
    }
    try {
      // Generate a unique code for the room
      let code;
      const rooms = await Room.find();
      const codes = rooms ? rooms.map((room) => room.code) : [];
      do {
        code = generateRandomCode();
      } while (codes.includes(code));
      // Generate a random color for the user
      const color = getRandomColor();
      // Create a new Room
      const room = new Room({ _id: new mongoose.Types.ObjectId(), code });
      // Create a new User
      const owner = new User({ _id: new mongoose.Types.ObjectId(), name: userName, color });
      // Set the owner of the room to the created user
      room.owner = owner._id;
      // Add the user to the users array of the room
      room.users.push(owner._id);
      // Set the room for the user
      owner.room = room._id;
      const game = new Game({ _id: new mongoose.Types.ObjectId() });
      game.room = room._id;
      room.game = game._id;
      // Save the user and update the room
      await game.save();
      await owner.save();
      await room.save();
      res.status(200).json({
        room: { _id: room._id, code: room.code, owner: room.owner },
        user: { _id: owner._id, color: owner.color, name: owner.name },
        game: { _id: game._id },
        users: [{
          _id: owner._id,
          name: owner.name,
          color: owner.color,
        }],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create the room' });
    }
  },
  joinRoom: async (req, res) => {
    const { userName, roomCode } = req.body;
    // Check if userName is missing
    if (!userName) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (!roomCode) {
      return res.status(400).json({ error: 'Room code is required' });
    }
    try {
      // Check if the room exists
      const room = await Room.findOne({ code: roomCode });
      if (!room) {
        return res.status(400).json({ error: 'Unexisting room' });
      }
      // Create a new User
      const color = getRandomColor();

      const newUser = new User({ _id: new mongoose.Types.ObjectId(), name: userName, color });
      room.users.push(newUser._id);
      // Set the room for the newUser
      newUser.room = room._id;
      // Save the user
      await newUser.save();
      // Save the updated room
      await room.save();
      // Retrieve users details using populate
      const populatedRoom = await Room
        .findOne({ code: roomCode })
        .populate('users', '_id color name')
        .exec();
      res.status(200).json({
        room: { _id: room._id, code: room.code, owner: room.owner },
        game: { _id: room.game },
        user: { _id: newUser._id, color: newUser.color, name: newUser.name },
        users: populatedRoom.users,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Not able to join the room' });
    }
  },
  deleteRoom: async ({ roomCode }, callback) => {
    try {
      if (!roomCode) {
        return callback({ success: false, message: 'Room code is required' });
      }
      // Check if the room exists
      const room = await Room.findOne({ code: roomCode });
      if (!room) {
        return callback({ success: false, message: 'Unexisting room' });
      }
      // Use Promise.all to run multiple asynchronous operations concurrently
      const [deletedGame, deletedRoom] = await Promise.all([
        Game.findByIdAndDelete(room.game),
        Room.findByIdAndDelete(room._id),
      ]);
      // Check if both deletion operations were successful
      if (deletedGame && deletedRoom) {
        callback({ success: true, message: 'Room deleted successfully' });
      } else {
        callback({ success: false, message: 'Failed to delete the room' });
      }
    } catch (error) {
      callback({ success: false, message: `Error deleting room: ${error.message}` });
      throw new Error('Failed to delete room');
    }
  },
};
