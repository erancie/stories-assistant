import React, { useState, useCallback, useRef } from 'react'
import {  getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { set, getDatabase, onDisconnect, push, ref} from 'firebase/database';

import Notification from './Notification';

const SignIn = ({ setUserData })=> {

  const [emailSignIn, setEmailSignIn] = useState('');
  const [passwordSignIn, setPasswordSignIn] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isJustSignedIn, setJustSignedIn] = useState(false);

  const dbRef = useRef(getDatabase()); 

  //User SignIn
  const SignIn = useCallback((email, password) => { 
    setIsSigningIn(true)
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user; 
      console.log(`User Signed In ${user.uid}`)
      // setUserData(user);
      setIsSigningIn(false)
      setJustSignedIn(true)

      // Add a new connection reference for the signed-in user
      // const userConnectionRef = push(ref(dbRef.current, 'users/' + user.uid + '/connections'));
      // set(userConnectionRef, true);
      // onDisconnect(userConnectionRef).remove();

    })
    .catch((error) => {
      console.log( `Sign In Error`);
      console.log( `errorCode: ${error.code}`);
      console.log( `errorMessage: ${error.message}`);
      setIsSigningIn(false)
    }); 
  },[])

  return (
    <div className='SignIn'>
      <h1>SignIn</h1>

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
                          SignIn(emailSignIn, passwordSignIn);
                          setEmailSignIn('');
                          setPasswordSignIn('');
                        }} >
        Log In
      </button>

      { isSigningIn && 
          <Notification show={setIsSigningIn} 
                        loadMessage={'Signing in..'} 
                        /> }
      { isJustSignedIn && 
          <Notification show={setJustSignedIn} 
                        loadMessage={"Signed in!"} 
                        classes={'fade-anim green-text'} 
                        timeout={2200} 
                        /> }
                      
    </div>
  )
}

export default SignIn

