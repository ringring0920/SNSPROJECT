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
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// MongoDB接続
mongoose.connect("mongodb://127.0.0.1:27017/mydb")
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// メッセージスキーマとモデル
const messageSchema = new mongoose.Schema({
  text: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

const server = http.createServer(app);
const io = socketIo(server, { cors: corsOptions });

// Socket.IOイベント
io.on("connection", (socket) => {
  console.log("A user connected");

  // 新しいメッセージの通知
  socket.on("newMessage", async (message) => {
    try {
      const newMessage = new Message(message);
      const savedMessage = await newMessage.save();
      io.emit("messageAdded", savedMessage); // 全てのクライアントに新しいメッセージを通知
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // メッセージ削除の通知
  socket.on("deleteMessage", async (id) => {
    try {
      const deletedMessage = await Message.findByIdAndDelete(id);
      if (deletedMessage) {
        io.emit("messageDeleted", id); // 全てのクライアントに削除通知
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// メッセージAPIエンドポイント
app.post("/api/messages", async (req, res) => {
  try {
    const newMessage = new Message({
      text: req.body.text,
      image: req.body.image || null,
    });
    const savedMessage = await newMessage.save();
    io.emit("messageAdded", savedMessage); // API経由で追加されたメッセージも通知
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "メッセージ投稿中にエラーが発生しました。" });
  }
});

app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "メッセージの取得中にエラーが発生しました。" });
  }
});

// メッセージ削除APIエンドポイント
app.delete("/api/messages/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedMessage = await Message.findByIdAndDelete(id);
    if (deletedMessage) {
      io.emit("messageDeleted", id); // API経由で削除されたメッセージも通知
      res.status(200).json({ message: "メッセージが削除されました。" });
    } else {
      res.status(404).json({ message: "指定されたメッセージが見つかりません。" });
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "メッセージ削除中にエラーが発生しました。" });
  }
});

// サーバー起動
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
