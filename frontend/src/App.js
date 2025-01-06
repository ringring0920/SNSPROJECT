import React from 'react';
import { SocketProvider } from './components/SocketProvider';
import MessageForm from './MessageForm';
import './App.css';

const App = () => {
  return (
    <SocketProvider>
      <div className="container">
        <h1>INIAD-SNS</h1>
        <MessageForm />
      </div>
    </SocketProvider>
  );
};

export default App;