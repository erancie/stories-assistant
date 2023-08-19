import React, { useEffect, useState, useRef, useCallback } from 'react'
import { getDatabase, ref, onValue, off, push, update, child } from 'firebase/database';


export default function SessionsMenu({ auth, 
                                       userData, 
                                       setCurrentSession, 
                                       userOwnedSessions, 
                                       setUserOwnedSessions }) {

  const dbRef = useRef(getDatabase()); 
  const [publicSessions, setPublicSessions] = useState()  
  const [newSessionTitle, setNewSessionTitle] = useState('');

  // Listen to Public Sessions
  useEffect(()=>{ 
    const db = dbRef.current;
    onValue(ref(db, `sessions`), getSessions );
    function getSessions(snapshot) {
      const sessions = snapshot.val();
      setPublicSessions(sessions)
    }
    return ()=> {
      off(ref(db, `sessions`), 'value', getSessions );
    }
     //OPT: How to load just titles and id needed for session menu on every change in session? (exclude text data).
     //     Query list of only session IDs and session titles.
  }, [])

  //Listen to Your Sessions
  useEffect(()=>{ 
    const db = dbRef.current;
    onValue(ref(db, `users/${userData && userData.uid}/ownedSessions`), getYourSessions );
    function getYourSessions (snapshot) {
      const ownedSessions = snapshot.val();
      setUserOwnedSessions(ownedSessions)
    }
    // keep cleanup for when factored
    return ()=> off(ref(db, `users/${userData && userData.uid}/ownedSessions`), 'value', getYourSessions );
    // OPT: Query only id and titles? (not text as well). --see firebase warning in notes. 
    //      Only query text in session comp
    // Req specific session data on specific actions - Not all data on all/many actions
    //   Means making more requests to db but for less data each time. - Is this more efficient?
  }, [userData])

  //Create Session Action
  const createSession = useCallback(( title, text = null)=> {
    const user = auth.currentUser;
    // console.log('Create Session - User: ')
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
      update(ref(dbRef.current), updates)
      .then(() => {
        console.log('session created')
        setCurrentSession(sessionId)
      })
      .catch((error) => {
        console.log('failed to create session')
      });
    } else {
      console.log('User is not authenticated');
    }
  },[])

  return (
    <div className='sessions-menu m-2 mt-4'>
      <h3 className='menu-title p-2'>Sessions</h3>


          {/* Public Sessions */}
          <div className='public-sessions-container row m-3 mb-5'>
            <h5 className='sub-h'>Public</h5>
            {(()=>{
              let sessions = []
              for (const sessionId in publicSessions) {
                const session = publicSessions[sessionId] //change this to req session text from db absed on seshId? check if efficient?
                sessions.push(
                <div key={sessionId} 
                     className='session-thumb col-2 p-1'
                     onClick={()=>setCurrentSession(sessionId)} >
                  <p>{session.title}</p>
                  {/* <div className='join-button m-1' onClick={()=>setCurrentSession(sessionId)}>Join</div> */}
                </div>
                )
              }
              return sessions
            })()}
          </div>


          {/* Your Sessions  */}
          <div className='owned-sessions-container row m-3 mb-5'>
            <h5 className='sub-h'>Your Sessions</h5>
            {(()=>{
              if(publicSessions && userOwnedSessions){
                let sessions = []
                for (const sessionId in userOwnedSessions) {//get session ids in ownedSessions
                  const session = publicSessions[sessionId] //get all session data from publicSessions
                  //Note: could you put make db req here for full session data (w/ text) if public sessions changes to only id and title?
                  sessions.push(
                  <div key={sessionId} 
                       className='session-thumb col-2 p-1'
                       onClick={()=>setCurrentSession(sessionId)} >
                    <p>{session && session.title}</p>
                    {/* <div className='join-button m-1' onClick={()=>setCurrentSession(sessionId)}>Join</div> */}
                  </div>
                  )
                }
                return sessions
              }
            })()}
          </div>

          
          {/* Create Session */}
          <div className='create-session m-3 p-2 pb-4 col-6'>
            <h5 className='sub-h'>+Create Session</h5>
            <input  placeholder={`Sesson Title`}
                    className='new-session-title' 
                    type="text" 
                    name='new-session-title' 
                    onChange={(e)=>setNewSessionTitle(e.target.value)}
                    value={ newSessionTitle }
                    // disabled={}
                    >
            </input>
            <div className='create-session-button mt-2 p-1' onClick={()=>{createSession( newSessionTitle, ''); setNewSessionTitle('')}}>
              Create
            </div>
          </div>

    </div>
  )
}
