const express = require('express');
const http = require('http'); 

const app = express();
const server = http.createServer(app);

// JSONのリクエストボディを解析するミドルウェアを追加
app.use(express.json());

// 基本的なGETリクエストのハンドラーを追加
app.get('/', (req, res) => {
  res.send('Welcome to the Express server without Socket.IO!');
});

// メッセージを送信するためのPOSTリクエストのハンドラーを追加
app.post('/api/messages', (req, res) => {
  const { message } = req.body;
  console.log('Received message:', message);
  res.status(200).json({ status: 'success', message: 'Message received' });
});

// サーバーを指定のポートでリッスン
server.listen(5000, () => {
  console.log('listening on *:5000');
});