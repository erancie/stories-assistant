import React, { useState, useRef, useCallback } from 'react'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDatabase, update, onDisconnect, ref } from 'firebase/database';


const Signup =({ setUserData })=> {

  const [emailSignup, setEmailSignup] = useState('');
  const [passwordSignup, setPasswordSignup] = useState('');
  const [nameSignup, setNameSignup] = useState('');
  const dbRef = useRef(getDatabase()); 

  //Create User - SIGN UP 
  const createUser = useCallback((email, password, name = 'User')=> {
    const auth = getAuth();
    
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(`User Created`)
      const user = userCredential.user;
      return user
    })
    .then((user) => {
      return Promise.all([
        user,
        updateProfile(user, { displayName: name }),
        update(ref(dbRef.current, 'users/' + user.uid),{ online: true, displayName: name}),
        onDisconnect(ref(dbRef.current, 'users/' + user.uid)).update({ online: false })])
    })
    .then(([user, updateProfileResult, updateResult, onDisconnectResult ]) => {
      console.log('Profile updated, user updated, on disconnect registered')
      setUserData(user)
    })
    .catch((error) => {
      console.log( `Error Creating User`);
      console.log( `errorCode: ${error.code}`);
      console.log( `errorMessage: ${error.message}`);
    });

  },[])
  
  return (
    <div className='signup'>
      <h1>Sign Up</h1>

      <input className='email-signup'
            placeholder={`email`}
            type="text" 
            name='email-signup' 
            onChange={(e)=>setEmailSignup(e.target.value)}
            value={ emailSignup }
      ></input>

      <input className='password-signup'
            placeholder={`Password`}
            type="text" 
            name='password-signup' 
            onChange={(e)=>setPasswordSignup(e.target.value)}
            value={ passwordSignup }
      ></input>

      <input className='name-signup'
            placeholder={`Display Name`}
            type="text" 
            name='name-signup' 
            onChange={(e)=>setNameSignup(e.target.value)}
            value={ nameSignup }
      ></input>

      <button className='signup-button' 
              onClick={(e)=>{
                        createUser(emailSignup, passwordSignup, nameSignup);
                        setEmailSignup('')
                        setPasswordSignup('') 
                        setNameSignup('') }} >
        Sign Up
      </button>

    </div>
  )
}
// export default Signup
export default React.memo(Signup)