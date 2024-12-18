import React from 'react';
import MessageForm from './MessageForm'; // MessageFormには投稿機能を実装します。
import './App.css';

const App = () => {
  return (
    <div className="container">
      <h1>INIAD-SNS</h1>
      <MessageForm /> {/* MessageFormはPOSTリクエストを送信するようにします */}
    </div>
  );
};

export default App;