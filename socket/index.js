import registerBoardHandlers from './board.js';
import registerChatHandlers from './chat.js';
import registerGameHandlers from './game.js';
import userController from '../DB/controllers/user.js';
import roomController from '../DB/controllers/room.js';

export const socketConnection = async (io) => {
  io.on("connection", (socket) => {
    socket.on('room:join', ({ code, user, roomId }) => {
      console.log(`${socket.id} listening to roomId: ${roomId} code:${code}`);
      socket.join(code);
      socket.to(code).emit("user:join", { user });

      registerBoardHandlers(socket, code);
      registerChatHandlers(socket, code, io);
      registerGameHandlers(socket, code, io);
      socket.on('appClosing', () => {
        console.log(`the userId: ${user._id}`);
        io.to(code).emit("user:leave", { userId: user._id });
        const userId = user._id;
        userController.deleteUser({ userId, roomId }, (result) => {
          console.log(result.message);
        });
      });
    });
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
  io.of("/").adapter.on("delete-room", (room) => {
    if (/^[A-Z0-9]{6}$/.test(room)) {
      console.log(`room ${room} has been deleted`);
      roomController.deleteRoom({ roomCode: room }, (result) => {
        console.log(result.message);
      });
    }
  });
};
