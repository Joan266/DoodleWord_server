import registerBoardHandlers from './board.js';
import registerChatHandlers from './chat.js';
import registerGameHandlers from './game.js';
import userController from '../DB/controllers/user.js';
import roomController from '../DB/controllers/room.js';
import gameController from '../DB/controllers/game.js';

export const socketConnection = async (io) => {
  io.on("connection", (socket) => {
    socket.on('room:join', ({ code, user, roomId }) => {
      console.log(`${socket.id} listening to roomId: ${roomId} code:${code}`);
      socket.join(code);
      socket.to(code).emit("user:join", { user });

      registerBoardHandlers(socket, code);
      registerChatHandlers(socket, code, io);
      registerGameHandlers(socket, code, io);
      socket.on('appClosing', async () => {
        console.log(`the userId: ${user._id}`);
        io.to(code).emit("user:leave", { userId: user._id });
        const userId = user._id;
        await userController.deleteUser({ userId }, async (result) => {
          console.log(result.message);
        });
        await userController.artistDropOut({ userId, roomId }, async (result) => {
          console.log(result.message);
          if (result.success) {
            console.log(`appClosing artistDropOut result: ${result.data}`);
            io.to(code).emit("game_server:set_game_state", result.data);
          }
        });
        await userController.ownerDropOut({ userId, roomId }, async (result) => {
          console.log(result.message);
          if (result.success) {
            console.log(`appClosing ownerDropOut result: ${result.newOwner}`);
            io.to(code).emit("room_server:set_new_Owner", { newOwner: result.newOwner });
          }
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
