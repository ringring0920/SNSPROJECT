import React from 'react';
   import MessageForm from './MessageForm';  // MessageFormをインポート

   const App = () => {
     return (
       <div>
         <h1>SNSアプリ</h1>
         <MessageForm />  // MessageFormコンポーネントを表示
       </div>
     );
   };

   export default App;