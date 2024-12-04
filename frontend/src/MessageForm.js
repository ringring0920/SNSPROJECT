// frontend/src/MessageForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // サーバーのURLに接続

const MessageForm = () => {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [messages, setMessages] = useState([]);

  // メッセージを取得する関数
  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/messages');
      setMessages(response.data); // メッセージの状態を更新
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // コンポーネントがマウントされたときにメッセージを取得
  useEffect(() => {
    fetchMessages();

    // 新しいメッセージを受信するためのリスナーを追加
    socket.on("messageAdded", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]); // 新しいメッセージを追加
    });

    // クリーンアップ関数：リスナーの解除
    return () => {
      socket.off("messageAdded");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let base64data = null;
    if (imageFile) {
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
    const newMessage = { text, image }; // 新しいメッセージオブジェクトを作成

    try {
      // サーバーにメッセージをまず送信
      await axios.post('http://localhost:5000/api/messages', newMessage);
      // Socket.IOを使って新しいメッセージをイベントで送信
      socket.emit("newMessage", newMessage);
      setText("");
      setImageFile(null); // フォームをクリア
      alert("メッセージが投稿されました！");
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
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
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