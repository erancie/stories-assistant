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

      <h1 className='mt-5 title'>Clever Clive</h1>
      <h1 className='mt-3 pb-3 sub-title'>Speak or Type to have Clive complete your sentence..</h1>
      
      <div className='listen-buttons m-auto row align-items-center mt-5 justify-content-center'>
        <div className='mb-2 col-12 col-lg-6 '>
          <button className={`button btn  btn-lg px-4`}
                  onClick = {()=> setIsListening(latest => !latest)} >
            {!isListening ? 'Listen' : 'Stop'} 
          </button>
        </div>

        <div className='listening mb-2 col-12 col-lg-6 '>
          {isListening ? <i>Listening</i> : <i>Not Listening</i>}
        </div>
      </div>

      <div className='row justify-content-center align-items-center px-3 mt-5'>

        <div className='box-bg text-box col-10 col-lg-5'>
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
            Complete
          </button>

          <button className={`button btn col-6 col-lg-12 btn-lg my-3`}
                  onClick={()=>setText(prev=>prev+' '+completion)} >
            Add
          </button>
        </div>

        <div className='box-bg completion-box col-10 col-lg-5'>
          <div className='container'>
            <div className='completion'>{completion}</div>
          </div>
        </div>

        <h1> -commit test- </h1>
        
      </div>
    </div>
  )
}
