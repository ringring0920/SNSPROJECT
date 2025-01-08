import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './MessageForm.css';
import { Modal, Button, Navbar, Nav, Form, FormControl } from 'react-bootstrap';

const MessageForm = () => {
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showFeatureModal, setShowFeatureModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/api/messages');
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
                setErrorMessage('メッセージの取得中にエラーが発生しました。');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMessages();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imageFile) {
            setErrorMessage('メッセージまたは画像を入力してください。');
            return;
        }
        setErrorMessage('');
        const tempId = uuidv4();
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onloadend = () => {
                postMessage({ text, image: reader.result, _id: tempId });
            };
            reader.onerror = () => setErrorMessage('画像の読み込み中にエラーが発生しました。');
        } else {
            postMessage({ text, image: null, _id: tempId });
        }
    };

    const postMessage = async (message) => {
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/messages', {
                text: message.text,
                image: message.image,
            });
            setMessages((prevMessages) => [response.data, ...prevMessages]);
            resetForm();
            addNotification('新しいメッセージが追加されました！');
        } catch (error) {
            console.error('Error posting message:', error);
            setErrorMessage('メッセージ投稿中にエラーが発生しました。');
        } finally {
            setIsLoading(false);
        }
    };

    const addNotification = (message) => {
        const id = uuidv4();
        setNotifications((prev) => [...prev, { id, message }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter(notification => notification.id !== id));
        }, 2500);
    };

    const resetForm = () => {
        setText('');
        setImageFile(null);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/messages/${id}`);
            setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== id));
            setShowModal(false);
            addNotification('メッセージが削除されました');
        } catch (error) {
            console.error('Error deleting message:', error);
            setErrorMessage('メッセージ削除中にエラーが発生しました。');
        }
    };

    const openModal = (id) => {
        setDeleteId(id);
        setShowModal(true);
    };

    const filteredMessages = useMemo(
        () => messages.filter(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase())),
        [messages, searchTerm]
    );

    const handleHomeClick = () => {
        window.location.reload();
    };

    const handleFeatureClick = () => {
        setShowFeatureModal(true);
    };

    const handleContactClick = () => {
        window.open('/contact', '_blank');
    };

    return (
        <div className="container">
            <h1>INIAD-SNS</h1>
            <Navbar className="custom-navbar" bg="primary" expand="lg">
                    <Nav.Link onClick={handleFeatureClick}>機能</Nav.Link>
                    <Nav.Link onClick={handleHomeClick}>画面再読み込み</Nav.Link>
                    <Nav.Link onClick={handleContactClick}>お問い合わせ</Nav.Link>
                <Form className="d-flex">
                    <FormControl
                        type="search"
                        placeholder="検索"
                        className="me-2"
                        aria-label="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form>
            </Navbar>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
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
                <Button type="submit" className="btn btn-primary">送信</Button>
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
                        <div key={msg._id} className="message-item mb-2">
                            <p className="message-text">{msg.text}</p>
                            {msg.image && <img src={msg.image} alt="Uploaded" className="img-fluid message-image mb-2" />}
                            <Button variant="danger" onClick={() => openModal(msg._id)}>
                                削除
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            <div className="notifications">
                {notifications.map(note => (
                    <div key={note.id} className="alert alert-info">{note.message}</div>
                ))}
            </div>

            {/* 機能モーダル */}
            <Modal show={showFeatureModal} onHide={() => setShowFeatureModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>機能</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>これは機能表示のデモ画面です</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFeatureModal(false)}>
                        閉じる
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 削除確認モーダル */}
            <Modal show={showModal} onHide={() => setShowModal(false)} className="fade">
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