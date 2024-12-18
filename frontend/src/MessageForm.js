import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './MessageForm.css';
import { Modal, Button } from 'react-bootstrap';

const MessageForm = () => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);


  // メッセージを取得
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("https://snsproject-920e79757d01.herokuapp.com/api/messages");
        setMessages(response.data);
        setErrorMessage('');
      } catch (error) {
        console.error('Error fetching messages:', error);
        setErrorMessage('メッセージの取得中にエラーが発生しました。');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [baseURL]);

  // フォーム送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) {
      alert('メッセージまたは画像を入力してください。');
      return;
    }

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

  // メッセージ投稿処理
  const postMessage = async (message) => {
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);

    try {
      const response = await axios.post("https://snsproject-920e79757d01.herokuapp.com/api/messages", {
        text: message.text,
        image: message.image,
      });

      console.log("Server Response:", JSON.stringify(response.data, null, 2));

      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === message._id ? response.data : msg))
      );

      resetForm();
    } catch (error) {
      console.error('Error posting message:', error);
      alert('メッセージ投稿中にエラーが発生しました。');

      // エラーが発生した場合は一時的に追加したメッセージを削除
      setMessages(updatedMessages.filter((msg) => msg._id !== message._id));
    }
  };

  // フォームリセット
  const resetForm = () => {
    setText('');
    setImageFile(null);
  };

  // メッセージ削除処理
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://snsproject-920e79757d01.herokuapp.com/api/messages${id}`);
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== id));
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting message:', error.response ? error.response.data : error.message);
      alert(`メッセージ削除中にエラーが発生しました: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  // モーダルを開く
  function openModal(id) {
    setDeleteId(id);
    setShowModal(true);
  }

  return (
    <div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}

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

      {isLoading ? (
        <p>読み込み中...</p>
      ) : (
        <div className="message-list">
          {messages.map((msg) => (
            <div key={msg._id} className="message-item">
              <p>{msg.text}</p>
              <Button variant="danger" onClick={() => openModal(msg._id)}>
                削除
              </Button>
            </div>
          ))}
        </div>
      )}

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