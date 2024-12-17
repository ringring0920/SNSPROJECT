# group5-team4-snsproject

cd backend
node server.js
cd frontend
npm start


memo:
<App.css>

/*メッセージ枠と送信ボタンの距離*/
.message-list {
  margin-top: 30px;
}

/* メッセージ枠　内部*/
.message-item {
  margin-bottom: 15px;
  padding: 10px;
  border: 7px solid #fffdfd;
  border-radius: 27px; /*角の丸み*/
  background-color: #ffffff;
  transition: transform 0.3s; 
}


/*メッセージ枠のホバー*/
.message-item:hover {
  transform: translateY(-15px); 
}






<Messageform.css>

/* 選択されていません */
body {
  font-family: 'Arial', sans-serif;
  background-color: #ffffff; 
  color: #ffffff;
  transition: background-color 0.3s, color 0.3s;
}

/* INIAD-SNS */
h1 {
  text-align: center;
  color: #ffffff;
  margin-top: 20px;
  font-size: 2.7em;
  font-weight: bold;
}

/*内枠*/
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background-color: #000000; 
  border-radius: 10px;
  transition: box-shadow 0.6s;
}

/*モーダル操作部分*/
.modal-header {
  background-color: #ff0000; 
  border-bottom: 6px solid #000000; 
}

.modal-title {
  font-weight: bold; 
  font-size: 1.5rem; 
}

.modal-body {
  font-size: 20px; 
  font-weight: bold; 
  color: #000000;
}

.modal-footer {
  justify-content: flex-end; 
}

.custom-modal .modal-header {
  border: none; 
  position: relative; 
  padding: 16px; 
}

.custom-modal .modal-title {
  margin-left: 10px; 
}

.close-button {
  font-size: 40px; 
  color: #000;
  cursor: pointer; 
  position: absolute; 
  right: 25px; 
  top: 5px; 
}

.modal-footer {
  display: flex; 
  justify-content: space-between; 
  width: 100%; 
}

.footer-button {
  flex: 1; 
  margin: 0 5px;
}

.footer-button:nth-child(1) {
  align-self: center; 
}

.footer-button:nth-child(2) {
  align-self: center; 
}