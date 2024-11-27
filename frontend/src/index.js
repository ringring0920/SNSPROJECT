import React from 'react';
   import ReactDOM from 'react-dom';
   import App from './App'; // Appコンポーネントをインポート
   import reportWebVitals from './reportWebVitals';

   ReactDOM.render(
     <React.StrictMode>
       <App />  // Appコンポーネントのレンダリング
     </React.StrictMode>,
     document.getElementById('root') // root要素にマウント
   );

   reportWebVitals();