import React, { useState, useEffect, createContext, useContext } from 'react';
import { getAuth } from "firebase/auth";

// Create a context for the auth state
const AuthContext = createContext();

// Create a provider component for the auth context
export const AuthProvider = ({ children }) => {
  
  const auth = getAuth();

  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User: ')
        console.log(user) 
        setUser(user);
      } else {
        console.log('Logged Out');
        setUser(null);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{user, setUser}}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)