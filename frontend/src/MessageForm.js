import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './MessageForm.css';
import { Modal, Button, Navbar, Nav, Form, FormControl } from 'react-bootstrap';

const MessageForm = () => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showBulkDeleteConfirmModal, setShowBulkDeleteConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  const fetchMessages = () => {
    setIsLoading(true);
    const dummyMessages = [
      { _id: uuidv4(), text: 'ようこそ！', image: null },
      { _id: uuidv4(), text: 'INIAD SNSへ！', image: null },
    ];
    setMessages(dummyMessages);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setNotificationVisible(true);
    setTimeout(() => {
      setNotificationVisible(false);
      setNotification('');
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) {
      showNotification('メッセージまたは画像を入力してください。');
      return;
    }

    const tempId = uuidv4();
    const message = { text, image: imageFile ? URL.createObjectURL(imageFile) : null, _id: tempId };

    setMessages((prevMessages) => [message, ...prevMessages]);
    resetForm();
    showNotification('メッセージの送信に成功しました。');
  };

  const resetForm = () => {
    setText('');
    setImageFile(null);
  };

  const handleDelete = (id) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== id));
    showNotification('メッセージが削除されました。');
    setShowDeleteConfirmModal(false);
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirmModal(true);
  };

  const confirmBulkDelete = () => {
    setMessages((prevMessages) => prevMessages.filter((msg) => !selectedMessages[msg._id]));
    showNotification('選択したメッセージが削除されました。');
    setSelectedMessages({});
    setShowBulkDeleteConfirmModal(false);
  };

  const openDeleteConfirmModal = (id) => {
    setDeleteId(id);
    setShowDeleteConfirmModal(true);
  };

  const openEditModal = (msg) => {
    setEditingMessage(msg);
    setText(msg.text);
    setImageFile(null); // 画像は保持しない
    setShowEditModal(true);
  };

  const confirmEdit = () => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg._id === editingMessage._id ? { ...msg, text } : msg))
    );
    showNotification('メッセージの変更が完了しました。');
    setShowEditModal(false);
    resetForm();
  };

  const filteredMessages = useMemo(
    () => messages.filter(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase())),
    [messages, searchTerm]
  );

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setShowDeleteConfirmModal(false);
    setShowBulkDeleteConfirmModal(false);
    setShowEditModal(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCloseModal();
    }
  };

  const toggleMessageSelection = (id) => {
    setSelectedMessages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="container">
      <h1></h1>
      <Navbar className="custom-navbar" bg="primary" expand="lg">
        <Nav.Link onClick={() => setShowFeatureModal(true)}>機能</Nav.Link>
        <Nav.Link onClick={() => window.location.reload()}>再読み込み</Nav.Link>
        <Nav.Link onClick={() => window.open('/contact', '_blank')}>お問い合わせ</Nav.Link>
        <Form className="d-flex">
          <FormControl
            type="search"
            placeholder="検索"
            className="me-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form>
      </Navbar>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力"
          className="form-control mb-2"
        />
        <input
          type="file"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="form-control mb-2"
        />
        <div className="d-flex justify-content-between">
          <Button type="submit" className="btn btn-primary">送信</Button>
          <Button type="button" className="btn btn-danger ms-2" onClick={handleBulkDelete}>
            選択したメッセージを削除
          </Button>
        </div>
      </form>
      {isLoading ? (
        <div className="text-center mt-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>読み込み中...</p>
        </div>
      ) : (
        <div className="message-list mt-3">
          {filteredMessages.map((msg) => (
            <div 
              key={msg._id} 
              className="message-item mb-2 d-flex justify-content-between align-items-center" 
              onClick={() => toggleMessageSelection(msg._id)} // 全体をクリック可能に
              style={{ cursor: 'pointer' }} // カーソルをポインターに
            >
              <div className="message-content d-flex align-items-center">
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={!!selectedMessages[msg._id]}
                  onChange={() => toggleMessageSelection(msg._id)} // チェックボックスの選択状態を変更
                />
                <span className="message-text">{msg.text}</span>
                {msg.image && <img src={msg.image} alt="Uploaded" className="img-fluid message-image mb-2" />}
              </div>
              <div className="message-actions">
                <Button variant="warning" onClick={() => openEditModal(msg)} className="me-2">編集</Button>
                <Button variant="danger" onClick={() => openDeleteConfirmModal(msg._id)}>削除</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 通知エリア */}
      {notificationVisible && (
        <div className="notification">
          {notification}
        </div>
      )}

      {/* 成功モーダル */}
      <Modal show={showSuccessModal} onHide={handleCloseModal} onKeyDown={handleKeyDown}>
        <Modal.Header closeButton>
          <Modal.Title>成功</Modal.Title>
        </Modal.Header>
        <Modal.Body>{notification}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>閉じる</Button>
        </Modal.Footer>
      </Modal>

      {/* メッセージ削除確認モーダル */}
      <Modal show={showDeleteConfirmModal} onHide={handleCloseModal} onKeyDown={handleKeyDown}>
        <Modal.Header closeButton>
          <Modal.Title>メッセージ削除確認</Modal.Title>
        </Modal.Header>
        <Modal.Body>このメッセージを削除してもよろしいですか？</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>キャンセル</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteId)}>削除</Button>
        </Modal.Footer>
      </Modal>

      {/* 一括削除確認モーダル */}
      <Modal show={showBulkDeleteConfirmModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>一括削除確認</Modal.Title>
        </Modal.Header>
        <Modal.Body>選択したメッセージを削除してもよろしいですか？</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>キャンセル</Button>
          <Button variant="danger" onClick={confirmBulkDelete}>削除</Button>
        </Modal.Footer>
      </Modal>

      {/* メッセージ編集モーダル */}
      <Modal show={showEditModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>メッセージ編集</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="form-control"
            rows={5}
          />
          <Button onClick={confirmEdit} className="btn btn-primary mt-2">変更を保存</Button>
        </Modal.Body>
      </Modal>

      {/* 機能モーダル */}
      <Modal show={showFeatureModal} onHide={() => setShowFeatureModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>機能</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>これは機能表示のデモ画面です</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeatureModal(false)}>閉じる</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MessageForm;