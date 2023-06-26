//shout out to Darwin Tech (https://www.youtube.com/watch?v=U2g--_TDYj4)
//and Mohan Raj for inspo with this component (https://www.section.io/engineering-education/speech-recognition-in-javascript/)
import React, { useEffect, useState } from 'react'
import OpenAI from 'openai-api';
import {} from 'dotenv/config';

//OpenAI GPT-3
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const openai = new OpenAI(OPENAI_API_KEY);

//Speech Rec.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
console.log(SpeechRecognition)
const recognition = new SpeechRecognition()
console.log(recognition)
recognition.continuous = true
recognition.interimResults = true
recognition.lang = 'en-US'


export default function App() {
  //state
  const [isListening, setIsListening ] = useState(false)
  const [text, setText ] = useState('')
  const [transcript, setTranscript ] = useState(null)
  const [completion, setCompletion ] = useState('placeholder')

  //effects
  useEffect(()=>{
    //recognition
    recognition.onstart = () => console.log('recognition.onstart()')
    //onresult resolves transcript value while listening - before onend  
    recognition.onresult = event => { 
      const transcript = Array.from(event.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('')
      setTranscript(transcript); console.log(transcript);
      recognition.onerror = event => console.log(event.error) 
    }
  }, [])

  useEffect(()=>{
    //putting here saves defining on every render, will see latest transcript when isListening stops
    const handleListen = () => {
      if(isListening){                                   
        recognition.start(); console.log('start listening event');
        recognition.onend = () => {                       
          console.log('onend callback')
          recognition.start(); console.log('restart listening');
        }
      }else {
        recognition.stop(); console.log('stop listening event'); 
        recognition.onend =()=> {console.log('onend callback')
          setText(currText => currText +' '+ transcript)
          setTranscript('')
        }
      }
    }
    handleListen(); console.log('handleListen()');
  }, [isListening])

  //pure function - can use useCallback so doesn't redefine on every render
  async function sendPrompt() {
    const gptResponse = await openai.complete({
        engine: 'ada', //davinci-instruct-beta
        maxTokens: 64,
        prompt: text
    });
    setCompletion(gptResponse.data.choices[0].text)
    console.log(`gpt: ${gptResponse.data.choices[0].text}`)
  }

  const handleTextChange = e => setText(e.target.value)

  return (
    <div className="App">

    <div className='header row '>
      <div className=' col-12 col-lg-8'>
        <h1 className='mt-5 title '>
          <span className='clever'><span className='c'>C</span>lever</span> 
          <span className='clive'> <span className='c2'>C</span>live</span>
        </h1>
        <h1 className='mt-3 pb-3 sub-title'>Speak or Type to have Clive complete your sentence.</h1>
      </div>

      <div className=' col-12 col-lg-3 col-xxl-2'>
        <div className='mascot'>

        <svg  viewBox="0 0 588 706" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M255.792 601.104C253.595 650.209 194.654 687.458 124.145 684.303C53.6352 681.148 -1.7429 638.783 0.454363 589.679C2.65163 540.575 61.5922 503.325 132.102 506.481C283.909 513.273 257.989 552 255.792 601.104Z" fill="#667278"/>
        <path d="M359.767 180.585C334.76 284.396 279.737 384.848 348.479 376.74C385.494 372.375 402.742 300.772 427.749 196.961C769.76 244.916 457.81 5.32711 439.037 0.805009C420.264 -3.71709 384.774 76.773 359.767 180.585Z" fill="#879196"/>
        <path d="M418 402.416C418 518.948 349.407 577 178.43 577C7.45331 577 95.8389 482.532 95.8389 366C95.8389 249.468 7.45331 155 178.43 155C349.407 155 418 285.884 418 402.416Z" fill="#FBAE7E"/>
        <path d="M375 414.827C375 523.075 314.956 577 165.29 577C15.6229 577 92.9923 489.248 92.9923 381C92.9923 272.752 15.6229 185 165.29 185C314.956 185 375 306.58 375 414.827Z" fill="#FF9F63"/>
        <path d="M261 434.272C261 529.541 223.622 577 130.452 577C37.2818 577 85.4455 499.769 85.4455 404.5C85.4455 309.231 37.2818 232 130.452 232C223.622 232 261 339.002 261 434.272Z" fill="#FF9655"/>
        <path d="M328 324C328 388.617 254.575 441 164 441C73.4253 441 0 388.617 0 324C0 259.383 73.4253 207 164 207C254.575 207 328 259.383 328 324Z" fill="#7B909B"/>
        <ellipse cx="149" cy="318.5" rx="149" ry="105.5" fill="#FAFAFA"/>
        <path d="M460.178 611.255C457.684 666.98 390.942 709.258 311.104 705.685C231.266 702.113 168.567 654.043 171.06 598.318C173.554 542.593 240.296 500.315 320.134 503.887C492.025 511.579 462.671 555.53 460.178 611.255Z" fill="#7B909B"/>
        <path d="M97.077 248.708L141.777 334.383L39.0619 325.989L97.077 248.708Z" fill="#FBAE7E"/>
        <path d="M210.083 258.586L254.783 344.261L152.068 335.868L210.083 258.586Z" fill="#FBAE7E"/>
        </svg>

        </div>
      </div>
    </div>


      <div className='row justify-content-center align-items-center px-3 mt-5'>

        <div className='box-bg text-box col-10 col-lg-6'>

          <div className='listen-buttons-bg mt-5 pb-2 pt-3 m-auto row '>
            <div className='listen-buttons m-auto row align-items-center justify-content-center'>
              <div className='mb-2 col-12 col-lg-6 '>
                <button className={`button btn  btn-lg px-4`}
                        onClick = {()=> setIsListening(latest => !latest)} >
                  {!isListening ? 'Listen' : 'Stop'} 
                </button>
              </div>
            
              <div className='listening mb-2 col-12 col-lg-6 '>
                {isListening ? <i style={{color: 'rgb(170, 177, 254)'}}>Listening</i> : <i>Not Listening</i>}
              </div>
            </div>
          </div>

          <div className='interim-text p-4 m-auto' style={{height: '100px'}}>
            {isListening ? <p>{transcript}</p> : null}
          </div>

          <textarea
            className='text p-3 container' 
            type="text" 
            name='text' 
            onChange={handleTextChange} 
            value={text}>
          </textarea>
        </div>
        
        <div className='request-box col-10 col-lg-2 row'>
          <button className={`button btn col-6 col-lg-12 btn-lg my-3`}
                      onClick={sendPrompt} >
            <span className='complete'>Complete</span>
            <svg className='arrow-down' viewBox="0 0 111 64"  xmlns="http://www.w3.org/2000/svg">
              <path d="M70.3108 38.7437L53.0209 48.8676C52.3736 49.2493 51.8982 49.9063 51.7702 50.7135C51.5391 52.173 52.534 53.576 53.9925 53.8411L107.499 63.6031L107.933 63.6434C109.409 63.6698 110.602 62.4857 110.594 61.0049L110.324 7.74414C110.311 6.983 109.987 6.22221 109.363 5.6809C108.234 4.70735 106.55 4.82067 105.607 5.93164L94.5697 18.9379C91.9781 16.4117 88.8184 13.9286 85.237 11.643C75.8954 5.67494 63.5404 0.970783 50.6487 0.305464C37.63 -0.367087 24.0668 3.05459 12.4624 13.3808C8.23308 17.1387 4.27422 21.8145 0.715106 27.5326C0.0854835 28.3931 0.0212279 29.6027 0.64341 30.5742C1.45171 31.8354 3.11115 32.2228 4.34587 31.4387C21.0039 20.909 34.6722 19.7105 45.8103 22.9346C55.7666 25.815 63.862 32.2537 70.3108 38.7437Z" />
            </svg>
          </button>

          <button className={`button btn col-6 col-lg-12 btn-lg my-3`}
                  onClick={()=>setText(prev=>prev+' '+completion)} >
            <svg className='arrow-up' viewBox="0 0 111 65"  xmlns="http://www.w3.org/2000/svg">
              <path d="M40.3047 25.7226L57.5949 15.5991C58.2422 15.2174 58.7176 14.5604 58.8457 13.7533C59.0768 12.2938 58.0819 10.8907 56.6234 10.6257L3.11703 0.862392L2.68275 0.822057C1.20727 0.795623 0.0140855 1.9797 0.0224695 3.46048L0.290625 56.7212C0.304196 57.4824 0.627958 58.2432 1.25197 58.7845C2.38059 59.7581 4.065 59.6448 5.00747 58.5339L16.0454 45.5278C18.6369 48.0541 21.7965 50.5373 25.3779 52.823C34.7193 58.7913 47.0742 63.4957 59.9659 64.1613C72.9846 64.8342 86.5479 61.4128 98.1525 51.0869C102.382 47.3292 106.341 42.6534 109.9 36.9354C110.53 36.0749 110.594 34.8653 109.972 33.8937C109.164 32.6326 107.504 32.2451 106.269 33.0292C89.6112 43.5585 75.9429 44.7567 64.8048 41.5323C54.8487 38.6516 46.7534 32.2128 40.3047 25.7226Z" />
            </svg>
            <span className='add'>Add</span>
          </button>
        </div>

        <div className='box-bg completion-box col-10 col-lg-4'>
          <div className='container'>
            <div className='completion'>{completion}</div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
