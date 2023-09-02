import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { getAuth } from "firebase/auth";
import { getDatabase, set, ref, push, onDisconnect } from 'firebase/database';

// Create a context for the auth state
const AuthContext = createContext();

// Create a provider component for the auth context
export const AuthProvider = ({ children }) => {

  const auth = getAuth();
  const dbRef = useRef(getDatabase()); 
  const [userData, setUserData] = useState(null);
  const connectionRef = useRef() 

  // Listen to Auth State  
  useEffect(() => { 
    const cleanup = auth.onAuthStateChanged((user) => { 
      if (user) { 
        // Add a new connection reference for each client under current user
        const userConnectionDbRef = push(ref(dbRef.current, 'users/' + user.uid + '/connections'));
        connectionRef.current = userConnectionDbRef
        set(userConnectionDbRef, true);
        onDisconnect(userConnectionDbRef).remove();
        setUserData(user)
      } 
      else {
        console.log('Auth State: NO USER')
        setUserData(null)
      }
      return cleanup
    });
  }, [ auth ]); 

  return (
    <AuthContext.Provider value={{ auth, userData, setUserData, connectionRef, dbRef }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = ()=>useContext(AuthContext)