import React from 'react'

function Popup({ message, classes, show, timeout, 
                                       background, noClickOut , children }) {

  if(timeout) setTimeout( ()=>show(false), timeout )

  return (
    <div className={`popup-bg popup-bg-style ${classes}`}
         onClick={ !noClickOut && (()=>show(false)) }
    >
      <div className={`popup popup-style-neu`} 
           onClick={ !noClickOut && ((e)=>e.stopPropagation()) }
      >
        <p className='popup-message'>{message}</p>
        { children }
        <div className='close-popup-button' onClick={()=>show(false)}>x</div>
      </div>
    </div>
  )
}

export default Popup