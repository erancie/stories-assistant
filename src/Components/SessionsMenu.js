import React, { useEffect, useState, useRef, useCallback } from 'react'
import { getDatabase, ref, onValue, off, push, update, child } from 'firebase/database';


export default function SessionsMenu({ auth, 
                                       userData, 
                                       sessionElRef,
                                       setCurrentSession, 
                                       userOwnedSessions, 
                                       setUserOwnedSessions,
                                       sessionsExpanded,
                                       setSessionsExapanded }) {

  const dbRef = useRef(getDatabase()); 
  const [publicSessions, setPublicSessions] = useState()  
  const [showCreateSession, setShowCreateSession] = useState(false);
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
  <>
    {showCreateSession &&
    <div className='clickout-overlay' onClick={()=>{console.log('fire');setShowCreateSession(false)}}>
    </div>}

    <div className={`sessions-menu m-2 mt-4 disable-caret ${!sessionsExpanded && 'glare'}`}>

      {/* Make expandable ? --> animate */}
      <h3 className={`menu-title p-2 ${showCreateSession && 'width-0'}`}
          onClick={()=>setSessionsExapanded((curr)=>!curr)} >
        Sessions
      </h3>

      {sessionsExpanded ?                                                     //why dont these onClicks bubble to menu title?
        <svg className={`minimize-svg ${showCreateSession && 'hide'}`} onClick={()=>setSessionsExapanded((curr)=>!curr)} 
             viewBox="0 0 92 49" xmlns="http://www.w3.org/2000/svg">
          <path d="M43.8787 1.12132C45.0503 -0.0502524 46.9498 -0.0502525 48.1213 1.12132L90.8787 43.8787C92.7686 45.7686 91.4301 49 88.7574 49H72.2426C71.447 49 70.6839 48.6839 70.1213 48.1213L48.1213 26.1213C46.9498 24.9497 45.0503 24.9497 43.8787 26.1213L21.8787 48.1213C21.3161 48.6839 20.553 49 19.7574 49H3.24264C0.569927 49 -0.768574 45.7686 1.12132 43.8787L43.8787 1.12132Z" />
        </svg>
        :
        <svg className={`expand-svg ${showCreateSession && 'hide'}`} onClick={()=>setSessionsExapanded((curr)=>!curr)} 
             viewBox="0 0 92 49" xmlns="http://www.w3.org/2000/svg">
          <path d="M43.8787 47.8787C45.0503 49.0503 46.9498 49.0503 48.1213 47.8787L90.8787 5.12132C92.7686 3.23143 91.4301 4.76837e-07 88.7574 4.76837e-07H72.2426C71.447 4.76837e-07 70.6839 0.316071 70.1213 0.87868L48.1213 22.8787C46.9498 24.0503 45.0503 24.0503 43.8787 22.8787L21.8787 0.87868C21.3161 0.316071 20.553 4.76837e-07 19.7574 4.76837e-07H3.24264C0.569927 4.76837e-07 -0.768574 3.23143 1.12132 5.12132L43.8787 47.8787Z" />
        </svg>
      }

      <svg className={`show-create-session-button ${showCreateSession && 'fill-orange'}`} onClick={()=>setShowCreateSession((curr)=>!curr)} viewBox="0 0 40 40"  xmlns="http://www.w3.org/2000/svg">
        <path d="M4.44444 11.1111C4.44444 11.7005 4.67857 12.2657 5.09532 12.6825C5.51206 13.0992 6.07729 13.3333 6.66666 13.3333C7.25603 13.3333 7.82126 13.0992 8.23801 12.6825C8.65476 12.2657 8.88889 11.7005 8.88889 11.1111V8.88889H11.1111C11.7005 8.88889 12.2657 8.65476 12.6825 8.23801C13.0992 7.82127 13.3333 7.25604 13.3333 6.66667C13.3333 6.0773 13.0992 5.51207 12.6825 5.09532C12.2657 4.67857 11.7005 4.44444 11.1111 4.44444H8.88889V2.22222C8.88889 1.63285 8.65476 1.06762 8.23801 0.650874C7.82126 0.234126 7.25603 0 6.66666 0C6.07729 0 5.51206 0.234126 5.09532 0.650874C4.67857 1.06762 4.44444 1.63285 4.44444 2.22222V4.44444H2.22222C1.63285 4.44444 1.06762 4.67857 0.650873 5.09532C0.234126 5.51207 0 6.0773 0 6.66667C0 7.25604 0.234126 7.82127 0.650873 8.23801C1.06762 8.65476 1.63285 8.88889 2.22222 8.88889H4.44444V11.1111ZM33.3333 4.44444H20C19.4106 4.44444 18.8454 4.67857 18.4286 5.09532C18.0119 5.51207 17.7778 6.0773 17.7778 6.66667C17.7778 7.25604 18.0119 7.82127 18.4286 8.23801C18.8454 8.65476 19.4106 8.88889 20 8.88889H33.3333C33.9227 8.88889 34.4879 9.12301 34.9047 9.53976C35.3214 9.95651 35.5555 10.5217 35.5555 11.1111V32.7111L32.0667 29.4889C31.6568 29.1052 31.117 28.8908 30.5555 28.8889H11.1111C10.5217 28.8889 9.95651 28.6548 9.53976 28.238C9.12301 27.8213 8.88889 27.256 8.88889 26.6667V20C8.88889 19.4106 8.65476 18.8454 8.23801 18.4287C7.82126 18.0119 7.25603 17.7778 6.66666 17.7778C6.07729 17.7778 5.51206 18.0119 5.09532 18.4287C4.67857 18.8454 4.44444 19.4106 4.44444 20V26.6667C4.44444 28.4348 5.14682 30.1305 6.39706 31.3807C7.6473 32.631 9.343 33.3333 11.1111 33.3333H29.6889L36.3555 39.4C36.7427 39.7635 37.2472 39.9764 37.7778 40C38.0825 39.9967 38.384 39.9364 38.6666 39.8222C39.0642 39.6487 39.4022 39.3627 39.6391 38.9994C39.8761 38.6362 40.0015 38.2115 40 37.7778V11.1111C40 9.343 39.2976 7.64731 38.0474 6.39707C36.7971 5.14682 35.1014 4.44444 33.3333 4.44444Z" />
      </svg>

      {/* Create Session */}
      {showCreateSession &&
      <div className='clickout-overlay' onClick={()=>{setShowCreateSession(false)}}>
        {/* detect click outside element for create session el  */}
        <div className='create-session p-2 pb-4 disable-caret' 
             onClick={(e)=>e.stopPropagation()}>

          <input className='new-session-title-input p-1 m-4 mb-3 mx-auto ' 
                placeholder={`Session Title`}
                type="text" 
                name='new-session-title' 
                onChange={(e)=>setNewSessionTitle(e.target.value)}
                value={ newSessionTitle }
                  // disabled={}
                  >
          </input>
          
          <div className='create-session-button m-4 my-2 p-2' 
               onClick={()=>{
                  if (auth.currentUser){
                    createSession( newSessionTitle, ''); 
                    setNewSessionTitle('');
                    setShowCreateSession(false);
                    sessionElRef.current.scrollIntoView({behavior: 'smooth'});
                  } else {
                    console.log('no-one is logged in')
                    // let anonymous user create session?
                    // trigger notification --> 'please sign up ro log in'
                  }
               }}
            >
            Create Session
          </div>
        </div>
        
      </div>
      }

      {sessionsExpanded && <>
      
      {/* Public Sessions */}
      <div className='public-sessions-container row m-3 mb-5'>
        <h5 className='sub-h'>Public</h5>
        {(()=>{
          let sessions = []
          for (const sessionId in publicSessions) {
            const session = publicSessions[sessionId] //change this to req session text from db absed on seshId? check if efficient?
            sessions.push(
            <div key={sessionId} 
                  className='session-thumb col-3 p-3 pb-0 '
                  onClick={()=>{
                      setCurrentSession(sessionId)
                      setSessionsExapanded(false)
                      sessionElRef.current.scrollIntoView({behavior: 'smooth'})
                  }} >
              <p>{session.title}</p>
              {/* <div className='join-button m-1' onClick={()=>setCurrentSession(sessionId)}>Join</div> */}
            </div>
            )
          }
          return sessions
        })()}
      </div>

      {/* Your Sessions  */}
      <div className='owned-sessions-container row m-3 pb-4'>
        <h5 className='sub-h'>Your Sessions</h5>
        {(()=>{
          if(publicSessions && userOwnedSessions){
            let sessions = []
            for (const sessionId in userOwnedSessions) {//get session ids in ownedSessions
              const session = publicSessions[sessionId] //get all session data from publicSessions
              //Note: could you put make db req here for full session data (w/ text) if public sessions changes to only id and title?
              sessions.push(
              <div key={sessionId} 
                    className='session-thumb col-3 p-3 pb-0 '
                    onClick={()=>{
                      setCurrentSession(sessionId)
                      setSessionsExapanded(false)
                      sessionElRef.current.scrollIntoView({behavior: 'smooth'})
                    }} >
                <p>{session && session.title}</p>
                {/* <div className='join-button m-1' onClick={()=>setCurrentSession(sessionId)}>Join</div> */}
              </div>
              )
            }
            return sessions
          }
        })()}
      </div>     

      </>}



    </div>
  </>
  )
}
