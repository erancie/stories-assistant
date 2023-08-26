import React, { useEffect, useState, useRef, useCallback } from 'react'
// import {} from 'dotenv/config';
import { set, getDatabase, ref, push, onDisconnect, update, child } from 'firebase/database';
import { getAuth } from "firebase/auth";

import { CliveStateProvider } from './Context/CliveStateContext';
import { useAuth } from './Context/AuthContext';

import Session from './Components/Session';
import Walkthrough from './Components/Walkthrough';
import UsersMenu from './Components/UsersMenu';
import SessionsMenu from './Components/SessionsMenu';
import Header from './Components/Header';
import AuthButtons from './Components/AuthButtons';

export default function App() {

  const sessionElRef = useRef(); 
  const dbRef = useRef(getDatabase()); 

  // const auth = getAuth();

  const { auth, userData, setUserData, connectionRef, setConnectionRef} = useAuth() //fix
  
  const [userOwnedSessions, setUserOwnedSessions] = useState()
  const [currentSession, setCurrentSession] = useState() 
  // const [userData, setUserData] = useState()
  const [sessionsExpanded, setSessionsExpanded] = useState(true);



  // // Listen to Auth State    // put this in useContext
  // useEffect(() => { 
  //   auth.onAuthStateChanged((user) => { 
  //     if (user) { 
  //       // Add a new connection reference for the user's connection
  //       const userConnectionRef = push(ref(dbRef.current, 'users/' + user.uid + '/connections'));
  //       setConnectionRef(userConnectionRef)
  //       set(userConnectionRef, true);
  //       onDisconnect(userConnectionRef).remove();
  //       setUserData(user)
  //     } 
  //     else {
  //       console.log('Auth State: NO USER')
  //       console.log('connection Ref')
  //       console.log(connectionRef)
  //       setUserData(null)
  //     }
  //   });
  // }, []);

    //Create Session Action
    const createSession = useCallback(( title, text = null)=> {
      const user = auth.currentUser;
      console.log(user)
      if (user) {
        const uid = user.uid;
        const sessionData = {
          ownerId: uid,
          text: text,
          title: title,
        };
        const sessionId = push(child(ref(dbRef.current), 'sessions')).key;
        const updates = {};
        updates['/sessions/' + sessionId] = sessionData;
        updates['/users/' + uid + '/ownedSessions/'+ sessionId ] = true; //connect to owner

        let updated = update(ref(dbRef.current), updates)
        .then(() => {
          console.log('session created')
          setCurrentSession(sessionId) // why is this sessionId not setting properly so it can be used in Session when setting starter prompt as text in db
          // console.log('currentSession')
          // console.log(currentSession)
        })
        .catch((error) => {
          console.log('failed to create session')
        });
        return Promise.all([ sessionId, updated ])
      } else {
        console.log('User is not authenticated. Cannot create session.');
      }
    },[])

  return (
    <CliveStateProvider>
        <div className="App disable-caret">   

          <Walkthrough />

          <div className='container position-relative'>

            <Header 
            // userData={userData} 
            />

            <AuthButtons 
            // userData={userData} 
                        //  setUserData={setUserData} 
                         />

            <UsersMenu 
            // auth={auth} 
                      //  userData={userData} 
                      //  setUserData={setUserData} 
                      //  connectionRef={connectionRef} 
                      //  setConnectionRef={setConnectionRef}
                       />

            <SessionsMenu 
            // auth={auth} 
                          // userData={userData} 
                          setCurrentSession={setCurrentSession} 
                          userOwnedSessions={userOwnedSessions}
                          setUserOwnedSessions={setUserOwnedSessions} 
                          sessionElRef={sessionElRef}
                          sessionsExpanded={sessionsExpanded}
                          setSessionsExapanded={setSessionsExpanded} 
                          createSession={createSession} />

            <Session 
            // userData={userData} 
                     currentSession={currentSession}
                     setCurrentSession={setCurrentSession} 
                     userOwnedSessions={userOwnedSessions} 
                     sessionElRef={sessionElRef}
                     sessionsExpanded={sessionsExpanded}
                     setSessionsExpanded={setSessionsExpanded} 
                     createSession={createSession} />
          </div>

        </div>
    </CliveStateProvider>

  )
}

