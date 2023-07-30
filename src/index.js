import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

//Firebase
import { initializeApp } from "firebase/app";
import { getApps } from 'firebase/app';



// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBzw3g21pF-6zluwehcH9BSphmh6vpcpR8",
  authDomain: "singularity-b84a7.firebaseapp.com",
  databaseURL: "https://quickstories-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "singularity-b84a7",
  storageBucket: "singularity-b84a7.appspot.com",
  messagingSenderId: "1072099022457",
  appId: "1:1072099022457:web:0ba7aefd2589192e3ae6a8",
  measurementId: "G-2Y7J79KDJN"
};

//why have all these details changed?

// const firebaseConfig = {
//   apiKey: "AIzaSyBgjL9jAiJhZJPiCI_ds3hNXNDgSFyC1rU",
//   authDomain: "quickstories-60609.firebaseapp.com",
//   databaseURL: "https://quickstories-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "quickstories",
//   storageBucket: "quickstories.appspot.com",
//   messagingSenderId: "687120219169",
//   appId: "1:687120219169:web:ac9f5a1dca3abeb6fff760"
// };


// Initialize Firebase
initializeApp(firebaseConfig);
const firebaseApp = getApps()[0];

//render React App
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
