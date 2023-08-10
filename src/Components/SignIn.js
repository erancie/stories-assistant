import React, { useState, useCallback, useRef, useEffect } from 'react'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, update, onDisconnect } from 'firebase/database';
import Notification from './Notification';

const SignIn = ({ setUserData })=> {

  const dbRef = useRef(getDatabase()); 
  const [emailSignIn, setEmailSignIn] = useState('');
  const [passwordSignIn, setPasswordSignIn] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  // const [isSigningIn, setIsSigningIn] = useState(true);
  const [justSignedIn, setJustSignedIn] = useState(false);
  // const [justSignedIn, setJustSignedIn] = useState(true);

  //User SignIn
  const SignIn = useCallback((email, password) => { 
    console.log('Signing In')
    setIsSigningIn(true)
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(`User Signed In`)
      const user = userCredential.user; 
      return Promise.all([ 
        user,
        update(ref(dbRef.current, 'users/' + user.uid),{ online: true }),
        onDisconnect(ref(dbRef.current, 'users/' + user.uid)).update({ online: false })
      ]);
    })
    .then(([user, updateResult, disconnectResult]) => {
      setUserData(user);
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
                        // noClickOut
                        classes={`bg-color-dark-1`}
                        loadMessage={'Signing in..'} 
                        // backgroundColor={'rgba(6, 10, 20, 0.83)'}
                        // background={'linear-gradient(180deg, rgba(6,10,20,1) 0%, rgba(16,24,43,0.80) 100%)'}
                        /> }
      { justSignedIn && 
          <Notification show={setJustSignedIn} 
                        loadMessage={"You're signed in!"} 
                        // classes={'fade-anim green-text'} 
                        classes={'fade-anim green-text bg-color-dark-1'} 
                        timeout={2200} 
                        
                        /> }
                      
    </div>
  )
}

export default SignIn

