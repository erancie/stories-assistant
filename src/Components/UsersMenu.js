import React, { useEffect, useState, useRef } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database';
import Profile from './Profile';

export default function UsersMenu({auth, userData, setUserData, connectionRef, setConnectionRef}) {

  const dbRef = useRef(getDatabase()); 
  const [onlineUsers, setOnlineUsers] = useState() 
  const [lobbyExpanded, setLobbyExapanded] = useState(true) 

    // Listen to Online Users
  useEffect(()=>{ 
    const db = dbRef.current;
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => { //listen to just changes in connections? not all changes in users?
      const connected = []
      snapshot.forEach((doc)=>{//isn't snapshot an object?
        const user = doc.val()//doesn't forEach get value - val() isn't doc the val? console this
        if (user.connections) connected.push(user)
      })
      setOnlineUsers(connected)
    });
  }, [])
  return (
    <>
    <div className={`lobby-menu m-2 disable-caret ${!lobbyExpanded && 'glare'}`}>

    <Profile auth={auth} 
             userData={userData} 
             setUserData={setUserData} 
             connectionRef={connectionRef} 
             setConnectionRef={setConnectionRef} />

      <h3 className='menu-title p-2' onClick={()=>setLobbyExapanded((curr)=>!curr)} >Lobby</h3>

      {lobbyExpanded ? 
        <svg className={`minimize-svg`} onClick={()=>setLobbyExapanded((curr)=>!curr)} viewBox="0 0 92 49" xmlns="http://www.w3.org/2000/svg">
          <path d="M43.8787 1.12132C45.0503 -0.0502524 46.9498 -0.0502525 48.1213 1.12132L90.8787 43.8787C92.7686 45.7686 91.4301 49 88.7574 49H72.2426C71.447 49 70.6839 48.6839 70.1213 48.1213L48.1213 26.1213C46.9498 24.9497 45.0503 24.9497 43.8787 26.1213L21.8787 48.1213C21.3161 48.6839 20.553 49 19.7574 49H3.24264C0.569927 49 -0.768574 45.7686 1.12132 43.8787L43.8787 1.12132Z" />
        </svg>
        :
        <svg className={`expand-svg`} onClick={()=>setLobbyExapanded((curr)=>!curr)} viewBox="0 0 92 49" xmlns="http://www.w3.org/2000/svg">
            <path d="M43.8787 47.8787C45.0503 49.0503 46.9498 49.0503 48.1213 47.8787L90.8787 5.12132C92.7686 3.23143 91.4301 4.76837e-07 88.7574 4.76837e-07H72.2426C71.447 4.76837e-07 70.6839 0.316071 70.1213 0.87868L48.1213 22.8787C46.9498 24.0503 45.0503 24.0503 43.8787 22.8787L21.8787 0.87868C21.3161 0.316071 20.553 4.76837e-07 19.7574 4.76837e-07H3.24264C0.569927 4.76837e-07 -0.768574 3.23143 1.12132 5.12132L43.8787 47.8787Z" />
        </svg> 
      }

      {lobbyExpanded &&
      <div className='online-users-container row px-4 pb-3 '>
        {(()=>{
              let users = []
              for (const userId in onlineUsers) {
                const user = onlineUsers[userId]
                users.push(
                <div key={userId} className='user-thumb col-3 col-md-2 m-2 p-2'>
                  <p className='user-thumb-name '>{user.displayName ? user.displayName : 'User'}</p>
                </div>
                )
              }
              return users
            })()}
      </div>
      }

    </div>
    </>
  )
}
