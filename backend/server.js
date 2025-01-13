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

// ChatGPT APIを呼び出す関数
async function analyzeMessage(text) {
  try {
    const response = await axios.post('https://api.openai.iniad.org/api/v1/chat/completions', {
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `以下の文に不適切な表現が含まれているかどうか、またその内容を指摘してください: "${text}"`
        }
      ],
      max_tokens: 100,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const inappropriateContent = response.data.choices[0].message.content;
    return inappropriateContent ? inappropriateContent.split(",").map(word => word.trim()) : [];
  } catch (error) {
    console.error("ChatGPT API エラー:", error);
    return [];
  }
}

// テキストを伏字にする関数
function censorText(text, inappropriateWords) {
  let censoredText = text;

  inappropriateWords.forEach(word => {
    const regex = new RegExp(word, 'gi'); // 大文字小文字を区別しない
    censoredText = censoredText.replace(regex, '****');
  });

  return censoredText;
}

app.post("/api/messages", async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text) {
      return res.status(400).json({ message: "メッセージが必要です。" });
    }

    const inappropriateWords = await analyzeMessage(text);
    const isInappropriate = inappropriateWords.length > 0;

    const censoredText = isInappropriate ? censorText(text, inappropriateWords) : text;

    const newMessage = new Message({
      text: censoredText,
      image: image || null,
    });

    const savedMessage = await newMessage.save();

    const feedbackMessage = isInappropriate ? `注意: 不適切な表現が含まれていました。` : null;

    res.status(201).json({
      savedMessage,
      feedbackMessage // 注意メッセージを返す
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