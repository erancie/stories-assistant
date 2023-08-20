import React, { useEffect, useState, useRef } from 'react'
import {} from 'dotenv/config';
import { set, getDatabase, ref, push, onDisconnect } from 'firebase/database';
import { getAuth } from "firebase/auth";

import { CliveStateProvider } from './Context/CliveStateContext';
import { AuthProvider, useAuth } from './Context/AuthContext';

import Profile from './Components/Profile';
import Session from './Components/Session';
import Walkthrough from './Components/Walkthrough';
import UsersMenu from './Components/UsersMenu';
import SessionsMenu from './Components/SessionsMenu';
import Header from './Components/Header';

export default function App() {

  const sessionElRef = useRef(); 
  const dbRef = useRef(getDatabase()); 
  const auth = getAuth();
  // const { user : userData, setUser : setUserData} = useAuth() //fix
  
  const [userOwnedSessions, setUserOwnedSessions] = useState()
  const [currentSession, setCurrentSession] = useState() 
  const [userData, setUserData] = useState()


  const [connectionRef, setConnectionRef] = useState() 


  // Listen to Auth State    // put this in useContext
  useEffect(() => { 
    auth.onAuthStateChanged((user) => { 
      if (user) { 
        // Add a new connection reference for the user's connection
        const userConnectionRef = push(ref(dbRef.current, 'users/' + user.uid + '/connections'));
        setConnectionRef(userConnectionRef)
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
  }, []);

  return (
    <CliveStateProvider>
      <AuthProvider>
        <div className="App ">   

          <Walkthrough />

          <div className='container position-relative'>

            <Header />

            <Profile auth={auth} 
                     userData={userData} 
                     setUserData={setUserData} 
                     connectionRef={connectionRef} 
                     setConnectionRef={setConnectionRef} />

            <UsersMenu />

            <SessionsMenu auth={auth} 
                          userData={userData} 
                          setCurrentSession={setCurrentSession} 
                          userOwnedSessions={userOwnedSessions}
                          setUserOwnedSessions={setUserOwnedSessions} 
                          sessionElRef={sessionElRef} />

            <Session userData={userData} 
                     currentSession={currentSession}
                     setCurrentSession={setCurrentSession} 
                     userOwnedSessions={userOwnedSessions} 
                     sessionElRef={sessionElRef}/>
                     {/* ref={sessionElRef}/> */}
          </div>

        </div>
      </AuthProvider>
    </CliveStateProvider>

  )
}

