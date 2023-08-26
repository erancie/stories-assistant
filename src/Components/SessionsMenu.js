import React, { useEffect, useState, useRef, useCallback } from 'react'
import { getDatabase, ref, onValue, off, push, update, child } from 'firebase/database';
import { useAuth } from '../Context/AuthContext';


export default function SessionsMenu({ 
  // auth, 
                                      //  userData, 
                                       sessionElRef,
                                       setCurrentSession, 
                                       userOwnedSessions, 
                                       setUserOwnedSessions,
                                       sessionsExpanded,
                                       setSessionsExapanded,
                                       createSession }) {

  const { auth, userData, setUserData, connectionRef, setConnectionRef} = useAuth() //fix


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

      {userData &&
        <svg className={`show-create-session-button ${showCreateSession && 'fill-orange'}`} onClick={()=>setShowCreateSession((curr)=>!curr)} viewBox="0 0 41 41"  xmlns="http://www.w3.org/2000/svg">
          <path d="M7.15388 0C7.70617 0 8.15388 0.447715 8.15388 1V6.18945L13.3077 6.18945C13.86 6.18945 14.3077 6.63717 14.3077 7.18945C14.3077 7.74174 13.86 8.18945 13.3077 8.18945H8.15388V13.3819C8.15388 13.9342 7.70617 14.3819 7.15388 14.3819C6.6016 14.3819 6.15388 13.9342 6.15388 13.3819V8.18945H1C0.447715 8.18945 -3.79732e-08 7.74174 0 7.18945C3.79732e-08 6.63717 0.447715 6.18945 1 6.18945L6.15388 6.18945V1C6.15388 0.447715 6.6016 0 7.15388 0Z" />
          <path d="M6.12849 21.5V30.0176C6.12849 32.2267 7.91935 34.0176 10.1285 34.0176H30.7439C30.9047 34.0176 36.6113 38.3843 39.4412 40.5574C40.4252 41.313 41.0003 41.1089 41.0003 39.8682V10.1514C41.0003 7.94227 39.2094 6.1582 37.0003 6.1582H20V8.1582H37.0003C38.1093 8.1582 39.0003 9.05126 39.0003 10.1514V37.699C37.8234 36.7979 36.489 35.7792 35.299 34.8781C34.397 34.1951 33.5717 33.575 32.9589 33.1236C32.6545 32.8993 32.3912 32.7083 32.1932 32.57C32.0973 32.503 31.9971 32.4346 31.9073 32.3776C31.866 32.3515 31.797 32.3086 31.7169 32.2658C31.6792 32.2457 31.6042 32.2068 31.508 32.1677L31.5044 32.1662C31.4638 32.1491 31.1523 32.0176 30.7439 32.0176H10.1285C9.02392 32.0176 8.12849 31.1221 8.12849 30.0176V21.5H6.12849Z" />
        </svg>
      }




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
      <div className='public-sessions-container row flex-column flex-sm-row m-3 mb-5'>
        <h5 className='sub-h'>Public</h5>
        {(()=>{
          let sessions = []
          for (const sessionId in publicSessions) {
            if(!userOwnedSessions || !userOwnedSessions[sessionId]) {
              const session = publicSessions[sessionId] //change this to req session text from db absed on seshId? check if efficient?
              sessions.push(
              <div key={sessionId} 
                    className='session-thumb col-10 col-sm-5 col-md-3 col-lg-2 p-3 ps-4 px-sm-3 pb-0 '
                    onClick={()=>{
                        setCurrentSession(sessionId)
                        sessionElRef.current.scrollIntoView({behavior: 'smooth'})
                    }} >
                <p>{session.title}</p>
              </div>
              )
            }
          }
          return sessions
        })()}
      </div>

      {/* Your Sessions  */}
      <div className='owned-sessions-container row flex-column flex-sm-row m-3 pb-4'>
        <h5 className='sub-h'>Your Sessions</h5>
        {(()=>{
          if(publicSessions && userOwnedSessions){
            let sessions = []
            for (const sessionId in userOwnedSessions) {//get session ids in ownedSessions
              const session = publicSessions[sessionId] //get all session data from publicSessions
              //Note: could you put make db req here for full session data (w/ text) if public sessions changes to only id and title?
              sessions.push(
              <div key={sessionId} 
                    className='session-thumb col-10 col-sm-5 col-md-3 col-lg-2 p-3 ps-4 px-sm-3 pb-0 '
                    onClick={()=>{
                      setCurrentSession(sessionId)
                      sessionElRef.current.scrollIntoView({behavior: 'smooth'})
                    }} >
                <p>{session && session.title}</p>
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
