import React, { useEffect, useState, useRef } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database';

export default function UsersMenu() {

  const dbRef = useRef(getDatabase()); 
  const [onlineUsers, setOnlineUsers] = useState() 

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
    <div className='lobby-menu m-2 mt-3'>
      <h3 className='menu-title p-2'>Lobby</h3>
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
    </div>
    </>
  )
}
