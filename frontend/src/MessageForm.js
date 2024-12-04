import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid'; // 一時ID用

const socket = io('http://localhost:5000'); // サーバーのURLに接続

const MessageForm = () => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null); // 画像ファイルを保持するための状態
  const [messages, setMessages] = useState([]);

  // メッセージを取得する関数
  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/messages');
      setMessages(response.data); // メッセージの状態を更新
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // コンポーネントがマウントされたときにメッセージを取得
  useEffect(() => {
    fetchMessages();

    // 新しいメッセージを受信するためのリスナーを追加
    socket.on('messageAdded', (newMessage) => {
      setMessages((prevMessages) => {
        // 重複防止：IDで確認
        const exists = prevMessages.some((msg) => msg._id === newMessage._id);
        return exists ? prevMessages : [...prevMessages, newMessage];
      });
    });

    // クリーンアップ関数：リスナーの解除
    return () => {
      socket.off('messageAdded');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 一時IDを生成
    const tempId = uuidv4();

    // 画像ファイルをBase64に変換する
    if (imageFile) {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64data = reader.result;
        await postMessage({ text, image: base64data, _id: tempId });
      };
      reader.onerror = (error) => console.error('Error loading image:', error);
    } else {
      await postMessage({ text, image: null, _id: tempId });
    }
  };

  const postMessage = async (message) => {
    // 投稿直後に仮メッセージをローカルに追加
    setMessages((prevMessages) => [...prevMessages, message]);

    try {
      const response = await axios.post('http://localhost:5000/api/messages', {
        text: message.text,
        image: message.image,
      });

      // サーバーのメッセージデータに仮メッセージを置き換える
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === message._id ? response.data : msg
        )
      );
      setText('');
      setImageFile(null); // フォームをリセット
    } catch (error) {
      console.error('Error posting message:', error);
      alert('メッセージ投稿中にエラーが発生しました。');
      // 投稿失敗時に仮メッセージを削除
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== message._id)
      );
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
          {messages.map((msg) => (
            <li key={msg._id || msg.tempId}>
              <p>
                <strong>メッセージ:</strong> {msg.text}
              </p>
              {msg.image && (
                <img src={msg.image} alt="投稿された画像" width="100" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MessageForm;
