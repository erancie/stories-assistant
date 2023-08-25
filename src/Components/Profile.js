import React, {useState, useRef, useCallback, useEffect } from 'react'
import { signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, set, update, remove, onValue, off } from 'firebase/database';
import { useCliveContext } from '../Context/CliveStateContext';
import { debounce } from 'lodash';

import Popup from './Popup';
import SignIn from './SignIn';
import Signup from './Signup';

export default function Profile({ userData, setUserData, auth, connectionRef, setConnectionRef }) {

  const { isListening, isThinking, setPromptNo } = useCliveContext();

  const dbRef = useRef(getDatabase()); 
  const [showSignIn, setShowSignIn] = useState()  
  const [showSignUp, setShowSignUp] = useState() 
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isJustSignedOut, setJustSignedOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');


  // Listen to displayName changes
  useEffect(() => {
    if(auth.currentUser){
      const db = dbRef.current;
      onValue(ref(dbRef.current, `users/${auth.currentUser.uid}/displayName`), updateDisplayNameFromDB);
      function updateDisplayNameFromDB (snapshot) {  
        const data = snapshot.val();
        // if(data === null) setDisplayName(null)
        // else
        console.log(`displayName`)
        console.log(data)
        setDisplayName(data)
      };

      return () => { 
        off(ref(db, `users/${auth.currentUser.uid}/displayName`), 'value', updateDisplayNameFromDB);
      };
    }
  }, [auth]);

  //Submit display name change
  const submitDisplayNameChange = useCallback(() => {
    // const val = e.target.value;
    if (auth.currentUser) {
      updateProfile(auth.currentUser, { displayName: displayName })
      .then(() => {
        console.log('Profile updated!');
        // console.log(auth.currentUser.uid)
        set(ref(dbRef.current, `users/${auth.currentUser.uid}/displayName`), displayName)
      })
      .then(() => console.log('User updated!'))
      .catch((error) => console.error('An error occurred: ', error))
    }
  }, [displayName]);


  return (
      <div className='profile disable-caret'>
        
        {/* Logged Out --> Singup + Login Buttons */}
        {!userData &&
        <div className='auth-buttons m-0'>

          <div className='signup-button m-2 p-1' onClick={()=>setShowSignUp((curr)=>!curr)}>
            <span className='signup-button-text d-none d-sm-inline '>Signup</span>
            <svg className='signup-svg ms-sm-3' viewBox="0 0 26 28" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16C9.34784 16 6.8043 17.0536 4.92893 18.9289C3.05357 20.8043 2 23.3478 2 26C2 26.2652 1.89464 26.5196 1.70711 26.7071C1.51957 26.8946 1.26522 27 1 27C0.734784 27 0.48043 26.8946 0.292893 26.7071C0.105357 26.5196 1.33898e-08 26.2652 1.33898e-08 26C-0.000115006 23.5642 0.740799 21.186 2.12434 19.1812C3.50788 17.1764 5.46857 15.64 7.746 14.776C6.11289 13.751 4.9049 12.1707 4.34432 10.3259C3.78375 8.48108 3.90831 6.49586 4.69508 4.73558C5.48185 2.97529 6.8779 1.55838 8.62632 0.745575C10.3747 -0.0672269 12.3579 -0.221225 14.2108 0.311919C16.0638 0.845063 17.6618 2.02948 18.7109 3.6472C19.76 5.26493 20.1895 7.20712 19.9205 9.11637C19.6514 11.0256 18.7019 12.7735 17.2466 14.0383C15.7913 15.3031 13.9281 15.9997 12 16ZM20 22V19C20 18.7348 20.1054 18.4804 20.2929 18.2929C20.4804 18.1054 20.7348 18 21 18C21.2652 18 21.5196 18.1054 21.7071 18.2929C21.8946 18.4804 22 18.7348 22 19V22H25C25.2652 22 25.5196 22.1054 25.7071 22.2929C25.8946 22.4804 26 22.7348 26 23C26 23.2652 25.8946 23.5196 25.7071 23.7071C25.5196 23.8946 25.2652 24 25 24H22V27C22 27.2652 21.8946 27.5196 21.7071 27.7071C21.5196 27.8946 21.2652 28 21 28C20.7348 28 20.4804 27.8946 20.2929 27.7071C20.1054 27.5196 20 27.2652 20 27V24H17C16.7348 24 16.4804 23.8946 16.2929 23.7071C16.1054 23.5196 16 23.2652 16 23C16 22.7348 16.1054 22.4804 16.2929 22.2929C16.4804 22.1054 16.7348 22 17 22H20ZM12 14C13.5913 14 15.1174 13.3679 16.2426 12.2426C17.3679 11.1174 18 9.5913 18 8C18 6.40871 17.3679 4.88258 16.2426 3.75736C15.1174 2.63215 13.5913 2.00001 12 2.00001C10.4087 2.00001 8.88258 2.63215 7.75736 3.75736C6.63214 4.88258 6 6.40871 6 8C6 9.5913 6.63214 11.1174 7.75736 12.2426C8.88258 13.3679 10.4087 14 12 14Z" />
            </svg>
          </div>

          {showSignUp &&  
          <Popup show={setShowSignUp} message={'Signup'} maxWidth={'400px'} >
              <Signup setUserData={setUserData} setShowSignUp={setShowSignUp} />
          </Popup> 
          }

          <div className='login-button m-2 p-1 ' onClick={()=>setShowSignIn((curr)=>!curr)}>
            <span className='login-button-text d-none d-sm-inline '>Login</span>
            <svg className='login-svg ms-sm-4' viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1H17C17.5304 1 18.0391 1.21071 18.4142 1.58579C18.7893 1.96086 19 2.46957 19 3V17C19 17.5304 18.7893 18.0391 18.4142 18.4142C18.0391 18.7893 17.5304 19 17 19H13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 15L13 10L8 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 10H1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {showSignIn && 
          <Popup show={setShowSignIn} message={'Login'} maxWidth={'400px'} >
            <SignIn setUserData={setUserData} setShowSignIn={setShowSignIn} />
          </Popup>
          }
        </div>
        }

        {/* Logged In --> Profile Icon + Logout Button*/}
        { userData &&
          <>
          {/* Profile Icon */}
          <div className={`profile-icon my-1`}
               style={{top: `${profileOpen ? '1.5rem' : '7.4rem'}`, 
                       right: `${profileOpen ? '325px' : '2.1rem'}`, 
                       position: `${profileOpen ? 'fixed' : 'absolute'}`}} 
               onClick={()=>setProfileOpen((curr)=>!curr)}>
                {/* FIX -not setting on sign up */}
              {userData.displayName?.charAt(0)} 
              {/* {auth.currentUser.displayName?.charAt(0)}  */}
          </div>


          {profileOpen &&
          <Popup show={setProfileOpen} 
                 bgClasses={'popup-bg-light'}
                 classes={'top-0 right popup-style translate-none top-right-popup dark-bg'} 
                 height={'500px'}
                 width={`100%`}
                 maxWidth={'400px'}
                 padding={'2rem'}
                 margin={'1rem auto'}
                 noClose >

            {/* Change Display Name */}
            <div className='change-name-container row align-items-bottom position-relative'>

              
              <input className='change-display-name-input p-3 col-9' 
                  type="text" 
                  name='change-display-name' 
                  onChange={ (e)=>setDisplayName(e.target.value) }
                  placeholder={userData.displayName}
                  value={ displayName } >
              </input>


              <div className='submit-change-name col-2 p-1 mx-2 row align-items-center justify-content-center'
                   onClick={ submitDisplayNameChange }>
                <svg viewBox="0 0 49 92"  xmlns="http://www.w3.org/2000/svg">
                  <path d="M47.8787 43.8787C49.0503 45.0503 49.0503 46.9498 47.8787 48.1213L5.12132 90.8787C3.23142 92.7686 -3.69454e-06 91.4301 -3.57772e-06 88.7574L-2.85583e-06 72.2426C-2.82106e-06 71.447 0.316067 70.6839 0.878677 70.1213L22.8787 48.1213C24.0503 46.9498 24.0503 45.0503 22.8787 43.8787L0.878679 21.8787C0.31607 21.3161 -5.96409e-07 20.553 -5.6163e-07 19.7574L1.60251e-07 3.24264C2.77079e-07 0.569925 3.23143 -0.768576 5.12132 1.12132L47.8787 43.8787Z" />
                </svg>
              </div>
            </div>

            {/* Help / Info */}
            <div className={`help mx-3`} onClick={()=>{setPromptNo(1); setProfileOpen(false)}} disabled={isThinking || isListening} >
              <svg className=''  viewBox="0 0 30 46"  xmlns="http://www.w3.org/2000/svg">
                <path d="M25.5535 3.07226C28.5209 5.19229 30 8.32743 30 12.4956C30 14.6786 29.2741 16.7986 27.8312 18.8468C27.4138 19.5295 25.8984 20.8949 23.2759 22.9431L20.8984 24.4792C19.5191 25.6381 18.6933 26.6621 18.412 27.5515C18.2033 28.0995 18.0672 28.8451 17.9946 29.8063C17.9946 30.2824 17.7223 30.5249 17.1688 30.5249H10.5445C9.99093 30.5249 9.71869 30.3183 9.71869 29.9141C9.85481 26.5723 10.3358 24.4523 11.1706 23.5629C11.7241 22.8083 12.5499 21.9909 13.657 21.1015C14.7641 20.2122 15.726 19.4935 16.5517 18.9546L17.7949 18.2359C18.5572 17.6879 19.1379 17.113 19.5554 16.4932C20.5172 14.993 21.0073 13.7982 21.0073 12.9089C21.0073 11.5434 20.5626 10.2139 19.6642 8.91134C18.7024 7.68064 17.1143 7.06978 14.9093 7.06978C12.5681 7.06978 10.9437 7.82437 10.0454 9.32456C9.08348 10.7619 8.59347 12.325 8.59347 14.0318H0C0.208711 8.49811 2.16878 4.53652 5.89837 2.14699C8.31216 0.718656 11.1706 0 14.4828 0C18.9655 0 22.6588 1.02409 25.5535 3.07226ZM14.3829 35.6453C15.8984 35.6453 17.1597 36.1574 18.1579 37.1815C19.1561 38.2056 19.628 39.4722 19.5554 40.9724C19.4828 42.5444 18.9383 43.7931 17.9038 44.7094C16.8693 45.6257 15.5898 46.0569 14.0744 45.994C12.559 45.994 11.2976 45.4999 10.2995 44.5118C9.30127 43.5236 8.8294 42.239 8.902 40.667C8.97459 39.0949 9.51906 37.8462 10.5535 36.9299C11.588 36.0137 12.8584 35.5735 14.3829 35.6453Z" />
              </svg>
            </div>

            {/* Logout Button */}
            <div className='logout-button m-2 mx-4 me-sm-4 p-1' 
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

              <span className='logout-button-text d-none d-sm-inline '>Logout</span>
              <svg className='logout-svg ms-sm-3' viewBox="0 0 20 20"  xmlns="http://www.w3.org/2000/svg">
                <path d="M7 19L3 19C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17L1 3C1 2.46957 1.21072 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1L7 1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 15L19 10L14 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 10H7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

          </Popup> }
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




  // //wary of updating current value when debouncing, delay causes inconsistencies.
  // const handleDisplayNameChange = useCallback(debounce((e) => {
  //     const val = e.target.value;
  //     if (auth.currentUser) {
  //       console.log('RUNNING');
  //       updateProfile(auth.currentUser, {
  //         displayName: val,
  //       })
  //       .then(() => {
  //         console.log('Profile updated!');
  //         set(
  //           ref(dbRef.current, `users/${auth.currentUser.uid}/displayName`),
  //           val
  //         );
  //       })
  //       .then(() => {
  //         console.log('User updated!');
  //       })
  //       .catch((error) => {
  //         console.error('An error occurred: ', error);
  //       });
  //     }
  //   }, 2500),
  // [auth]);