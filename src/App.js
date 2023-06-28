//shout out to Darwin Tech (https://www.youtube.com/watch?v=U2g--_TDYj4)
//and Mohan Raj for inspo with this component (https://www.section.io/engineering-education/speech-recognition-in-javascript/)
import React, { useEffect, useState } from 'react'
// import OpenAI from 'openai-api';
import {} from 'dotenv/config';
import axios from 'axios';


// //OpenAI GPT-3
// const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
// const openai = new OpenAI(OPENAI_API_KEY);

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

  // //TODO: move this to a firebase serverless function
  async function sendPrompt() {
    const requestBody = { text }; 
    const response = await axios.post(
      'http://127.0.0.1:5001/functions/chatGPTFunction',
      requestBody
    );
    setCompletion(response.data.result);
    //   console.log(`gpt: ${gptResponse.data.choices[0].text}`)
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
        <div className='mascot row'>

          <svg  viewBox="0 0 1215 1321" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M125.594 1076.81C107.472 985.079 98.3082 850.004 217.402 836.966C336.496 823.928 326.571 828.834 375.282 979.518C420.179 1118.41 393.988 1176.18 288.526 1197.01C252.228 1204.18 156.12 1231.32 125.594 1076.81Z" fill="#65B1B6"/>
            <path d="M154 1073C137.652 996.963 145.955 874.5 212.5 874.5C279.045 874.501 202.771 901.734 247.5 1050C279.105 1154.76 360.878 1159.81 279.045 1174.45C250.879 1179.49 181.538 1201.09 154 1073Z" fill="#B8FBFF"/>
            <path d="M401.334 1006.11C406.492 1045.68 359.228 1049.89 338.565 1054.32C306.149 1061.26 288.781 1061.5 283.181 1021.52C278.666 989.293 315.746 986.573 336.019 984.924C370.777 980.393 397.029 973.091 401.334 1006.11Z" fill="#69787D"/>
            <path d="M739.501 272.499C739.501 272.499 608.03 414.198 590.003 476.997L708.004 457.498C677.506 381.505 739.501 272.499 739.501 272.499Z" fill="#65B1B6"/>
            <path d="M718.499 302.502C718.499 302.502 662.5 363.5 625 440.5L681 450C629.5 439.5 718.499 302.502 718.499 302.502Z" fill="#B8FBFF"/>
            <path d="M351.733 814.501C276.627 999.272 368.726 1104.03 401.129 1140.29C457.276 1203.13 628.636 1233.86 725.306 1207.89C784.742 1191.93 984.861 1160.15 919.256 857.818C845.398 517.459 739.685 398.847 625.715 435.785C511.745 472.723 445.616 583.536 351.733 814.501Z" fill="#FFAB2E"/>
            <path d="M366.517 815.9C295.109 993.429 382.897 1094.17 413.783 1129.05C467.301 1189.48 586.729 1221.39 678.781 1196.5C735.379 1181.2 777.469 1161.1 714.781 870.499C644.207 543.338 735.73 416.689 627.207 452.112C518.685 487.534 455.777 593.99 366.517 815.9Z" fill="#FFCD83"/>
            <path d="M922.429 1077.1C941.622 1048.62 921.61 1036.43 888.37 1023.41C874.986 1018.16 856.329 1014.8 847.924 1015.33C835.455 1016.13 820.116 1037.94 823.592 1056.18C827.233 1075.28 827.634 1070.5 864.292 1084.86C900.949 1099.22 910.045 1095.48 922.429 1077.1Z" fill="#69787D"/>
            <path d="M1063.29 890.702C941.476 848.068 908.155 959.292 891.112 1010.66C833.673 1137.9 822.443 1219.68 936.869 1261.26C1030.86 1295.42 1089.06 1294.43 1133.39 1152.32C1177.71 1010.22 1185.11 933.336 1063.29 890.702Z" fill="#65B1B6"/>
            <path d="M995 909.5C950 909.5 930.841 983.585 913.574 1030.3C874.573 1135.81 856.279 1192.85 936.446 1224.43C1011.5 1254 954.037 1192 972 1077C994.493 933 1051.5 909.5 995 909.5Z" fill="#B8FBFF"/>
            <path d="M846.562 731.637C904.994 518.875 766.802 486.477 620.501 474.5C474.2 462.522 355.31 500.349 349.492 669.152C342.53 871.153 502.91 934.171 579.78 936.949C645.604 938.617 796.346 914.483 846.562 731.637Z" fill="#FFD9A0"/>
            <path d="M844.922 735.245C954.5 431.999 533.5 474.495 533.5 474.495C533.5 474.495 498.829 527.431 490.303 697.506C480.1 901.031 585.555 937.034 585.555 937.034C585.555 937.034 789.001 946.495 844.922 735.245Z" fill="#FFB74B"/>
            <path d="M749.499 680C768.758 538.725 639.341 525.714 580.502 526.01C476.552 526.534 397.952 547.5 397.952 703.402C397.952 844.986 523.996 888.202 563.999 890.5C604.002 892.798 725.425 856.593 749.499 680Z" fill="white"/>
            <path d="M587.376 589.965C587.459 589.633 587.542 589.302 587.623 588.973C587.526 589.23 587.444 589.562 587.376 589.965Z" fill="#00FFE0"/>
            <path d="M536.049 739.158C552.346 745.937 605.176 751.174 633.781 748.08C597.93 686.486 585.242 602.687 587.376 589.965C579.109 622.827 559.42 669.97 545.66 701.554C527.374 659.037 520.681 627.738 516.358 607.52C514.812 600.291 513.569 594.479 512.208 590.077C500.109 630.371 474.354 713.518 468.119 723.751C463.319 731.632 503.021 739.068 536.049 739.158Z" fill="#00FFE0"/>
            <path d="M677.42 214.323C719.441 193.415 813.442 179.778 853.288 292.495C829.301 154.616 726.048 182.931 677.42 214.323Z" fill="white"/>
            <path d="M624.052 56.4541C719.222 22.158 927.658 8.30264 1000.05 227.25C948.038 -25.4435 727.713 8.09712 624.052 56.4541Z" fill="white"/>
            <path d="M663.48 128.13C727.693 106.146 870.001 99.5135 925.531 248.85C892.631 70.3039 737.122 93.9756 663.48 128.13Z" fill="white"/>
            <path d="M477.861 722.015C470.025 722.015 506.28 642.703 512.997 614.831C515.12 628.209 504.146 675.955 519.738 727.994C502.5 722.015 490.5 722.015 477.861 722.015Z" fill="#D0FFF9"/>
            <path d="M560.868 727.015C553.378 729.293 576.282 653.372 583 625.5C585.123 638.878 587.154 680.955 602.746 732.993C586.5 723.5 579 721.5 560.868 727.015Z" fill="#D0FFF9"/>
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
