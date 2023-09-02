import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';

//Firebase
import { initializeApp } from "firebase/app";
import { getApps } from 'firebase/app';

import { AuthProvider } from './Context/AuthContext';

// import { getAnalytics } from "firebase/analytics";


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBgjL9jAiJhZJPiCI_ds3hNXNDgSFyC1rU",
  authDomain: "singularity-b84a7.firebaseapp.com",
  databaseURL: "https://quickstories-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "singularity-b84a7",
  storageBucket: "singularity-b84a7.appspot.com",
  messagingSenderId: "1072099022457",
  appId: "1:1072099022457:web:0ba7aefd2589192e3ae6a8",
  measurementId: "G-2Y7J79KDJN"
};



// Initialize Firebase
initializeApp(firebaseConfig);
const firebaseApp = getApps()[0];
// const analytics = getAnalytics(firebaseApp);

//render React App
ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
