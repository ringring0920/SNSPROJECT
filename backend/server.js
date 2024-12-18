const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "http://localhost:3000", // 許可するオリジン
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 許可するHTTPメソッド
};

app.use(cors(corsOptions));
app.use(express.json()); // 追加: リクエストボディをパースするミドルウェア

// MongoDB接続
mongoose
  .connect("mongodb://127.0.0.1:27017/mydb")
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// メッセージスキーマとモデル
const messageSchema = new mongoose.Schema({
  text: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

// メッセージAPIエンドポイント

// 新しいメッセージを投稿
app.post("/api/messages", async (req, res) => {
  try {
    const newMessage = new Message({
      text: req.body.text,
      image: req.body.image || null,
    });
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res
      .status(500)
      .json({ message: "メッセージ投稿中にエラーが発生しました。" });
  }
});

// メッセージを取得（最新順）
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }); // 最新順
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "メッセージの取得中にエラーが発生しました。" });
  }
});

// メッセージを削除
app.delete("/api/messages/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedMessage = await Message.findByIdAndDelete(id);
    if (deletedMessage) {
      res.status(200).json({ message: "メッセージが削除されました。" });
    } else {
      res
        .status(404)
        .json({ message: "指定されたメッセージが見つかりません。" });
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    res
      .status(500)
      .json({ message: "メッセージ削除中にエラーが発生しました。" });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
