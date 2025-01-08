const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// APIキーの確認
console.log("API Key:", process.env.OPENAI_API_KEY);

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mydb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const messageSchema = new mongoose.Schema({
  text: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

const badWords = ['死ね', '殺す', 'dead'];

function censorBadWords(text) {
  let censoredText = text;
  badWords.forEach((word) => {
    const regex = new RegExp(word, 'gi');
    censoredText = censoredText.replace(regex, '****');
  });
  return censoredText;
}

// ChatGPT APIを呼び出す関数
async function analyzeMessage(text) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4", // または使用したいモデルを設定
      messages: [
        {
          role: "user",
          content: `以下の文に含まれる不適切な表現を指摘してください: "${text}"`
        }
      ],
      max_tokens: 50,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("ChatGPT API エラー:", error);
    return null;
  }
}

app.post("/api/messages", async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text) {
      return res.status(400).json({ message: "メッセージが必要です。" });
    }

    const censoredText = censorBadWords(text);
    const inappropriateFeedback = await analyzeMessage(text);

    const newMessage = new Message({
      text: censoredText,
      image: image || null,
    });

    const savedMessage = await newMessage.save();
    
    const isCensored = censoredText !== text;

    res.status(201).json({
      savedMessage,
      isCensored,
      inappropriateFeedback // 指摘された不適切な表現を返す
    });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "メッセージ投稿中にエラーが発生しました。" });
  }
});

app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "メッセージの取得中にエラーが発生しました。" });
  }
});

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});