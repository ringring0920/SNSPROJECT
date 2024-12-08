// src/App.js
import React from 'react';
import { SocketProvider } from './components/SocketProvider'; // 追加: SocketProviderをインポート
import MessageForm from './MessageForm'; // もともとのMessageFormをここでインポート

const App = () => {
  return (
    <SocketProvider>  {/* SocketProviderでラップ */}
      <div>
        <h1>SNSアプリ</h1>
        <MessageForm />
      </div>
    </SocketProvider>
  );
};

export default App;