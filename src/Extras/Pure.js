import React from 'react'

export default function Pure() {

  //Keep direct usage of react state variables out of 
  //async callbacks to avoid stale values
  // always use functional approach

  //use effect
    //run function whenever dependencies change

  //useCallback - memoize/cache func definition
    //IF dependencies change: 
      //redefine function 
      //return new reference 
      //run later by user action 

    //Common use:     //retians same reference b/w renders
    //pure cb function provided with no dependencies to avoid 
    //needlessly creating same function definition on every render

  //useMemo - memoize/cache function call result
    //IF dependencies change: 
      //redefine function  
      //run immediately by system 
      //resulting value returned

  return (
    <div>Pure</div>
  )
}


// useCallback is used to memoize the function definition, 
// ensuring the same function reference is returned until 
// its dependencies change.

// useMemo is used to memoize the result of a function call, 
// recomputing the result only when the dependencies change.