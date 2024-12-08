import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid'; // 仮ID用
import './MessageForm.css'; 

const socket = io('http://localhost:5000'); // Socket.IOサーバに接続

const MessageForm = () => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [messages, setMessages] = useState([]);

  // 初回レンダリング時のデータ取得とソケットリスナーの設定
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/messages');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        alert('メッセージの取得中にエラーが発生しました。');
      }
    };

    fetchMessages();

    // ソケットイベントリスナーの設定
    socket.on('messageAdded', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on('messageDeleted', (id) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== id)
      );
    });

    return () => {
      socket.off('messageAdded');
      socket.off('messageDeleted');
    };
  }, []);

  // メッセージ投稿
  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempId = uuidv4(); // 仮のIDを生成

    if (imageFile) {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = () => {
        postMessage({ text, image: reader.result, _id: tempId });
      };
      reader.onerror = () => alert('画像の読み込み中にエラーが発生しました。');
    } else {
      postMessage({ text, image: null, _id: tempId });
    }
  };

  // サーバーにメッセージを送信
  const postMessage = async (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);

    try {
      const response = await axios.post('http://localhost:5000/api/messages', {
        text: message.text,
        image: message.image,
      });

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === message._id ? response.data : msg
        )
      );
      socket.emit('messageAdded', response.data); // サーバーに新規メッセージを通知
      resetForm();
    } catch (error) {
      console.error('Error posting message:', error);
      alert('メッセージ投稿中にエラーが発生しました。');
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== message._id)
      );
    }
  };

  // メッセージ削除
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/messages/${id}`);
      socket.emit('messageDeleted', id); // サーバーに削除を通知
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== id)
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('メッセージ削除中にエラーが発生しました。');
    }
  };

  // フォームリセット
  const resetForm = () => {
    setText('');
    setImageFile(null);
  };

  return (
    <div className="message-form-container">
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力"
          required
          className="message-input"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="message-file-input"
        />
        <button type="submit" className="message-submit-button">
          投稿
        </button>
      </form>

      <div className="message-list">
        <h2>投稿されたメッセージ</h2>
        <ul>
          {[...messages].reverse().map((msg) => (
            <li key={msg._id || msg.tempId} className="message-item">
              <p className="message-text">
                <strong>メッセージ:</strong> {msg.text}
              </p>
              {msg.image && (
                <img
                  src={msg.image}
                  alt="投稿された画像"
                  className="message-image"
                />
              )}
              <button
                onClick={() => handleDelete(msg._id)}
                className="message-delete-button"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MessageForm;
