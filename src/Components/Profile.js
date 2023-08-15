import React, {useState, useRef } from 'react'
import Notification from './Notification';
import { signOut } from "firebase/auth";
import { getDatabase, ref, set, update, remove} from 'firebase/database';


export default function Profile({ userData, setUserData, auth, connectionRef, setConnectionRef }) {

  const dbRef = useRef(getDatabase()); 

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isJustSignedOut, setJustSignedOut] = useState(false);

  return (
        <div className='profile-container col-2 p-2'>
          <div className='profile-icon m-auto my-2'>
            {userData && userData.displayName && userData.displayName.charAt(0)} {/* FIX -not setting on sign up */}
          </div>

          {auth.currentUser &&
              <button className='profile-signout' 
              onClick={()=>{
                        setIsSigningOut(true)

                        remove(connectionRef)

                        //remove other common browser refs here

                        .then(()=>{
                          setConnectionRef(null)
                          return signOut(auth)
                        })
                        // signOut(auth)

                        .then(()=>{
                          setIsSigningOut(false)
                          setJustSignedOut(true)
                        })
                        .catch((e)=>console.log(`error signing out: ${e}`))
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
