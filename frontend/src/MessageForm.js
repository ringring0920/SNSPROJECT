import React, { useState, useEffect } from 'react';
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

  // メッセージを取得するダミー関数
  const fetchMessages = () => {
    setIsLoading(true);
    // モックとしてダミーメッセージを設定
    const dummyMessages = [
      { _id: uuidv4(), text: '最初のメッセージ', image: null },
      { _id: uuidv4(), text: '二番目のメッセージ', image: null },
    ];
    setMessages(dummyMessages);
    setErrorMessage('');
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // フォーム送信処理
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) {
      alert('メッセージまたは画像を入力してください。');
      return;
    }

    const tempId = uuidv4();
    const message = { text, image: imageFile ? URL.createObjectURL(imageFile) : null, _id: tempId };

    // ここでメッセージを追加
    setMessages((prevMessages) => [...prevMessages, message]);
    resetForm();
  };

  // フォームリセット
  const resetForm = () => {
    setText('');
    setImageFile(null);
  };

  // メッセージ削除処理
  const handleDelete = (id) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== id));
    setShowModal(false);
  };

  // モーダルを開く
  const openModal = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

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
              {msg.image && <img src={msg.image} alt="Uploaded" />}
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