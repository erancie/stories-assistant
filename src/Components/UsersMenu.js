import React, { useEffect, useState, useRef } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database';

export default function UsersMenu() {

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
    <div className='lobby-menu m-2 mt-3 disable-caret'>

      <h3 className='menu-title p-2' onClick={()=>setLobbyExapanded((curr)=>!curr)} >Lobby</h3>

      {lobbyExpanded ? 
        <svg className={`minimize-svg`} onClick={()=>setLobbyExapanded((curr)=>!curr)} viewBox="0 0 24 19" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.54354 1.50388C10.738 -0.199922 13.262 -0.199918 14.4565 1.50389L23.4119 14.2778C24.8057 16.266 23.3835 19 20.9554 19H3.04457C0.616523 19 -0.805704 16.266 0.588116 14.2779L9.54354 1.50388Z" />
        </svg>
        :
        <svg className={`expand-svg`} onClick={()=>setLobbyExapanded((curr)=>!curr)} viewBox="0 0 24 19" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.4565 17.4961C13.262 19.1999 10.738 19.1999 9.54354 17.4961L0.588121 4.72215C-0.805698 2.73401 0.616531 -2.48136e-06 3.04458 -2.2691e-06L20.9554 -7.03279e-07C23.3835 -4.91012e-07 24.8057 2.73401 23.4119 4.72215L14.4565 17.4961Z" />
        </svg> 
      }

      {lobbyExpanded &&
      <div className='online-users-container row'>
        {/* <h5>Online</h5> */}
        {(()=>{
              let users = []
              for (const userId in onlineUsers) {
                const user = onlineUsers[userId]
                users.push(
                <div key={userId} className='user-thumb col-2'>
                  <p>{user.displayName ? user.displayName : 'User'}</p>
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
