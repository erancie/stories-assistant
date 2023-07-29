import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

//Firebase
import { initializeApp } from "firebase/app";
import { getApps } from 'firebase/app';

// import { getDatabase, ref, onValue, off } from 'firebase/database';

// import 'firebase/database';


//Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBzw3g21pF-6zluwehcH9BSphmh6vpcpR8",
  authDomain: "singularity-b84a7.firebaseapp.com",
  projectId: "singularity-b84a7",
  storageBucket: "singularity-b84a7.appspot.com",
  messagingSenderId: "1072099022457",
  appId: "1:1072099022457:web:0ba7aefd2589192e3ae6a8",
  measurementId: "G-2Y7J79KDJN"
};


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
