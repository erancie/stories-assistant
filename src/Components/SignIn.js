import React, { useState, useCallback, useRef, useEffect } from 'react'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, update, onDisconnect } from 'firebase/database';


const SignIn = ({ setUserData })=> {

  const dbRef = useRef(getDatabase()); 
  const [emailSignIn, setEmailSignIn] = useState('');
  const [passwordSignIn, setPasswordSignIn] = useState('');

  //User SignIn
  const SignIn = useCallback((email, password) => { 
    console.log('Signing In')
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
    })
    .catch((error) => {
      console.log( `Sign In Error`);
      console.log( `errorCode: ${error.code}`);
      console.log( `errorMessage: ${error.message}`);
    }); //track success of all async tasks this way.

  },[])

  //would this work better in App comp?
  // useEffect(() => {
  //   const auth = getAuth();

  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     if (user) {
  //       update(ref(dbRef.current, 'users/' + user.uid),{
  //         online: true
  //       });
  //       onDisconnect(ref(dbRef, 'users/' + user.uid)).update({
  //         online: false
  //       });
  //     } else {
  //         console.log('User is signed out');
  //     }
  //   });
  //   return () => {//wouldn't you want to always have this listener on? If you clean it when unmounting app, it wont 'online: false'
  //   //   unsubscribe(); //will this remove listener if I conditionally render SignIn
  //   };
  // }, []);


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

    </div>
  )
}

export default SignIn

