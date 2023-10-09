/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState, useRef, useCallback } from 'react'
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
import GraphicPanel from './Components/GraphicPanel';

export default function App() {

  const sessionElRef = useRef(); 
  const dbRef = useRef(getDatabase()); 
  const { auth, userData } = useAuth()
  const [userOwnedSessions, setUserOwnedSessions] = useState()
  const [currentSession, setCurrentSession] = useState() 
  const [activeSessionUsers, setActiveSessionUsers] = useState() 

  //listen to active Session users 
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




  //Leave Session
  const leaveSession = useCallback((sessionId)=>{

    if(sessionId){
      const updates = {};
      updates['/sessions/' + sessionId + '/activeSessionUsers/' + userData.uid] = null 
      return update(ref(dbRef.current), updates)
      .then(() => {
        setCurrentSession(null)
        console.log('left session')
      })
      .catch((error) => {
        console.log('failed to leave session'); console.log(error)
      });
    } 
    console.log('No session to leave.') //PROMPT
    return Promise.resolve()
  }, [userData])


  // Create Session 
  const createSession = useCallback(( title, text = null)=> {
    const user = auth.currentUser;
    if (user) {
      return leaveSession(currentSession)
      .then(()=>{
        console.log('left session ')
        const uid = user.uid;
        const sessionData = {
          ownerId: uid,
          text: text,
          title: title,
          activeSessionUsers: { [uid] : user.displayName },
        };
        let sessionId = push(child(ref(dbRef.current), 'sessions')).key;
        const updates = {};
        updates['/sessions/' + sessionId] = sessionData;
        updates['/users/' + uid + '/ownedSessions/'+ sessionId ] = true; //connect to owner
        return Promise.all([sessionId, update(ref(dbRef.current), updates)])
      })
      .then(([sessionId]) => {
        console.log('session created - Id:'+ sessionId)
        setCurrentSession(sessionId) 
        return sessionId
      })
      .catch((error) => {
        console.log('failed to create session'); console.log(error)
      });

    } else {
      console.log('User is not authenticated. Cannot create session.'); //PROMPT
      return Promise.reject('No User - cannot create session')
    }
  },[currentSession, auth, leaveSession])


  // Join Session
  const joinSession = useCallback((joiningId)=> {
    userData ?
      leaveSession(currentSession)
      .then(() => {
        console.log('left session')
        setCurrentSession(null)
        return update(ref(dbRef.current), {
          ['/sessions/' + joiningId + '/activeSessionUsers/' + userData.uid] : userData.displayName,
        })
      })
      .then(() => {
        console.log('session joined')
        setCurrentSession(joiningId)
      })
      .then(() => {
        console.log('current session set')
      })
      .catch((error) => {
        console.log('failed to join session'); console.log(error)
      })
    : console.log('You need to be logged in to Join a Session.') //PROMPT
  }, [userData, currentSession, leaveSession])


  return (
    <CliveStateProvider>
        <div className="App disable-caret">   

          <Walkthrough />

          <div className='container position-relative'>

            <Header />

            <AuthButtons />

            <UsersMenu />

            <SessionsMenu leaveSession={leaveSession}
                          currentSession={currentSession}
                          setCurrentSession={setCurrentSession} 
                          userOwnedSessions={userOwnedSessions}
                          setUserOwnedSessions={setUserOwnedSessions} 
                          sessionElRef={sessionElRef}
                          createSession={createSession} 
                          joinSession={joinSession}
                          />

            {/* <GraphicPanel /> */}

            <Session leaveSession={leaveSession}
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

