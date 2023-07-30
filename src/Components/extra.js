import React, { useEffect, useState, useRef } from 'react'
import {} from 'dotenv/config';
import axios from 'axios';

//Speech Rec.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()
recognition.continuous = true
recognition.interimResults = true
recognition.lang = 'en-US'

export default function App() {
  //state
  const [isListening, setIsListening ] = useState(false)
  const [isThinking, setIsThinking ] = useState(false)
  const [text, setText ] = useState('')
  const [transcript, setTranscript ] = useState('')
  const [previousText, setPreviousText] = useState('');
  const [highlight, setHighlight] = useState(false);
  const [promptNo, setPromptNo] = useState(1);

  //effects
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
      recognition.onerror = event => console.log(event.error) 
    }
  }, [])

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
          setText(currText =>{
            setPreviousText(currText)
            const newText = currText + transcript
            return newText.trim()
          } )
          setTranscript('')
        }
      }
    }
    handleListen(); console.log('handleListen()');
  }, [isListening])

  async function sendPrompt() {
    try {
      setIsThinking(true)
      const requestBody = { text }; 
      let postURL ='https://us-central1-quickstories.cloudfunctions.net/chatgpt' 
      if (process.env.NODE_ENV === 'development') {  //functions emulator endpoint with client development
       postURL ='http://127.0.0.1:5001/quickstories/us-central1/chatgpt' 
      }
      let response = await axios.post( postURL, requestBody );
      const result = response.data.result;
      setText((prev) => {
        setPreviousText(prev);
        setIsThinking(false)
        return prev + ' ' + result;
      });
    } catch (error) {
      console.log(error)
      setIsThinking(false)
    }
  }

  //clear function to undo last setText from speech and completion
  const undo = () => {
    setHighlight(true);
    setTimeout(() => {
      setHighlight(false);
    }, 300);
    setText(previousText);
  };

  const handleTextChange = (e) => {
    setText(e.target.value)
    setPreviousText(e.target.value);
  }
 

  const mascot = ()=> {
    return (
      <>
        <svg className={`mascot-base ${(isListening || isThinking || highlight || (promptNo===1||promptNo===2)) ? 'hide' : ''}`} viewBox="0 0 1312 1221" xmlns="http://www.w3.org/2000/svg">
        </svg>

        <svg className={`mascot ${isListening || (promptNo===1) ? 'show' : ''}`} viewBox="0 0 1312 1221" xmlns="http://www.w3.org/2000/svg">
        </svg>

        <svg className={`mascot ${isThinking || (promptNo===2) ? 'show' : ''}`}  viewBox="0 0 1312 1273" xmlns="http://www.w3.org/2000/svg">
        </svg>

        <svg className={`mascot ${highlight ? 'show' : ''}`}  viewBox="0 0 1370 1303" xmlns="http://www.w3.org/2000/svg">
        </svg>
      </>
    )
  }

  const PopupSpeak=()=> { //
    return (
      <div className='popup-bg'>
        <div className='popup p-2'>
            <p className='py-4 col-10 m-auto'>Turn the mic green to speak..</p>
            <div style={{height: 120}}></div>
            <p className='pt-4 py-3 col-9 m-auto'>..turn it off again when you finish speaking.</p>
            <div className='next-button' onClick={()=>setPromptNo(curr=>curr+1)}>Next</div>
        </div>
      </div>
    )
  }

  const PopupThink=()=> { //
    return (
      <div className='popup-bg'>
        <div className='popup p-2'>
            <p className='py-4 col-10 m-auto'>Each time you press the thought bubble..</p>
            <div style={{height: 120}}></div>
            <p className='pt-4 py-3 col-9 m-auto'> ..Clive will add an idea.</p>
            <div className='next-button' onClick={()=>setPromptNo(curr=>curr+1)}>Next</div>
        </div>
      </div>
    )
  }

  const Popups = ()=> {
    if (promptNo===1) {
      return <PopupSpeak />
    }
    else if (promptNo===2) {
      return <PopupThink />
    }
    else return null
  }

  return (
    <div className="App ">

      {/* Popups */}
      <Popups />

      {/* Header */}
      <div className='header row mx-0'
           style={promptNo!==3?{zIndex: 4}:null}
      >
        
        <div className=' col-8 '>
          <h1 className='title'>
            <div className='clever'><span className='c'>C</span>lever</div> 
            <div className='clive'> <span className='c2'>C</span>live</div>
          </h1>
        </div>

        <div className='mascot-container position-relative col-4 mt-2'>
          {mascot()}
        </div>
      </div>


      {/* ------------------------ */}
      {/* Controls  */}

      <div className='controls-secondary' >
        <button className={`help button col-12`} onClick={()=>setPromptNo(1)} >
          <svg className='' viewBox="0 0 30 46"  xmlns="http://www.w3.org/2000/svg">
            <path d="M25.5535 3.07226C28.5209 5.19229 30 8.32743 30 12.4956C30 14.6786 29.2741 16.7986 27.8312 18.8468C27.4138 19.5295 25.8984 20.8949 23.2759 22.9431L20.8984 24.4792C19.5191 25.6381 18.6933 26.6621 18.412 27.5515C18.2033 28.0995 18.0672 28.8451 17.9946 29.8063C17.9946 30.2824 17.7223 30.5249 17.1688 30.5249H10.5445C9.99093 30.5249 9.71869 30.3183 9.71869 29.9141C9.85481 26.5723 10.3358 24.4523 11.1706 23.5629C11.7241 22.8083 12.5499 21.9909 13.657 21.1015C14.7641 20.2122 15.726 19.4935 16.5517 18.9546L17.7949 18.2359C18.5572 17.6879 19.1379 17.113 19.5554 16.4932C20.5172 14.993 21.0073 13.7982 21.0073 12.9089C21.0073 11.5434 20.5626 10.2139 19.6642 8.91134C18.7024 7.68064 17.1143 7.06978 14.9093 7.06978C12.5681 7.06978 10.9437 7.82437 10.0454 9.32456C9.08348 10.7619 8.59347 12.325 8.59347 14.0318H0C0.208711 8.49811 2.16878 4.53652 5.89837 2.14699C8.31216 0.718656 11.1706 0 14.4828 0C18.9655 0 22.6588 1.02409 25.5535 3.07226ZM14.3829 35.6453C15.8984 35.6453 17.1597 36.1574 18.1579 37.1815C19.1561 38.2056 19.628 39.4722 19.5554 40.9724C19.4828 42.5444 18.9383 43.7931 17.9038 44.7094C16.8693 45.6257 15.5898 46.0569 14.0744 45.994C12.559 45.994 11.2976 45.4999 10.2995 44.5118C9.30127 43.5236 8.8294 42.239 8.902 40.667C8.97459 39.0949 9.51906 37.8462 10.5535 36.9299C11.588 36.0137 12.8584 35.5735 14.3829 35.6453Z" />
          </svg>
        </button>

        <button className={`undo button col-12 ${highlight ? 'highlight' : ''}`} onClick={undo} >
          <svg className={` `} viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg">
            <path d="M23.0472 7.3438C22.4119 5.86449 21.5577 4.58839 20.4849 3.5156C19.4119 2.44275 18.1359 1.58866 16.6565 0.953098C15.1774 0.317535 13.6255 0 12.0004 0C10.4692 0 8.98754 0.288803 7.55505 0.867064C6.12288 1.44522 4.84942 2.26029 3.73478 3.3125L1.70329 1.29657C1.39074 0.973621 1.03151 0.900777 0.625099 1.07771C0.208348 1.25504 0 1.56245 0 1.99989V9.00005C0 9.27085 0.0990024 9.50525 0.296952 9.70315C0.495012 9.90111 0.72941 10.0001 1.0002 10.0001H8.00026C8.43786 10.0001 8.7451 9.79176 8.9222 9.37505C9.09919 8.9688 9.02634 8.60951 8.70334 8.29685L6.56267 6.14065C7.29208 5.4531 8.12531 4.92447 9.06279 4.55462C10.0003 4.18482 10.9794 3.99978 12.0003 3.99978C13.0835 3.99978 14.1176 4.21092 15.1019 4.63261C16.0865 5.05456 16.9377 5.62489 17.6566 6.3437C18.3754 7.06234 18.9457 7.91386 19.3676 8.89837C19.7892 9.88277 20.0003 10.9165 20.0003 12.0001C20.0003 13.0836 19.7893 14.1173 19.3676 15.1016C18.9457 16.086 18.3754 16.9374 17.6566 17.6563C16.9377 18.3751 16.0862 18.9456 15.1019 19.3674C14.1176 19.7892 13.0835 20.0001 12.0003 20.0001C10.7607 20.0001 9.58878 19.7293 8.48454 19.1878C7.38046 18.6463 6.44818 17.8807 5.68774 16.8907C5.6149 16.7866 5.49504 16.7239 5.32834 16.703C5.17204 16.703 5.04179 16.7498 4.93764 16.8434L2.79702 18.9998C2.71378 19.0836 2.66951 19.1902 2.66425 19.3202C2.65911 19.4507 2.69309 19.5678 2.76594 19.6719C3.90148 21.047 5.27635 22.1121 6.89093 22.8671C8.5055 23.6222 10.2088 24 12.0004 24C13.6255 24 15.1774 23.6821 16.6565 23.0468C18.1359 22.4116 19.4115 21.5571 20.4847 20.4844C21.5576 19.4112 22.4117 18.1354 23.0471 16.6562C23.6826 15.177 24 13.6247 24 11.9999C24.0001 10.3746 23.6824 8.82306 23.0472 7.3438Z" />
          </svg>
        </button>
      </div>


      <div className={`controls ${(promptNo!==3)&&'controls-popup-active'} ${(promptNo===1) && ' prompt-1'} ${(promptNo===2) && ' prompt-2'}`} >
        <button className={`speak button col-12 mb-3`} 
                onClick = {()=> setIsListening(curr => !curr)} 
                disabled={isThinking || (promptNo !== 3)} >
          <svg className={`${isListening && 'listening'}`} viewBox="0 0 85 126" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </button>

        <button className={`think button col-12`} 
                onClick={sendPrompt} 
                disabled={isThinking || isListening || (promptNo!==3)} >
          <svg className={`${isThinking && 'thinking'}`} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </button>
      </div>


      {/* ------------------------ */}
      {/* Text Box */}

      <textarea
        placeholder={`Speak or type to start making something cool with Clive!`}
        className='text' 
        type="text" 
        name='text' 
        onChange={handleTextChange} 
        // value={ (text || transcript) ? text + transcript : instructions() }
        value={ text + transcript  }
        disabled={isThinking || isListening}
      >
      </textarea>

    </div>
  )
}
