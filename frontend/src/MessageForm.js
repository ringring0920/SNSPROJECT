import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import './MessageForm.css';
import { Modal, Button } from 'react-bootstrap';

const socket = io('https://snsproject-920e79757d01.herokuapp.com/');

const MessageForm = () => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('https://snsproject-920e79757d01.herokuapp.com/api/messages');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        alert('メッセージの取得中にエラーが発生しました。');
      }
    };

    fetchMessages();
    socket.on('messageAdded', (newMessage) => {
      setMessages((prevMessages) => {
        const exists = prevMessages.some((msg) => msg._id === newMessage._id);
        return exists ? prevMessages : [...prevMessages, newMessage];
      });
    });

    return () => {
      socket.off('messageAdded');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempId = uuidv4();

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


  const postMessage = async (message) => {
    // 一時的にメッセージを追加
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
  
    try {
      const response = await axios.post('https://snsproject-920e79757d01.herokuapp.com/api/messages', {
        text: message.text,
        image: message.image,
      });
  
      console.log("Server Response:", JSON.stringify(response.data, null, 2));
  
      // サーバーからのレスポンスでメッセージを更新
      setMessages((prevMessages) => 
        prevMessages.map((msg) => (msg._id === message._id ? response.data : msg))
      );
  
      // Socket.IOを使用してメッセージを送信
      if (socket) {
        socket.emit('newMessage', response.data);
      }
  
      resetForm();
    } catch (error) {
      console.error('Error posting message:', error);
      alert('メッセージ投稿中にエラーが発生しました。');
  
      // エラーが発生した場合は一時的に追加したメッセージを削除
      setMessages(updatedMessages.filter((msg) => msg._id !== message._id));
    }
  };

  const resetForm = () => {
    setText('');
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://snsproject-920e79757d01.herokuapp.com/api/messages/${id}`);
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== id));
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting message:', error.response ? error.response.data : error.message);
      alert(`メッセージ削除中にエラーが発生しました: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  function openModal(id) {
    setDeleteId(id);
    setShowModal(true);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力"
        />
        <input
          type="file"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <Button type="submit">送信</Button>
      </form>
      <div className="message-list">
  {messages.slice().reverse().map((msg) => (
    <div key={msg._id} className="message-item">
      <p>{msg.text}</p>
      <Button variant="danger" onClick={() => openModal(msg._id)}>
        削除
      </Button>
    </div>
  ))}
</div>
      <Modal show={showModal} onHide={() => setShowModal(false)} className="custom-modal">
  <Modal.Header>
    <span className="close-button" onClick={() => setShowModal(false)}>&times;</span>
    <Modal.Title>メッセージ削除確認</Modal.Title>
  </Modal.Header>
  <Modal.Body>このメッセージを削除してもよろしいですか？</Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)} className="footer-button">
      キャンセル
    </Button>
    <Button variant="danger" onClick={() => handleDelete(deleteId)} className="footer-button">
      削除
    </Button>
  </Modal.Footer>
</Modal>
    </div>
  );
};

export default MessageForm;