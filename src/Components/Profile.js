import React, {useState, useRef } from 'react'
import Popup from './Popup';
import { signOut } from "firebase/auth";
import { getDatabase, ref, set, update, remove} from 'firebase/database';

import SignIn from './SignIn';
import Signup from './Signup';

export default function Profile({ userData, setUserData, auth, connectionRef, setConnectionRef }) {

  // const dbRef = useRef(getDatabase()); 

  const [showSignIn, setShowSignIn] = useState()  
  const [showSignUp, setShowSignUp] = useState() 

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isJustSignedOut, setJustSignedOut] = useState(false);
 

  return (
        <div className='profile-container p-2 m-0'>
        
        {/* Logged Out --> Singup + Login Buttons */}
        { !userData &&
            <div className='auth-buttons mt-1'>

              <div className='signup-button  m-2 p-1' onClick={()=>setShowSignUp((curr)=>!curr)}>
                
                <span className='signup-button-text d-none d-sm-inline '>Signup</span>

                <svg className='signup-svg ms-sm-3' viewBox="0 0 26 28" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16C9.34784 16 6.8043 17.0536 4.92893 18.9289C3.05357 20.8043 2 23.3478 2 26C2 26.2652 1.89464 26.5196 1.70711 26.7071C1.51957 26.8946 1.26522 27 1 27C0.734784 27 0.48043 26.8946 0.292893 26.7071C0.105357 26.5196 1.33898e-08 26.2652 1.33898e-08 26C-0.000115006 23.5642 0.740799 21.186 2.12434 19.1812C3.50788 17.1764 5.46857 15.64 7.746 14.776C6.11289 13.751 4.9049 12.1707 4.34432 10.3259C3.78375 8.48108 3.90831 6.49586 4.69508 4.73558C5.48185 2.97529 6.8779 1.55838 8.62632 0.745575C10.3747 -0.0672269 12.3579 -0.221225 14.2108 0.311919C16.0638 0.845063 17.6618 2.02948 18.7109 3.6472C19.76 5.26493 20.1895 7.20712 19.9205 9.11637C19.6514 11.0256 18.7019 12.7735 17.2466 14.0383C15.7913 15.3031 13.9281 15.9997 12 16ZM20 22V19C20 18.7348 20.1054 18.4804 20.2929 18.2929C20.4804 18.1054 20.7348 18 21 18C21.2652 18 21.5196 18.1054 21.7071 18.2929C21.8946 18.4804 22 18.7348 22 19V22H25C25.2652 22 25.5196 22.1054 25.7071 22.2929C25.8946 22.4804 26 22.7348 26 23C26 23.2652 25.8946 23.5196 25.7071 23.7071C25.5196 23.8946 25.2652 24 25 24H22V27C22 27.2652 21.8946 27.5196 21.7071 27.7071C21.5196 27.8946 21.2652 28 21 28C20.7348 28 20.4804 27.8946 20.2929 27.7071C20.1054 27.5196 20 27.2652 20 27V24H17C16.7348 24 16.4804 23.8946 16.2929 23.7071C16.1054 23.5196 16 23.2652 16 23C16 22.7348 16.1054 22.4804 16.2929 22.2929C16.4804 22.1054 16.7348 22 17 22H20ZM12 14C13.5913 14 15.1174 13.3679 16.2426 12.2426C17.3679 11.1174 18 9.5913 18 8C18 6.40871 17.3679 4.88258 16.2426 3.75736C15.1174 2.63215 13.5913 2.00001 12 2.00001C10.4087 2.00001 8.88258 2.63215 7.75736 3.75736C6.63214 4.88258 6 6.40871 6 8C6 9.5913 6.63214 11.1174 7.75736 12.2426C8.88258 13.3679 10.4087 14 12 14Z" />
                </svg>

              </div>
              
              { showSignUp &&  
                <Popup show={setShowSignUp} message={'Signup'} >
                    <Signup setUserData={setUserData} setShowSignUp={setShowSignUp} />
                </Popup> 
              }

              <div className='login-button m-2 p-1 ' onClick={()=>setShowSignIn((curr)=>!curr)}>

                <span className='login-button-text d-none d-sm-inline '>Login</span>

                <svg className='login-svg ms-sm-4' viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 1H17C17.5304 1 18.0391 1.21071 18.4142 1.58579C18.7893 1.96086 19 2.46957 19 3V17C19 17.5304 18.7893 18.0391 18.4142 18.4142C18.0391 18.7893 17.5304 19 17 19H13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 15L13 10L8 5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13 10H1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>



              { showSignIn && 
                <Popup show={setShowSignIn} message={'Login'} >
                  <SignIn setUserData={setUserData} setShowSignIn={setShowSignIn} />
                </Popup>
              }
            </div>
          }

          {/* Logged In --> Profile Icon + Logout Button*/}
          { userData &&
            <>
              {/* Profile Icon */}
              <div className='profile-icon m-auto my-2'>
                {userData && userData.displayName && userData.displayName.charAt(0)} {/* FIX -not setting on sign up */}
              </div>

            {/* Logout Button - Change this to div like above? - Make Button Comp? */}
              <button className='profile-signout-button mt-5' 
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
            </>
          }

          {/* Popups */}
          { isSigningOut && 
            <Popup show={setIsSigningOut} 
                          message={'Signing out..'} /> }
          { isJustSignedOut && 
            <Popup show={setJustSignedOut} 
                          message={"Signed out"} 
                          classes={'fade-anim'} 
                          timeout={2200} /> }
        </div>
  )
}
