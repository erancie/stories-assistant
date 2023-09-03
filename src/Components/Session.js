import React, {useCallback, useState, useRef, useEffect } from 'react'
import axios from 'axios';
import { getDatabase, ref, update, set, onValue, off } from 'firebase/database';
import { useCliveContext } from '../Context/CliveStateContext';

import { useAuth } from '../Context/AuthContext';


//Speech Rec. - define this once - pass in recognition from App?
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()
recognition.continuous = true
recognition.interimResults = true
recognition.lang = 'en-US'



function Session({  sessionElRef,
                    currentSession, 
                    setCurrentSession, 
                    userOwnedSessions,
                    createSession,
                    activeSessionUsers,
                    setActiveSessionUsers,
                    leaveSession
                  }) {  

  const dbRef = useRef(getDatabase()); 
  const { userData } = useAuth() 

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
  async function getAnswer(prompt, currentSession) {
    try {
      setIsThinking(true)
      const requestBody = { prompt }; 
      let postURL ='https://us-central1-quickstories.cloudfunctions.net/chatgpt' 
      if (process.env.NODE_ENV === 'development') {  //functions emulator endpoint with client development
       postURL ='http://127.0.0.1:5001/quickstories/us-central1/chatgpt' 
      }
      let response = await axios.post( postURL, requestBody );
      const result = response.data.result;
      setPreviousText(prompt);
      const newText = prompt + ' ' + result;
      set(ref(dbRef.current, `sessions/${currentSession}/text`), newText);
      setIsThinking(false)
    } 
    catch (error) {
      console.log(error)
      setIsThinking(false)
    }
  }
  
  //Undo last setText set by speech and completion
  const undo = () => { //broken 
    setHighlight(true);
    setTimeout(() => {
      setHighlight(false);
    }, 300);
    set(ref(dbRef.current, `sessions/${currentSession}/text`), previousText);
  };

  //Listen when Session title changes
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
  

  //Listen when Session text changes
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

  //Check if seeeison is owned by current user
  const isSessionOwned = useCallback(()=> {
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
    if( isSessionOwned() ) {
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
    } else {
      console.log('currentSession IS NOT in ownedSessions')
    }
  },[isSessionOwned]) 

  //Handle Session Text Change > Resets when Current Session changes
  const handleTextChange = useCallback((e) => {
    setPreviousText(e.target.value);
    set(ref(dbRef.current, `sessions/${currentSession}/text`), e.target.value);
  }, [currentSession])
  
  //Handle Session Title Change > Resets when Current Session changes
  const handleTitleChange = useCallback((e) => {
    set(ref(dbRef.current, `sessions/${currentSession}/title`), e.target.value);
  }, [currentSession])

 

  const starters = [
    {
      name: 'Stoytelling Assistant',
      icon: <svg className='starter-icon storytelling' viewBox="0 0 45 45"  xmlns="http://www.w3.org/2000/svg">
              <path d="M25.5805 21.3407C25.6436 21.464 25.7396 21.5675 25.8577 21.6397C25.9759 21.712 26.1117 21.7502 26.2502 21.7502C26.3684 21.7502 26.4848 21.7221 26.59 21.6685C26.6342 21.646 31.0488 19.4035 33.226 18.7157C33.6205 18.5905 33.8394 18.169 33.7142 17.7745C33.6846 17.6805 33.6368 17.5932 33.5735 17.5177C33.5102 17.4422 33.4326 17.3799 33.3451 17.3345C33.2577 17.289 33.1622 17.2612 33.064 17.2526C32.9658 17.2441 32.8669 17.255 32.773 17.2848C30.4795 18.0101 26.095 20.2375 25.909 20.332C25.54 20.5195 25.393 20.9711 25.5805 21.3407ZM26.2502 12.7504C26.3684 12.7503 26.4848 12.7223 26.59 12.6686C26.6342 12.6461 31.0488 10.4036 33.226 9.71589C33.6205 9.59064 33.8394 9.16912 33.7142 8.77467C33.6846 8.68066 33.6368 8.59341 33.5735 8.5179C33.5102 8.44239 33.4326 8.38011 33.3451 8.33462C33.2577 8.28913 33.1622 8.26133 33.064 8.25281C32.9658 8.24429 32.8669 8.25521 32.773 8.28495C30.4795 9.01022 26.095 11.2377 25.909 11.3322C25.5401 11.5197 25.393 11.9711 25.5805 12.3409C25.6436 12.4642 25.7396 12.5676 25.8577 12.6399C25.9759 12.7121 26.1117 12.7504 26.2502 12.7504Z" />
              <path d="M44.2497 11.2504C44.1512 11.2503 44.0536 11.2697 43.9626 11.3074C43.8716 11.3451 43.7889 11.4003 43.7193 11.47C43.6496 11.5396 43.5944 11.6223 43.5567 11.7133C43.5191 11.8043 43.4997 11.9018 43.4997 12.0003V41.2501C43.4997 42.4906 42.4902 43.5001 41.2497 43.5001H23.2499V41.7744C24.3434 41.3919 27.1918 40.5001 29.9998 40.5001C36.533 40.5001 40.9693 41.9469 41.0135 41.9618C41.1262 41.9989 41.2461 42.0088 41.3634 41.9908C41.4807 41.9728 41.592 41.9274 41.6885 41.8583C41.7849 41.7888 41.8633 41.6975 41.9174 41.5917C41.9716 41.4859 41.9997 41.3688 41.9997 41.25V8.25042C41.9999 8.07974 41.9418 7.91412 41.835 7.78099C41.7282 7.64786 41.5791 7.55521 41.4124 7.51839C41.4124 7.51839 40.8244 7.38717 39.8194 7.2026C39.4136 7.12763 39.0215 7.39763 38.9464 7.80412C38.8714 8.2121 39.1406 8.60286 39.5479 8.67783C39.8656 8.73611 40.1829 8.79687 40.4997 8.86011V40.2533C38.8002 39.8078 35.0262 39.0001 29.9997 39.0001C26.732 39.0001 23.5221 40.0733 22.529 40.4371C21.6462 40.0472 18.9778 39.0001 15.7498 39.0001C10.5838 39.0001 6.32834 39.8521 4.49988 40.2849V8.83085C5.99761 8.46259 10.4211 7.50037 15.7498 7.50037C18.4843 7.50037 20.8295 8.35158 21.7498 8.73637V38.2502C21.7498 38.3829 21.7851 38.5132 21.852 38.6279C21.9189 38.7425 22.015 38.8374 22.1305 38.9027C22.2461 38.9681 22.3769 39.0016 22.5096 38.9999C22.6423 38.9982 22.7722 38.9612 22.886 38.8929C22.9603 38.8487 30.3912 34.4102 36.9866 32.2119C37.136 32.1622 37.266 32.0667 37.3581 31.9389C37.4501 31.8112 37.4997 31.6577 37.4996 31.5002V0.750422C37.4996 0.629188 37.4702 0.509768 37.4139 0.402401C37.3576 0.295033 37.2761 0.202921 37.1764 0.133962C37.0768 0.0647769 36.9619 0.0207877 36.8416 0.00577005C36.7213 -0.00924757 36.5992 0.00515506 36.4857 0.0477416C30.485 2.29843 24.4131 6.0769 24.3523 6.11443C24.0012 6.33416 23.894 6.7969 24.1137 7.14793C24.3328 7.49896 24.7955 7.60619 25.1472 7.38646C25.2027 7.35122 30.485 4.06475 35.9996 1.84702V30.9633C30.8801 32.7423 25.5349 35.647 23.2497 36.9475V8.25042C23.2497 8.11107 23.2109 7.97447 23.1376 7.85593C23.0644 7.73738 22.9596 7.64156 22.8349 7.57921C22.7059 7.51549 19.6325 6.00044 15.7498 6.00044C8.97286 6.00044 3.76266 7.46671 3.54363 7.52964C3.38698 7.57436 3.24915 7.66891 3.15104 7.79896C3.05292 7.92902 2.99985 8.0875 2.99986 8.25042V41.2502C3.00007 41.3661 3.02706 41.4805 3.07871 41.5843C3.13035 41.6881 3.20527 41.7786 3.29763 41.8487C3.42787 41.9471 3.58667 42.0003 3.74991 42.0002C3.81891 42.0002 3.8879 41.9905 3.9554 41.971C4.00717 41.9567 9.19338 40.5002 15.7498 40.5002C18.4918 40.5002 20.8347 41.3537 21.7498 41.7369V43.5002H3.74991C2.50943 43.5002 1.49993 42.4907 1.49993 41.2502V12.0004C1.49993 11.5865 1.16393 11.2505 0.749965 11.2505C0.336003 11.2505 0 11.5865 0 12.0004V41.2502C0 43.3179 1.68221 45.0002 3.75 45.0002H41.2497C43.3174 45.0002 44.9997 43.318 44.9997 41.2502V12.0004C44.9998 11.9019 44.9804 11.8044 44.9427 11.7134C44.905 11.6223 44.8498 11.5397 44.7801 11.47C44.7104 11.4003 44.6278 11.3451 44.5367 11.3074C44.4457 11.2697 44.3482 11.2503 44.2497 11.2504Z" />
              <path d="M25.5803 16.8409C25.6434 16.9642 25.7394 17.0677 25.8575 17.1399C25.9757 17.2122 26.1115 17.2504 26.25 17.2504C26.3682 17.2503 26.4846 17.2223 26.5898 17.1686C26.634 17.1461 31.0486 14.9036 33.2258 14.2159C33.6203 14.0906 33.8392 13.6691 33.714 13.2747C33.6844 13.1807 33.6366 13.0934 33.5733 13.0179C33.51 12.9424 33.4324 12.8801 33.345 12.8346C33.2575 12.7891 33.162 12.7613 33.0638 12.7528C32.9656 12.7443 32.8667 12.7552 32.7728 12.785C30.4793 13.5102 26.0948 15.7377 25.9088 15.8322C25.5398 16.0197 25.3928 16.4712 25.5803 16.8409ZM25.5803 25.8408C25.6434 25.9641 25.7394 26.0676 25.8575 26.1398C25.9757 26.2121 26.1115 26.2503 26.25 26.2503C26.3682 26.2502 26.4846 26.2222 26.5898 26.1686C26.634 26.1461 31.0486 23.9036 33.2258 23.2158C33.6203 23.0906 33.8392 22.6691 33.714 22.2746C33.6844 22.1806 33.6366 22.0933 33.5733 22.0178C33.51 21.9423 33.4324 21.88 33.345 21.8345C33.2575 21.7891 33.162 21.7613 33.0638 21.7527C32.9656 21.7442 32.8667 21.7551 32.7728 21.7849C30.4793 22.5101 26.0948 24.7376 25.9088 24.8321C25.5398 25.0196 25.3928 25.4712 25.5803 25.8408ZM18.1704 13.919C13.5392 12.8322 8.27645 14.2168 8.05523 14.276C7.95894 14.3005 7.86847 14.3438 7.78906 14.4035C7.70966 14.4632 7.6429 14.5381 7.59268 14.6238C7.54245 14.7095 7.50975 14.8044 7.49647 14.9028C7.4832 15.0013 7.48961 15.1014 7.51535 15.1974C7.54108 15.2933 7.58562 15.3832 7.64637 15.4618C7.70713 15.5404 7.7829 15.6062 7.86927 15.6553C7.95565 15.7043 8.05092 15.7358 8.14954 15.7477C8.24817 15.7597 8.34819 15.752 8.4438 15.725C8.49407 15.7107 13.561 14.378 17.8285 15.3792C18.2297 15.473 18.6355 15.2232 18.73 14.8197C18.8244 14.417 18.5739 14.0135 18.1704 13.919ZM18.1704 18.419C13.5392 17.333 8.27645 18.7167 8.05523 18.776C7.95894 18.8004 7.86847 18.8438 7.78906 18.9035C7.70966 18.9632 7.6429 19.0381 7.59268 19.1238C7.54245 19.2095 7.50975 19.3043 7.49647 19.4028C7.4832 19.5013 7.48961 19.6014 7.51535 19.6973C7.54108 19.7933 7.58562 19.8832 7.64637 19.9618C7.70713 20.0404 7.7829 20.1061 7.86927 20.1552C7.95565 20.2043 8.05092 20.2357 8.14954 20.2477C8.24817 20.2597 8.34819 20.2519 8.4438 20.2249C8.49407 20.2107 13.561 18.8779 17.8285 19.8792C18.2297 19.9729 18.6355 19.7232 18.73 19.3197C18.8244 18.9169 18.5739 18.5134 18.1704 18.419ZM25.5803 30.3408C25.6434 30.4641 25.7394 30.5675 25.8575 30.6398C25.9757 30.7121 26.1115 30.7503 26.25 30.7503C26.3682 30.7502 26.4846 30.7222 26.5898 30.6685C26.634 30.646 31.0486 28.4035 33.2258 27.7158C33.6203 27.5905 33.8392 27.169 33.714 26.7746C33.6844 26.6806 33.6366 26.5933 33.5733 26.5178C33.51 26.4423 33.4324 26.38 33.345 26.3345C33.2575 26.289 33.162 26.2612 33.0638 26.2527C32.9656 26.2442 32.8667 26.2551 32.7728 26.2848C30.4793 27.0101 26.0948 29.2376 25.9088 29.3321C25.5398 29.5195 25.3928 29.9711 25.5803 30.3408ZM18.1704 22.9189C13.5392 21.833 8.27645 23.2159 8.05523 23.2759C7.86312 23.3275 7.69934 23.4532 7.5999 23.6255C7.50047 23.7978 7.47353 24.0025 7.525 24.1946C7.56771 24.3541 7.66175 24.495 7.79258 24.5956C7.92341 24.6961 8.08374 24.7508 8.24877 24.7512C8.31328 24.7512 8.37849 24.7422 8.4438 24.7249C8.49407 24.7106 13.561 23.3779 17.8285 24.3791C18.2297 24.4729 18.6355 24.2231 18.73 23.8196C18.8244 23.4169 18.5739 23.0134 18.1704 22.9189ZM18.1704 31.9189C13.5392 30.8321 8.27645 32.2166 8.05523 32.2759C7.86312 32.3274 7.69934 32.4532 7.5999 32.6254C7.50047 32.7977 7.47353 33.0024 7.525 33.1946C7.56771 33.354 7.66175 33.4949 7.79258 33.5955C7.92341 33.6961 8.08374 33.7508 8.24877 33.7511C8.31328 33.7511 8.37849 33.7421 8.4438 33.7248C8.49407 33.7106 13.561 32.3778 17.8285 33.3791C18.2297 33.472 18.6355 33.2231 18.73 32.8195C18.8244 32.4168 18.5739 32.0133 18.1704 31.9189ZM18.1704 27.4189C13.5392 26.3321 8.27645 27.7159 8.05523 27.7759C7.86312 27.8275 7.69934 27.9532 7.5999 28.1255C7.50047 28.2978 7.47353 28.5025 7.525 28.6946C7.56771 28.854 7.66175 28.9949 7.79258 29.0955C7.92341 29.1961 8.08374 29.2508 8.24877 29.2511C8.31328 29.2511 8.37849 29.2422 8.4438 29.2249C8.49407 29.2106 13.561 27.8778 17.8285 28.8791C18.2297 28.9729 18.6355 28.7231 18.73 28.3196C18.8244 27.9169 18.5739 27.5134 18.1704 27.4189Z" />
            </svg>
      ,
      prompt: 'You are a story writing assistant. Start a chat by asking users: "What story do you need help telling?". Then offer guidance. \n \n'
    },
    {
      name: 'Casual Chat',
      icon: <svg className='starter-icon casual-chat' viewBox="0 0 34 31" xmlns="http://www.w3.org/2000/svg">
              <path d="M29.3734 25.724C29.3734 25.7383 29.3734 25.7525 29.3734 25.7811C29.3734 27.1072 30.0652 29.3031 30.4976 30.0589C30.5264 30.1444 30.5552 30.23 30.5552 30.3298C30.5552 30.7006 30.2526 31 29.8778 31C29.8202 31 29.7337 30.9857 29.7049 30.9857C29.6905 30.9857 29.6905 30.9857 29.6905 30.9857C27.3412 30.615 24.473 27.8914 23.9541 27.2783C23.4209 27.3496 23.075 27.3638 22.6282 27.3638C22.4408 27.3638 22.239 27.3638 22.0084 27.3638C17.6846 27.3638 14.2255 25.7525 12.1212 23.2001C12.1933 23.1288 15.6523 23.1288 15.1623 23.1573C16.9927 24.569 19.1258 25.2535 22.0084 25.2535C22.0084 25.2535 23.2047 25.2535 23.6515 25.1822L24.7757 25.011C24.7757 25.011 25.4819 26.2659 27.5574 27.7631C27.3988 27.0787 27.2835 24.3836 27.2835 24.3836L28.3356 23.8703C30.8147 22.6155 31.8812 20.9756 31.8812 18.7084C31.8812 16.8546 31.3623 15.5856 29.5463 14.345C29.7769 13.632 30.0075 12.8192 30.0652 12.0635C32.8757 13.6891 33.9999 15.8707 33.9999 18.7084C34.0143 21.7884 32.5442 24.127 29.3734 25.724ZM14.1102 20.9899C13.8363 20.9899 13.6057 20.9899 13.3895 20.9899C12.8851 20.9899 12.4671 20.9756 11.8618 20.8901C11.2708 21.603 7.26407 24.626 4.55446 25.0681C4.55446 25.0681 4.55446 25.0681 4.54005 25.0681C4.49681 25.0681 4.39592 25.0823 4.33827 25.0823C3.90588 25.0823 3.54556 24.7401 3.54556 24.3123C3.54556 24.1983 3.57439 24.0984 3.60321 24.0129C4.10766 23.1431 5.40482 21.0327 5.40482 19.4926C5.40482 19.4641 5.40482 19.4499 5.40482 19.4356C1.75837 17.5534 0 13.7746 0 10.2383C0 4.54876 6.21194 0 13.8796 0C21.5472 0 27.6294 4.54876 27.6294 10.2383C27.7159 16.6693 21.7778 20.9899 14.1102 20.9899ZM13.8796 2.09614C7.39379 2.09614 2.11869 5.70377 2.11869 10.224C2.11869 12.9333 3.44467 16.0419 6.38489 17.5248L7.53792 18.1095L7.43703 19.3928C7.43703 19.3928 7.46585 20.0345 6.74521 22.0593C7.92706 21.3178 9.29628 20.1914 9.61337 19.8349L10.9682 18.7226L12.15 18.8082C13.1733 18.9508 14.1534 18.9223 14.1534 18.9223C20.6392 18.9223 25.4531 15.2433 25.4819 10.224C25.5107 5.71803 20.3653 2.09614 13.8796 2.09614Z" />
              <path d="M7 10.5C7 11.3333 7.66667 12 8.5 12C9.33333 12 10 11.3333 10 10.5C10 9.66667 9.33333 9 8.5 9C7.66667 9 7 9.66667 7 10.5Z" />
              <path d="M13 10.5C13 11.3333 13.6667 12 14.5 12C15.3333 12 16 11.3333 16 10.5C16 9.66667 15.3333 9 14.5 9C13.6667 9 13 9.66667 13 10.5Z" />
              <path d="M19 10.5C19 11.3333 19.6667 12 20.5 12C21.3333 12 22 11.3333 22 10.5C22 9.66667 21.3333 9 20.5 9C19.6667 9 19 9.66667 19 10.5Z" />
            </svg>
      ,
      prompt: 'You are a casual conversationalist. Start a chat by asking users: "What do you like to do to chill out?" \n \n'
    },
    {
      name: 'The Comedian',
      icon: <svg className='starter-icon comedian' viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg">
              <path d="M12 24C5.37037 24 0 18.6296 0 12C0 5.37037 5.37037 0 12 0C18.6296 0 24 5.37037 24 12C24 18.6296 18.6296 24 12 24ZM12 1.11111C6 1.11111 1.11111 6 1.11111 12C1.11111 18 6 22.8889 12 22.8889C18 22.8889 22.8889 18 22.8889 12C22.8889 6 18 1.11111 12 1.11111ZM12 21C7.74074 21 4.03704 17.963 3.18518 13.7778C3.07407 13.2963 3.22222 12.8148 3.51852 12.4444C3.81482 12.0741 4.25926 11.8519 4.74074 11.8519H19.2963C19.7778 11.8519 20.2222 12.0741 20.5185 12.4444C20.8148 12.8148 20.9259 13.2593 20.8519 13.7407V13.8148C20 17.963 16.2593 21 12 21ZM4.74074 13C4.55556 13 4.44444 13.1111 4.37037 13.1852C4.2963 13.2963 4.25926 13.4444 4.25926 13.5926C5 17.2593 8.25926 19.8889 12 19.8889C15.7407 19.8889 19 17.2222 19.7407 13.5556V13.4815C19.7778 13.3704 19.7037 13.2222 19.6296 13.1852C19.5556 13.0741 19.4074 13 19.2593 13H4.74074ZM6.37037 9.81481C6.18519 9.55555 6.25926 9.22222 6.51852 9.03704L8.59259 7.66667L6.37037 6.07407C6.11111 5.88889 6.07407 5.55556 6.22222 5.2963C6.40741 5.03704 6.74074 5 7 5.14815L9.62963 7C9.85185 7.14815 9.96296 7.40741 9.96296 7.66667C9.96296 7.92593 9.81481 8.18518 9.59259 8.33333L7.11111 10C6.88889 10.1481 6.51852 10.0741 6.37037 9.81481ZM17.6296 9.81481C17.4444 10.0741 17.1111 10.1481 16.8519 9.96296L14.3704 8.33333C14.1481 8.18518 14.037 7.96296 14 7.66667C14 7.40741 14.1111 7.14815 14.3333 7L16.963 5.14815C17.2222 4.96296 17.5556 5.03704 17.7407 5.2963C17.9259 5.55556 17.8519 5.88889 17.5926 6.07407L15.3333 7.66667L17.4074 9.03704C17.7407 9.22222 17.8148 9.55555 17.6296 9.81481Z" />
            </svg>
       ,
      prompt: 'You are a comedian. Start a chat by asking users: "Have you heard any funny jokes lately?" If they answer no then offer one. \n \n'
    }
  ]

  const isDisabled = () => {
    if (!currentSession && (promptNo === 3)) return 'disabled-fill'
  }




  // const displaySessionUsers=()=>{
  //   const sessionUsers = []
  //   for (const uid in activeSessionUsers) {
  //       sessionUsers.push(<div key={uid} className='session-user user-thumb col-3 col-md-2 m-2 p-2'>{activeSessionUsers[uid]}</div>)
  //     }
  //   return sessionUsers
  // }
//   <div key={userId} className='user-thumb col-3 col-md-2 m-2 p-2'>
//   <p className='user-thumb-name '>{user.displayName ? user.displayName : 'User'}</p>
// </div>

  return (
    <>

    <div ref={sessionElRef} className='session m-2 mt-4 disable-caret'>

      {/* <h3 className={`menu-title p-3 pb-2 px-4`}>Current Session</h3> */}

      {/* Controls  -*/}
      <div className={`session-controls ${(promptNo!==3)&&'session-controls-popup-active'} ${(promptNo===1) && ' prompt-1'} ${(promptNo===2) && ' prompt-2'}`} >
        
        {(promptNo===3)&&
        <button className={`undo button col-12 mb-3 ${highlight ? 'highlight' : ''}`} onClick={undo} disabled={isThinking || isListening || !currentSession} >
          <svg className={isDisabled()} viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg">
            <path d="M23.0472 7.3438C22.4119 5.86449 21.5577 4.58839 20.4849 3.5156C19.4119 2.44275 18.1359 1.58866 16.6565 0.953098C15.1774 0.317535 13.6255 0 12.0004 0C10.4692 0 8.98754 0.288803 7.55505 0.867064C6.12288 1.44522 4.84942 2.26029 3.73478 3.3125L1.70329 1.29657C1.39074 0.973621 1.03151 0.900777 0.625099 1.07771C0.208348 1.25504 0 1.56245 0 1.99989V9.00005C0 9.27085 0.0990024 9.50525 0.296952 9.70315C0.495012 9.90111 0.72941 10.0001 1.0002 10.0001H8.00026C8.43786 10.0001 8.7451 9.79176 8.9222 9.37505C9.09919 8.9688 9.02634 8.60951 8.70334 8.29685L6.56267 6.14065C7.29208 5.4531 8.12531 4.92447 9.06279 4.55462C10.0003 4.18482 10.9794 3.99978 12.0003 3.99978C13.0835 3.99978 14.1176 4.21092 15.1019 4.63261C16.0865 5.05456 16.9377 5.62489 17.6566 6.3437C18.3754 7.06234 18.9457 7.91386 19.3676 8.89837C19.7892 9.88277 20.0003 10.9165 20.0003 12.0001C20.0003 13.0836 19.7893 14.1173 19.3676 15.1016C18.9457 16.086 18.3754 16.9374 17.6566 17.6563C16.9377 18.3751 16.0862 18.9456 15.1019 19.3674C14.1176 19.7892 13.0835 20.0001 12.0003 20.0001C10.7607 20.0001 9.58878 19.7293 8.48454 19.1878C7.38046 18.6463 6.44818 17.8807 5.68774 16.8907C5.6149 16.7866 5.49504 16.7239 5.32834 16.703C5.17204 16.703 5.04179 16.7498 4.93764 16.8434L2.79702 18.9998C2.71378 19.0836 2.66951 19.1902 2.66425 19.3202C2.65911 19.4507 2.69309 19.5678 2.76594 19.6719C3.90148 21.047 5.27635 22.1121 6.89093 22.8671C8.5055 23.6222 10.2088 24 12.0004 24C13.6255 24 15.1774 23.6821 16.6565 23.0468C18.1359 22.4116 19.4115 21.5571 20.4847 20.4844C21.5576 19.4112 22.4117 18.1354 23.0471 16.6562C23.6826 15.177 24 13.6247 24 11.9999C24.0001 10.3746 23.6824 8.82306 23.0472 7.3438Z" />
          </svg>
        </button>}

        <button className={`speak button col-12 my-3`} 
                onClick = {(promptNo!==3) ? ()=>setPromptNo(1) : ()=>setIsListening(curr=>!curr)} 
                disabled={isThinking || (!currentSession && (promptNo===3))} >
          <svg className={`${(isListening && 'listening')} ` + isDisabled()} viewBox="0 0 85 126" xmlns="http://www.w3.org/2000/svg">
            <path d="M65.41 63.486C65.41 74.417 56.5549 83.285 45.6189 83.285H38.408C27.487 83.285 18.627 74.417 18.627 63.486V19.789C18.626 8.859 27.486 0 38.408 0H45.6189C56.5549 0 65.41 8.859 65.41 19.789V63.486Z" />
            <path d="M77.963 37.5371C74.609 37.5371 71.891 40.2561 71.891 43.6091V68.8731C71.889 71.6331 71.264 74.2311 70.102 76.6561C68.363 80.2831 65.368 83.5121 61.46 85.8331C57.556 88.1531 52.772 89.5491 47.553 89.5481H36.475C29.53 89.5521 23.342 87.0621 18.989 83.2291C16.812 81.3141 15.098 79.0751 13.934 76.6551C12.771 74.2311 12.146 71.6331 12.144 68.8741V43.6091C12.144 40.2551 9.425 37.5371 6.072 37.5371C2.719 37.5371 2.78054e-06 40.2561 2.78054e-06 43.6091V68.8731C-0.00199722 73.5021 1.075 77.9411 2.99 81.9181C5.865 87.8911 10.579 92.8271 16.377 96.2731C21.609 99.3811 27.754 101.275 34.323 101.62V120.495C34.323 123.539 36.793 126 39.841 126H44.201C47.237 126 49.721 123.539 49.721 120.495V101.629C58.722 101.153 66.912 97.7631 73.074 92.3471C76.398 89.4221 79.137 85.8971 81.05 81.9161C82.964 77.9391 84.039 73.5011 84.037 68.8731V43.6091C84.036 40.2551 81.317 37.5371 77.963 37.5371Z" />
          </svg>
        </button>

        <button className={`think button col-12`} 
                //factor this and make 3rd function for popup to prompt joining session if !currentSession (then remove !currentSesison from disabled)
                onClick={ (promptNo!==3) ? ()=>setPromptNo(2) : ()=>getAnswer(text, currentSession)} 
                disabled={isThinking || isListening || (!currentSession && (promptNo===3)) } >
          <svg className={`${isThinking && 'thinking'} ` + isDisabled()} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.86 5.62457C17.898 4.57039 15.718 4.01619 13.5 4.01619C6.05597 4.01619 0 10.0963 0 17.57C0 25.0436 6.05597 31.1237 13.5 31.1237H13.616C14.828 34.1557 17.706 36.1436 21 36.1436C24.048 36.1436 26.814 34.3746 28.148 31.6578C29.406 31.969 30.698 32.1276 32 32.1276C40.8219 32.1276 48 24.9211 48 16.0639C48 1.33982 29.1671 -5.31918 19.86 5.62457Z" />
            <path d="M14 36.1445C11.794 36.1445 10 37.9457 10 40.1605C10 42.3753 11.794 44.1765 14 44.1765C16.2061 44.1765 18.0001 42.3753 18.0001 40.1605C18.0001 37.9457 16.2061 36.1445 14 36.1445Z" />
            <path d="M5 42.168C3.34597 42.168 2 43.5193 2 45.1799C2 46.8405 3.34597 48.1919 5 48.1919C6.65403 48.1919 8 46.8405 8 45.1799C8 43.5193 6.65403 42.168 5 42.168Z" />
          </svg>
        </button>

      </div>

      {/* Session */}
      {currentSession 
        ?
        <>
          <div className='session-title-container'>
          {/* Check if owned */}
          { isSessionOwned() ?
            <input className='change-session-title-input p-3 px-md-4 ' 
                   type="text" 
                   name='change-session-title' 
                   onChange={handleTitleChange}
                   value={ title } >
            </input>
          : <div className='session-title p-3 px-md-4 disable-caret'>{title}</div> 
          }
          </div>

          { isSessionOwned() &&
          <div className='delete-session-button p-2 disable-caret' onClick={(e)=>deleteSession(currentSession, userData.uid)}>
            Delete
          </div>}

          <div className='leave-session-button p-2 disable-caret' onClick={()=>leaveSession(currentSession)}>
            Leave
          </div>

          <div className='active-session-users row px-2 pb-3'>
            {/* { displaySessionUsers() } */}
            {(()=>{
              const sessionUsers = []
              for (const uid in activeSessionUsers) {
                  sessionUsers.push(
                    <div key={uid} className='session-user user-thumb col-3 col-md-2 m-2 p-2'>
                      {activeSessionUsers[uid]}
                    </div>
                  )
                }
              return sessionUsers
            })()}
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
        </>

        :

        <div className='starters-container'>
          <p className='p-1 px-5 pt-5' style={{color: 'rgb(95, 166, 134)'}}>
            Join a session or start one with these starters..
          </p>
          <div className='starters row p-4 px-5'>
            {starters.map((starter, name)=>{
              return <div className='starter-item col-4' key={starter.name}
                          onClick={(e)=>{ //Disable if not logged in --> prompt to log in
                            createSession( starter.name, '')
                            .then(([ sessionId, updated ])=> {
                              sessionElRef.current.scrollIntoView({behavior: 'smooth'});
                              // console.log('session created from starter')
                              // console.log('currentSession')
                              // console.log(currentSession) // null ??? why doesn't this not update from createSession method?
                                                              // shoudn't have to pass in sessionId from createSession promise 
                                                              // or require sesisonId param in setAnswer
                              // console.log('sessionId')
                              // console.log(sessionId) 
                              // return set(ref(dbRef.current, `sessions/${currentSession}/text`), starter.prompt)
                              return Promise.all([sessionId, set(ref(dbRef.current, `sessions/${sessionId}/text`), starter.prompt)])
                            })
                            .then(([sessionId])=>{
                              // console.log('text set from starter')
                              // console.log('text')
                              // console.log(text) 
                              return getAnswer(starter.prompt, sessionId)
                              // return getAnswer(text, sessionId) //doesn't work. --> doesn't detect from db in time?
                            })
                            .then(()=>{
                              // console.log('answer received')
                            }).catch((e)=>{
                              console.log('error setting session text from starter')
                            })
                          }}
                     >
                      <div>{starter.icon}</div>
                      <div>{starter.name}</div>
                     </div>
            })}

          </div>
        </div>
      }
      </div>
    </> 
  )
}

// export default React.memo(Session)
export default Session