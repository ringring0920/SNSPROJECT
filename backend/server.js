// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' })); // JSONリクエストのサイズ制限を5MBに設定
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

const Message = mongoose.model("Message", messageSchema); // Messageモデルを定義

// メッセージを投稿するAPIエンドポイント
app.post("/api/messages", async (req, res) => {
  const newMessage = new Message({
    text: req.body.text,
    image: req.body.image || null, // 画像がない場合はnull
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "メッセージ投稿中にエラーが発生しました。" });
  }
});

// メッセージを取得するAPIエンドポイント (GETメソッド)
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find(); // すべてのメッセージを取得
    res.status(200).json(messages); // メッセージを返す
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "メッセージの取得中にエラーが発生しました。" });
  }
});

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});