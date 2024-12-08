// src/components/YourComponent.js
import React, { useEffect } from 'react';
import { useSocket } from './SocketProvider';

const YourComponent = () => {
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('message', (data) => {
        console.log(data);
      });

      return () => {
        socket.off('message');
      };
    }
  }, [socket]);

  const sendMessage = () => {
    socket.emit('message', 'Hello, world!');
  };

  return (
    <div>
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
};

export default YourComponent;