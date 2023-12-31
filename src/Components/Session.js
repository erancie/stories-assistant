import React, {useCallback, useState, useRef, useEffect } from 'react'
import axios from 'axios';
import { getDatabase, ref, update, set, onValue, off } from 'firebase/database';
import { useCliveContext } from '../Context/CliveStateContext';

//Speech Rec. - should this be in Session comp?
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()
recognition.continuous = true
recognition.interimResults = true
recognition.lang = 'en-US'



function Session({ userData,
                    currentSession, 
                    setCurrentSession, 
                    userOwnedSessions
                  }) {  
  const dbRef = useRef(getDatabase()); 

  const { highlight, isListening, isThinking, promptNo, setPromptNo, setHighlight, setIsListening, setIsThinking } = useCliveContext();
  const [text, setText ] = useState('')
  const [title, setTitle ] = useState('')
  const [transcript, setTranscript ] = useState('')
  const [previousText, setPreviousText] = useState('');

  //Speech rec. setup 
  useEffect(()=>{
    //recognition
    recognition.onstart = () => console.log('recognition.onstart()')
    //onresult sets transcript while listening - before onend  
    recognition.onresult = event => { 
      const transcript = Array.from(event.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('')
      setTranscript(' '+transcript);
      //super expensive update db from here? =D
      //does this onerror need to be in onresult?
      recognition.onerror = event => console.log(event.error) 
    }
    //try out here?
  }, [])

  //Handle listening for speech
  useEffect(()=>{
    const handleListen = () => {
      if(isListening){                                   
        recognition.start(); 
        recognition.onend = () => {                       
          recognition.start(); 
        }
      }else {
        recognition.stop();  
        //onend when stopped adds transcript from listening to text
        recognition.onend =()=> { 
          setPreviousText(text) //text set everytime mic clicked
          const newText = text + transcript
          set(ref(dbRef.current, `sessions/${currentSession}/text`), newText);
          setTranscript('')
        }
      }
    }
    handleListen(); 
  }, [isListening])

  //Clive Completion
  async function getAnswer() {
    try {
      setIsThinking(true)
      const requestBody = { text }; 
      let postURL ='https://us-central1-quickstories.cloudfunctions.net/chatgpt' 
      if (process.env.NODE_ENV === 'development') {  //functions emulator endpoint with client development
       postURL ='http://127.0.0.1:5001/quickstories/us-central1/chatgpt' 
      }
      let response = await axios.post( postURL, requestBody );
      const result = response.data.result;
      setPreviousText(text);
      const newText = text + ' ' + result;
      set(ref(dbRef.current, `sessions/${currentSession}/text`), newText);
      setIsThinking(false)
    } 
    catch (error) {
      console.log(error)
      setIsThinking(false)
    }
  }
  
  //Undo last setText from speech and completion
  const undo = () => { //broken 
    setHighlight(true);
    setTimeout(() => {
      setHighlight(false);
    }, 300);
    set(ref(dbRef.current, `sessions/${currentSession}/text`), previousText);
  };

  //Listen when session title changes
  useEffect(() => {
    const db = dbRef.current;
    // Listen for changes in the '/title' node
    onValue(ref(dbRef.current, `sessions/${currentSession}/title`), updateTitleFromDB);
    function updateTitleFromDB (snapshot) {  
      const data = snapshot.val();
      if(data === null) setCurrentSession(null)
      else setTitle(data)
    };
    return () => { 
      // console.log('Cleaning up title listener');
      off(ref(db, `sessions/${currentSession}/title`), 'value', updateTitleFromDB);
    };
  }, [currentSession]);

  //Listen when session text changes
  useEffect(() => {
    const db = dbRef.current;
    // Listen for changes in the '/text' node
    onValue(ref(dbRef.current, `sessions/${currentSession}/text`), updateTextFromDB);
    function updateTextFromDB (snapshot) { 
      const data = snapshot.val();
      //fix wiping shared Text when brand new client hits undo
      // setPreviousText(data) //fixes, breaks undo VVVVVVV
      if(data === null) setCurrentSession(null) 
          //check if deleted (made null) by other clients - if so wipe session so cant set() new val in handleTextChange with sessionId and reinstate node
      else setText(data)
    };
    return () => { 
      // console.log('Cleaning up text listener');
      off(ref(db, `sessions/${currentSession}/text`), 'value', updateTextFromDB);
    };
  }, [currentSession]);

  //Utility
  const checkIsSessionOwned = useCallback(()=> {
    let isSessionOwned;
    for (let key in userOwnedSessions) {
      // console.log('key:')
      // console.log(key)
      if( key === currentSession){
        isSessionOwned = true;
      }
    }
    return isSessionOwned
  }, [userOwnedSessions, currentSession])

  //Delete Session 
  const deleteSession = useCallback((sessionId, uid)=>{
    //permission - check if session is currently owned (put this check in backend?)
    if( checkIsSessionOwned() ){
      console.log('currentSession IS in ownedSessions')
      const updates = {};
      updates['/sessions/' + sessionId] = null; //delete
      updates['/users/' + uid + '/ownedSessions/' + sessionId] = null; 
      update(ref(dbRef.current), updates)
      .then(()=> {
        console.log("Remove succeeded.")
        console.log(sessionId)
      })
      .catch((e)=> {
        console.log("Remove failed: " + e.message)
      });
      // set(ref(dbRef.current, `sessions/${sessionId}`), null); //other way to delete - make null
      setCurrentSession(null)
    }else{
      console.log('currentSession IS NOT in ownedSessions')
    }
  },[checkIsSessionOwned]) 

  //Handle Session Text Change > Resets when Current Session changes
  const handleTextChange = useCallback((e) => {
    setPreviousText(e.target.value);
    set(ref(dbRef.current, `sessions/${currentSession}/text`), e.target.value);
  }, [currentSession])

  
  //Walkthrough Elements /////////////////
  const WalkthroughSpeak=()=> { //
    return (
      <div className='walkthrough-bg popup-bg-style' onClick={()=>setPromptNo(3)} >
        <div className='walkthrough popup-style p-2' onClick={(e)=>e.stopPropagation()} >
            <p className='py-4 col-10 m-auto'>Turn the mic green to speak..</p>
            <div style={{height: 120}}></div>
            <p className='pt-4 py-3 col-9 m-auto'>..turn it off again when you finish speaking.</p>
            <div className='next-button' onClick={()=>setPromptNo(curr=>curr+1)}>Next</div>
        </div>
      </div>
    )
  }

  const WalkthroughThink=()=> { //
    return (
      <div className='walkthrough-bg popup-bg-style' onClick={()=>setPromptNo(3)}>
        <div className='walkthrough popup-style p-2' onClick={(e)=>e.stopPropagation()}>
            <p className='py-4 col-10 m-auto'>Each time you press the thought bubble..</p>
            <div style={{height: 120}}></div>
            <p className='pt-4 py-3 col-9 m-auto'> ..Clive will add an idea.</p>
            <div className='next-button' onClick={()=>setPromptNo(curr=>curr+1)}>Next</div>
        </div>
      </div>
    )
  }

  const Walkthrough = ()=> {
    if (promptNo===1) {
      return <WalkthroughSpeak />
    }
    else if (promptNo===2) {
      return <WalkthroughThink />
    }
    else return null
  }

  return (
    <>
      <Walkthrough />

      {/* Controls  -*/}
      <div className='controls-secondary' > 
        <button  className={`help button col-12`} onClick={()=>setPromptNo(1)} disabled={isThinking || isListening}  >
          <svg className='' viewBox="0 0 30 46"  xmlns="http://www.w3.org/2000/svg">
            <path d="M25.5535 3.07226C28.5209 5.19229 30 8.32743 30 12.4956C30 14.6786 29.2741 16.7986 27.8312 18.8468C27.4138 19.5295 25.8984 20.8949 23.2759 22.9431L20.8984 24.4792C19.5191 25.6381 18.6933 26.6621 18.412 27.5515C18.2033 28.0995 18.0672 28.8451 17.9946 29.8063C17.9946 30.2824 17.7223 30.5249 17.1688 30.5249H10.5445C9.99093 30.5249 9.71869 30.3183 9.71869 29.9141C9.85481 26.5723 10.3358 24.4523 11.1706 23.5629C11.7241 22.8083 12.5499 21.9909 13.657 21.1015C14.7641 20.2122 15.726 19.4935 16.5517 18.9546L17.7949 18.2359C18.5572 17.6879 19.1379 17.113 19.5554 16.4932C20.5172 14.993 21.0073 13.7982 21.0073 12.9089C21.0073 11.5434 20.5626 10.2139 19.6642 8.91134C18.7024 7.68064 17.1143 7.06978 14.9093 7.06978C12.5681 7.06978 10.9437 7.82437 10.0454 9.32456C9.08348 10.7619 8.59347 12.325 8.59347 14.0318H0C0.208711 8.49811 2.16878 4.53652 5.89837 2.14699C8.31216 0.718656 11.1706 0 14.4828 0C18.9655 0 22.6588 1.02409 25.5535 3.07226ZM14.3829 35.6453C15.8984 35.6453 17.1597 36.1574 18.1579 37.1815C19.1561 38.2056 19.628 39.4722 19.5554 40.9724C19.4828 42.5444 18.9383 43.7931 17.9038 44.7094C16.8693 45.6257 15.5898 46.0569 14.0744 45.994C12.559 45.994 11.2976 45.4999 10.2995 44.5118C9.30127 43.5236 8.8294 42.239 8.902 40.667C8.97459 39.0949 9.51906 37.8462 10.5535 36.9299C11.588 36.0137 12.8584 35.5735 14.3829 35.6453Z" />
          </svg>
        </button>
        {/* Disbale undo on !currentSesison */}
        <button className={`undo button col-12 ${highlight ? 'highlight' : ''}`} onClick={undo} disabled={isThinking || isListening || !currentSession} >
          <svg className={` `} viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg">
            <path d="M23.0472 7.3438C22.4119 5.86449 21.5577 4.58839 20.4849 3.5156C19.4119 2.44275 18.1359 1.58866 16.6565 0.953098C15.1774 0.317535 13.6255 0 12.0004 0C10.4692 0 8.98754 0.288803 7.55505 0.867064C6.12288 1.44522 4.84942 2.26029 3.73478 3.3125L1.70329 1.29657C1.39074 0.973621 1.03151 0.900777 0.625099 1.07771C0.208348 1.25504 0 1.56245 0 1.99989V9.00005C0 9.27085 0.0990024 9.50525 0.296952 9.70315C0.495012 9.90111 0.72941 10.0001 1.0002 10.0001H8.00026C8.43786 10.0001 8.7451 9.79176 8.9222 9.37505C9.09919 8.9688 9.02634 8.60951 8.70334 8.29685L6.56267 6.14065C7.29208 5.4531 8.12531 4.92447 9.06279 4.55462C10.0003 4.18482 10.9794 3.99978 12.0003 3.99978C13.0835 3.99978 14.1176 4.21092 15.1019 4.63261C16.0865 5.05456 16.9377 5.62489 17.6566 6.3437C18.3754 7.06234 18.9457 7.91386 19.3676 8.89837C19.7892 9.88277 20.0003 10.9165 20.0003 12.0001C20.0003 13.0836 19.7893 14.1173 19.3676 15.1016C18.9457 16.086 18.3754 16.9374 17.6566 17.6563C16.9377 18.3751 16.0862 18.9456 15.1019 19.3674C14.1176 19.7892 13.0835 20.0001 12.0003 20.0001C10.7607 20.0001 9.58878 19.7293 8.48454 19.1878C7.38046 18.6463 6.44818 17.8807 5.68774 16.8907C5.6149 16.7866 5.49504 16.7239 5.32834 16.703C5.17204 16.703 5.04179 16.7498 4.93764 16.8434L2.79702 18.9998C2.71378 19.0836 2.66951 19.1902 2.66425 19.3202C2.65911 19.4507 2.69309 19.5678 2.76594 19.6719C3.90148 21.047 5.27635 22.1121 6.89093 22.8671C8.5055 23.6222 10.2088 24 12.0004 24C13.6255 24 15.1774 23.6821 16.6565 23.0468C18.1359 22.4116 19.4115 21.5571 20.4847 20.4844C21.5576 19.4112 22.4117 18.1354 23.0471 16.6562C23.6826 15.177 24 13.6247 24 11.9999C24.0001 10.3746 23.6824 8.82306 23.0472 7.3438Z" />
          </svg>
        </button>
      </div>

      <div className={`controls ${(promptNo!==3)&&'controls-popup-active'} ${(promptNo===1) && ' prompt-1'} ${(promptNo===2) && ' prompt-2'}`} >
        <button className={`speak button col-12 mb-3`} 
                onClick = {(promptNo!==3) ? ()=>setPromptNo(1) : ()=>setIsListening(curr=>!curr)} 
                disabled={isThinking || (!currentSession && (promptNo===3))} >
          <svg className={`${isListening && 'listening'}`} viewBox="0 0 85 126" xmlns="http://www.w3.org/2000/svg">
            <path d="M65.41 63.486C65.41 74.417 56.5549 83.285 45.6189 83.285H38.408C27.487 83.285 18.627 74.417 18.627 63.486V19.789C18.626 8.859 27.486 0 38.408 0H45.6189C56.5549 0 65.41 8.859 65.41 19.789V63.486Z" />
            <path d="M77.963 37.5371C74.609 37.5371 71.891 40.2561 71.891 43.6091V68.8731C71.889 71.6331 71.264 74.2311 70.102 76.6561C68.363 80.2831 65.368 83.5121 61.46 85.8331C57.556 88.1531 52.772 89.5491 47.553 89.5481H36.475C29.53 89.5521 23.342 87.0621 18.989 83.2291C16.812 81.3141 15.098 79.0751 13.934 76.6551C12.771 74.2311 12.146 71.6331 12.144 68.8741V43.6091C12.144 40.2551 9.425 37.5371 6.072 37.5371C2.719 37.5371 2.78054e-06 40.2561 2.78054e-06 43.6091V68.8731C-0.00199722 73.5021 1.075 77.9411 2.99 81.9181C5.865 87.8911 10.579 92.8271 16.377 96.2731C21.609 99.3811 27.754 101.275 34.323 101.62V120.495C34.323 123.539 36.793 126 39.841 126H44.201C47.237 126 49.721 123.539 49.721 120.495V101.629C58.722 101.153 66.912 97.7631 73.074 92.3471C76.398 89.4221 79.137 85.8971 81.05 81.9161C82.964 77.9391 84.039 73.5011 84.037 68.8731V43.6091C84.036 40.2551 81.317 37.5371 77.963 37.5371Z" />
          </svg>
        </button>
        <button className={`think button col-12`} 
                //move this and make 3rd function for popup to prompt joining session if !currentSession (then remove !currentSesison from disabled)
                onClick={ (promptNo!==3) ? ()=>setPromptNo(2) : getAnswer} 
                disabled={isThinking || isListening || (!currentSession && (promptNo===3)) } >
          <svg className={`${isThinking && 'thinking'}`} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.86 5.62457C17.898 4.57039 15.718 4.01619 13.5 4.01619C6.05597 4.01619 0 10.0963 0 17.57C0 25.0436 6.05597 31.1237 13.5 31.1237H13.616C14.828 34.1557 17.706 36.1436 21 36.1436C24.048 36.1436 26.814 34.3746 28.148 31.6578C29.406 31.969 30.698 32.1276 32 32.1276C40.8219 32.1276 48 24.9211 48 16.0639C48 1.33982 29.1671 -5.31918 19.86 5.62457Z" />
            <path d="M14 36.1445C11.794 36.1445 10 37.9457 10 40.1605C10 42.3753 11.794 44.1765 14 44.1765C16.2061 44.1765 18.0001 42.3753 18.0001 40.1605C18.0001 37.9457 16.2061 36.1445 14 36.1445Z" />
            <path d="M5 42.168C3.34597 42.168 2 43.5193 2 45.1799C2 46.8405 3.34597 48.1919 5 48.1919C6.65403 48.1919 8 46.8405 8 45.1799C8 43.5193 6.65403 42.168 5 42.168Z" />
          </svg>
        </button>
      </div>

      {currentSession 
        ?
        <div className='session'>
          <div className='session-header'>
            <div className='session-title'>{title}</div>
            { checkIsSessionOwned() &&
            <button className='delete-session' onClick={(e)=>deleteSession(currentSession, userData.uid)}>
              Delete
            </button>}
            <button className='leave-session' onClick={()=>setCurrentSession(null)}>
              Leave
            </button>
          </div>

          <textarea
            placeholder={ `Speak or type to start making somehing cool with Clive!` }
            className='text' 
            type="text" 
            name='text' 
            onChange={handleTextChange} 
            value={ text + transcript } 
            disabled={isThinking || isListening || !currentSession}
          >      
          </textarea>

        </div>
        :
        <p className='p-5' style={{color: 'rgb(95, 166, 134)'}}>Join a session to chat with Clive</p>
      }
    </> 
  )
}

// export default React.memo(Session)
export default Session