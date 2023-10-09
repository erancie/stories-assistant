import React, { useState, useCallback, useRef } from 'react'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Popup from './Popup';
import { set, getDatabase, onDisconnect, push, ref, update} from 'firebase/database';


const Signup =({ setUserData, setShowSignUp })=> {

  const [emailSignup, setEmailSignup] = useState('');
  const [passwordSignup, setPasswordSignup] = useState('');
  const [nameSignup, setNameSignup] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isJustSignedIn, setJustSignedIn] = useState(false);

  const dbRef = useRef(getDatabase()); 


  //Create User - SIGN UP 
  const createUser = useCallback((email, password, name = 'User')=> {
    setIsSigningIn(true)
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(`User Created`)
      const user = userCredential.user;

      return Promise.all([user, 
                          updateProfile(user, { displayName: name }),
                          update(ref(dbRef.current, 'users/' + user.uid),{ displayName: name }) 
                        ])
    })
    .then((user) => {
      console.log('Profile updated, user updated, on disconnect registered')
      setIsSigningIn(false)
      setJustSignedIn(true)
      setUserData(user)// FIX - not setting user profile letter
    })
    .catch((error) => {
      setIsSigningIn(false)
      console.log( `Error Creating User`);
      console.log( `errorCode: ${error.code}`);
      console.log( `errorMessage: ${error.message}`);
    });
  },[])
  
  return (
    <div className='signup row justify-content-center'>
      {/* <h1>Sign Up</h1> */}

      <input className='email-signup-input col-lg-10'
            placeholder={`Email`}
            type="text" 
            name='email-signup-input' 
            onChange={(e)=>setEmailSignup(e.target.value)}
            value={ emailSignup }
      ></input>

      <input className='password-signup-input col-lg-10'
            placeholder={`Password`}
            type="password" 
            name='password-signup-input' 
            onChange={(e)=>setPasswordSignup(e.target.value)}
            value={ passwordSignup }
      ></input>

      <input className='name-signup-input col-lg-10'
            placeholder={`Display Name`}
            type="text" 
            name='name-signup-input' 
            onChange={(e)=>setNameSignup(e.target.value)}
            value={ nameSignup }
      ></input>

      <button className='submit-signup-button col-lg-10' 
              onClick={(e)=>{
                        createUser(emailSignup, passwordSignup, nameSignup);
                        setEmailSignup('')
                        setPasswordSignup('') 
                        setNameSignup('') 
                        setShowSignUp&&setShowSignUp(false);
                        }} >
        Sign Up
      </button>
           
      { isSigningIn && 
          <Popup show={setIsSigningIn} 
                        message={'Signing in..'} 
                        /> }
      { isJustSignedIn && 
          <Popup show={setJustSignedIn} 
                        message={"You're signed in!"} 
                        bgClasses={'fade-anim green-text'} 
                        timeout={2200} 
                        /> }
    </div>
  )
}
// export default Signup
export default React.memo(Signup)