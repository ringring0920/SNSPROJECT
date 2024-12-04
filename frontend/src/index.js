import React from 'react';
import ReactDOM from 'react-dom/client'; // 修正: react-dom/client をインポート
import App from './App'; // Appコンポーネントをインポート
import reportWebVitals from './reportWebVitals';

// root要素を取得
const rootElement = document.getElementById('root');

// createRoot を使ってレンダリング
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Web Vitalsの計測
reportWebVitals();
