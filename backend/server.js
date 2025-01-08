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
app.use(express.json()); // リクエストボディをパースするミドルウェア

// MongoDB接続
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mydb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// メッセージスキーマとモデル
const messageSchema = new mongoose.Schema({
  text: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

//暴言検知用リスト
const badWords = ['死ね', '殺す', 'dead']; // 実際の暴言単語を追加

// 伏字にする
// 暴言を伏字に変換する関数
function censorBadWords(text) {
  let censoredText = text;
  badWords.forEach((word) => {
    const regex = new RegExp(word, 'gi'); // 大文字小文字を区別しない
    censoredText = censoredText.replace(regex, '****'); // 伏字に変換
  });
  return censoredText;
}

// 新しいメッセージを投稿
app.post("/api/messages", async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text) {
      return res.status(400).json({ message: "メッセージが必要です。" });
    }

    const censoredText = censorBadWords(text); // 暴言を伏字に変換

    const newMessage = new Message({
      text: censoredText, // 伏字に変換されたテキスト
      image: image || null,
    });

    const savedMessage = await newMessage.save();
    
    // 伏字に変換されたかどうかをフロントに通知
    const isCensored = censoredText !== text;

    res.status(201).json({
      savedMessage,
      isCensored, // 伏字が変換された場合は true
    });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "メッセージ投稿中にエラーが発生しました。" });
  }
});

// メッセージを取得（最新順）
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }); // 最新順
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "メッセージの取得中にエラーが発生しました。" });
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
      res.status(404).json({ message: "指定されたメッセージが見つかりません。" });
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "メッセージ削除中にエラーが発生しました。" });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});