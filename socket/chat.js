export default async (socket, code, io) => {
  const chatMessage = async (data) => {
    io.to(code).emit('chat_server:add_message', data);
  };
  socket.on('chat_client:add_message', chatMessage);
};
