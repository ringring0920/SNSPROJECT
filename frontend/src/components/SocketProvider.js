 // src/components/SocketProvider.js
 import React, { createContext, useContext, useEffect, useState } from 'react';
 import { io } from 'socket.io-client';

 const SocketContext = createContext();

 export const SocketProvider = ({ children }) => {
   const [socket, setSocket] = useState(null);

   useEffect(() => {
     const socketIo = io('http://localhost:3000'); // Socket.IOサーバーのURL
     setSocket(socketIo);

     return () => {
       socketIo.disconnect();
     };
   }, []);

   return (
     <SocketContext.Provider value={socket}>
       {children}
     </SocketContext.Provider>
   );
 };

 export const useSocket = () => {
   return useContext(SocketContext);
 };
 