import React, {useState, useRef, useCallback, useEffect } from 'react'
import { signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, set, update, remove, onValue, off } from 'firebase/database';
import { useCliveContext } from '../Context/CliveStateContext';
import { debounce } from 'lodash';

import Popup from './Popup';

export default function Profile({ userData, setUserData, auth, connectionRef, setConnectionRef }) {

  const { isListening, isThinking, setPromptNo } = useCliveContext();

  const dbRef = useRef(getDatabase()); 
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
        


        {/* Logged In --> Profile Icon + Logout Button*/}
        { userData &&
          <>
          {/* Profile Icon */}
          <div className={`profile-icon`}
               style={{top: `${profileOpen ? '3rem' : '.4rem'}`, 
                       right: `${profileOpen ? '315px' : '.85rem'}`, 
                       position: `${profileOpen ? 'fixed' : 'absolute'}`}} 
               onClick={()=>setProfileOpen((curr)=>!curr)}>
                {/* FIX -not setting on sign up */}
                <div className='profile-letter'>
                  {userData.displayName?.charAt(0)} 

                </div>
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
                 message={'Signing out..'}
                 maxWidth={'400px'} /> }
        { isJustSignedOut && 
          <Popup show={setJustSignedOut} 
                  message={"Signed out"} 
                  classes={'fade-anim'} 
                  timeout={2200} 
                  maxWidth={'400px'} /> }

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