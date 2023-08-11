import React, {useState} from 'react'
import Notification from './Notification';
import { signOut } from "firebase/auth";


export default function Profile({ userData, setUserData, auth }) {

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isJustSignedOut, setJustSignedOut] = useState(false);
  // const [isJustSignedOut, setJustSignedOut] = useState(true);

  return (
        <div className='profile-container col-2 p-2'>
          <div className='profile-icon m-auto my-2'>
            {userData && userData.displayName && userData.displayName.charAt(0)}
          </div>

          {auth.currentUser &&
              <button className='profile-signout' 
              onClick={()=>{
                        setIsSigningOut(true)
                        signOut(auth).then(()=>{
                          setUserData(null)
                          setIsSigningOut(false)
                          setJustSignedOut(true)
                        }).catch((e)=>console.log(`error signing out: ${e}`))
                      }}>
              Logout</button>
          }


          { isSigningOut && 
            <Notification show={setIsSigningOut} 
                          loadMessage={'Signing out..'} 
                          /> }
          { isJustSignedOut && 
            <Notification show={setJustSignedOut} 
                          loadMessage={"Signed out"} 
                          classes={'fade-anim'} 
                          timeout={2200} 
                          /> }
        </div>
  )
}
