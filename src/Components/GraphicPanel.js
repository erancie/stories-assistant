import React from 'react'

export default function GraphicPanel() {
  return (
    <div className='row'>

    <div className='col-5 graphic-panel row p-2 m-2 justify-content-center'>
      {/* map images */}
      <div className='graphic m-2 col-12 col-sm-5 col-lg-2'>
        <img className='panel-image' src=''></img>
        </div>
      <div className='graphic m-2 col-12 col-sm-5 col-lg-2'>
        <img className='panel-image' src=''></img>
        </div>
      <div className='graphic m-2 col-12 col-sm-5 col-lg-2'>
        <img className='panel-image' src=''></img>
        </div>
      <div className='graphic m-2 col-12 col-sm-5 col-lg-2'>
        <img className='panel-image' src=''></img>
      </div>
    </div>

    {/* options for next prompt --> bubble or casule like phind follow up prompt options */}

    <div className=' col-6 graphic-panel row m-2 justify-content-center'>
      {/* map images */}
      <div className='graphic m-2 col-11 '></div>

    </div>

  </div>
  )
}
