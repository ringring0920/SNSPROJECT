const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('send_message', (msg) => {
    io.emit('receive_message', msg); // すべてのクライアントにメッセージを送信
  });
});

// サーバーを指定のポートでリッスン
server.listen(5000, () => {
  console.log('listening on *:5000');
});