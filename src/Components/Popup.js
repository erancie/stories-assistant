import React from 'react'

function Popup({ message, bgClasses, classes, show, timeout, noClose,
                 height, width, maxWidth, background, noClickOut , children }) {

  if(timeout) setTimeout( ()=>show(false), timeout )

  return (
    <div className={`popup-bg popup-bg-style ${bgClasses}`}
         onClick={ !noClickOut && (()=>show(false)) }
    >
      <div className={`popup col-10 popup-style-neu ${classes}`} 
           onClick={ !noClickOut && ((e)=>e.stopPropagation()) }
           style={{height: `${height}`, width: `${width}`, maxWidth: `${maxWidth}`}}
      >
        {message && <p className='popup-message'>{message}</p> }
        { children }
        {!noClose && <div className='close-popup-button' onClick={()=>show(false)}>x</div> }
      </div>
    </div>
  )
}

export default Popup