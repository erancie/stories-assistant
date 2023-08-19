// import React from 'react'

import { useCliveContext } from './../Context/CliveStateContext';

const WalkthroughSpeak=()=> {
  const { setPromptNo } = useCliveContext();
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

const WalkthroughThink=()=> {
  const { setPromptNo } = useCliveContext();
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
  const { promptNo } = useCliveContext();
  if (promptNo===1) return <WalkthroughSpeak/>
  else if (promptNo===2) return <WalkthroughThink/>
  else return null
}

export default Walkthrough