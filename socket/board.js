export default async (socket, code) => {
  const boardDrawing = (data) => {
    socket.to(code).emit('board_server:add_buffer_points', data);
  };
  const cleanCanvas = () => {
    socket.to(code).emit('board_server:clean_canvas');
  };
  socket.on('board_client:add_buffer_points', boardDrawing);
  socket.on('board_client:clean_canvas', cleanCanvas);
};
