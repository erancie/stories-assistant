import React, { useEffect, useState, useRef, useCallback } from 'react'
// import {} from 'dotenv/config';
import { set, getDatabase, ref, push, onDisconnect, update, child, onValue, off } from 'firebase/database';
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

  const { auth } = useAuth()
  
  const [userOwnedSessions, setUserOwnedSessions] = useState()

  const [currentSession, setCurrentSession] = useState() 

  const [activeSessionUsers, setActiveSessionUsers] = useState() 

  //Done - On create session && joining session add userId to SessionId.activeSessionUsers

  //Next - on leave session and on joining session with currentSession already set
    //remove user from activeSessionUsers
    //- sessionId.activeSessionUsers.userId : false

//listen to active Session users - move to session? or does menu need these too?
  useEffect(()=> {
    const db = dbRef.current;
    onValue(ref(db, 'sessions/' + currentSession + '/activeSessionUsers'), updateASU )
    function updateASU (snapshot) {
      console.log('snapshot')
      console.log(snapshot)
      const activeUsers = snapshot.val()
      setActiveSessionUsers(activeUsers)
      console.log('currentSession')
      console.log(currentSession)
      console.log('activeSessionUsers')
      console.log(activeUsers)
    }
    return off(ref(db, `sessions/${currentSession}/title`), 'value', updateASU);
  }, [currentSession])



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
        activeSessionUsers: { uid : user.displayName },
        // activeSessionUsers: {[uid]: {displayName: user.displayName } }, //this wont work?
      };

      const sessionId = push(child(ref(dbRef.current), 'sessions')).key;
      const updates = {};
      updates['/sessions/' + sessionId] = sessionData;
      updates['/users/' + uid + '/ownedSessions/'+ sessionId ] = true; //connect to owner

      let updated = update(ref(dbRef.current), updates)
      .then(() => {
        console.log('session created')
        setCurrentSession(sessionId) 
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

            <Header />

            <AuthButtons />

            <UsersMenu />

            <SessionsMenu 
                          setCurrentSession={setCurrentSession} 
                          userOwnedSessions={userOwnedSessions}
                          setUserOwnedSessions={setUserOwnedSessions} 
                          sessionElRef={sessionElRef}
                          createSession={createSession} />

            <Session 
                     activeSessionUsers={activeSessionUsers}
                     setActiveSessionUsers={setActiveSessionUsers}
                     currentSession={currentSession}
                     setCurrentSession={setCurrentSession} 
                     userOwnedSessions={userOwnedSessions} 
                     sessionElRef={sessionElRef} 
                     createSession={createSession} />
          </div>

        </div>
    </CliveStateProvider>

  )
}

