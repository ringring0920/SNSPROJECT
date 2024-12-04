const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const socketIo = require("socket.io");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS設定
const corsOptions = {
  origin: "http://localhost:3000", // ReactのURLを指定
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // 認証情報の送信を許可
};

app.use(cors(corsOptions)); // CORSミドルウェアを設定
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// MongoDBの接続
mongoose.connect("mongodb://127.0.0.1:27017/mydb")
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// メッセージ用のスキーマとモデル
const messageSchema = new mongoose.Schema({
  text: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

// HTTPサーバーの作成
const server = http.createServer(app);
const io = socketIo(server, { cors: corsOptions }); // Socket.IOのCORS設定

// Socket.IOでの接続処理
io.on("connection", (socket) => {
  console.log("A user connected");

  // メッセージを受信したときの処理
  socket.on("newMessage", (message) => {
    const newMessage = new Message(message);
    newMessage.save()
      .then(savedMessage => {
        io.emit("messageAdded", savedMessage);
      })
      .catch(error => {
        console.error("Error saving message:", error);
      });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// メッセージを投稿するAPIエンドポイント
app.post("/api/messages", async (req, res) => {
  const newMessage = new Message({
    text: req.body.text,
    image: req.body.image || null,
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "メッセージ投稿中にエラーが発生しました。" });
  }
});

// メッセージを取得するAPIエンドポイント
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "メッセージの取得中にエラーが発生しました。" });
  }
});

// サーバーを起動
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});