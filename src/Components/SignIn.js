import React, { useState, useCallback, useRef } from 'react'
import {  getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { set, getDatabase, onDisconnect, push, ref} from 'firebase/database';

import Popup from './Popup';

const SignIn = ({ setUserData, setShowSignIn })=> {

  const [emailSignIn, setEmailSignIn] = useState('');
  const [passwordSignIn, setPasswordSignIn] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isJustSignedIn, setJustSignedIn] = useState(false);

  const dbRef = useRef(getDatabase()); 

  //User SignIn
  const SignIn = useCallback((email, password) => { 
    // setShowSignIn(false)
    setIsSigningIn(true)
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user; 
      console.log(`User Signed In ${user.uid}`)
      setIsSigningIn(false)
      setJustSignedIn(true)
    })
    .catch((error) => {
      console.log( `Sign In Error`);
      console.log( `errorCode: ${error.code}`);
      console.log( `errorMessage: ${error.message}`);
      setIsSigningIn(false)
    }); 
  },[])

  return (
    <div className='signin'>
      {/* <h1>SignIn</h1> */}

      <input className='email-SignIn'
              placeholder={`email`}
              type="text" 
              name='email-SignIn' 
              onChange={(e)=>setEmailSignIn(e.target.value)}
              value={ emailSignIn }
      ></input>

      <input className='password-SignIn'
              placeholder={`Password`}
              type="text" 
              name='password-SignIn' 
              onChange={(e)=>setPasswordSignIn(e.target.value)}
              value={ passwordSignIn }
      ></input>

      <button className='SignIn-button' 
              onClick={(e)=>{
                          SignIn(emailSignIn, passwordSignIn)
                          setEmailSignIn('')
                          setPasswordSignIn('')
                          // setShowSignIn(false)
                        }} >
        Log In
      </button>

      { isSigningIn && 
          <Popup show={setIsSigningIn}  //FIX: why are these not showing when setShowSignIn(false) ???
                        message={'Signing in..'} 
                        /> }
      { isJustSignedIn && 
          <Popup show={setJustSignedIn} 
                        message={"Signed in!"} 
                        bgClasses={'fade-anim green-text'} 
                        timeout={2200} 
                        /> }
                      
    </div>
  )
}

export default SignIn

