import React from 'react'

export default function Notification({ loadMessage, classes, show, timeout, background, noClickOut }) {

  if(timeout) setTimeout( ()=>show(false), timeout )

  return (
    <div className={`login-popup-bg popup-bg-style ${classes}`}
         onClick={ !noClickOut && (()=>show(false)) }
        //  style={{background: background}}
    >
      <div className={`login-popup popup-style-neu`} 
           onClick={ !noClickOut && ((e)=>e.stopPropagation()) }
           >
        <p className='login-popup-message'>{loadMessage}</p>
        <div className='close-popup-button' onClick={()=>show(false)}>x</div>
      </div>
    </div>
  )
}

//  qqq333@gmail.com