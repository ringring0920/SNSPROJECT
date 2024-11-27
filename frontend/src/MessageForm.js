// frontend/src/MessageForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MessageForm = () => {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null); // 画像ファイルを保持するための状態
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/messages');
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 画像ファイルをBase64に変換する
    let base64data = null;
    if (imageFile) { // 画像ファイルが選択されている場合のみ
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        base64data = reader.result; // Base64データを保存
        await postMessage(base64data); // メッセージを送信
      };
      reader.onerror = (error) => {
        console.error("Error loading image:", error);
      };
    } else {
      await postMessage(); // 画像なしでメッセージを送信
    }
  };

  const postMessage = async (image = null) => {
    const newMessage = { text, image }; // 画像を追加（なしの場合はnull）

    try {
      await axios.post('http://localhost:5000/api/messages', newMessage);
      setText("");
      setImageFile(null); // 入力をクリア
      alert("メッセージが投稿されました！");
      fetchMessages(); // 投稿後にメッセージを再取得
    } catch (error) {
      console.error("Error posting message:", error);
      alert("メッセージ投稿中にエラーが発生しました。");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力"
          required
        />
        <input
          type="file" // ここでファイル選択の入力を追加
          accept="image/*" // 画像ファイルのみを選択
          onChange={(e) => setImageFile(e.target.files[0])} // ファイルをstateに保存
        />
        <button type="submit">投稿</button>
      </form>

      <div>
        <h2>投稿されたメッセージ</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <p><strong>メッセージ:</strong> {msg.text}</p>
              {msg.image && <img src={msg.image} alt="投稿された画像" width="100" />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MessageForm;