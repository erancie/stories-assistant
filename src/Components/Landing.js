import React, { useState } from 'react'
import SignIn from './SignIn' 
import Signup from './Signup'

export default function Landing() {
  const [isSignup, setIsSignup] = useState(true)
  return (
    <div className='landing'>
      <h1 className='landing-header '>Clever 
        <span className='decoration'> Clive</span>. Your  
        <span className='decoration-2'> AI assistant</span> for
        <span className='decoration-3'> Colaborating</span> with others.</h1>
      


      <div className='landing-auth popup-style-neu m-auto my-5 '>

        <div className='row landing-buttons m-auto px-5'>

          <h1 className='login-button landing-button login-button-text col-6 mt-4'
              onClick={()=>setIsSignup(false)}
              style={{opacity: isSignup&&.5}}
          >Login</h1>
          <h1 className='signup-button landing-button signup-button-text col-6 mt-4'
              onClick={()=>setIsSignup(true)}
              style={{opacity: !isSignup&&.5}} //scrap this, use classes ^^
          >Signup</h1>

        </div>

        <div className='form-container p-5 m-auto'>
          {isSignup?<Signup />:<SignIn />}
        </div>

      </div>



      <h1 className='landing-info ' >In Development</h1>
    </div>
  )
}
