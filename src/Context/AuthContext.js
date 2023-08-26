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

  // const [connectionRef, setConnectionRef] = useState() 
  const connectionRef = useRef() 

  // Listen to Auth State  
  useEffect(() => { 
    auth.onAuthStateChanged((user) => { 
      if (user) { 
        // Add a new connection reference for the user's connection
        const userConnectionRef = push(ref(dbRef.current, 'users/' + user.uid + '/connections'));
        // setConnectionRef(userConnectionRef)
        connectionRef.current = userConnectionRef
        set(userConnectionRef, true);
        onDisconnect(userConnectionRef).remove();
        setUserData(user)
      } 
      else {
        console.log('Auth State: NO USER')
        console.log('connection Ref')
        console.log(connectionRef)
        setUserData(null)
      }
    });
    //needs cleanup ???
  }, [ auth ]); //need this dep?

  return (
    <AuthContext.Provider value={{auth, userData, setUserData, connectionRef, 
    // setConnectionRef
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)