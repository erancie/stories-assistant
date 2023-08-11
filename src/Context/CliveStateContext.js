import React, { createContext, useState, useContext } from 'react';

//create context for provider and usage
const CliveStateContext = createContext();

//comp that wraps context provider thats wraps children
export const CliveStateProvider = ({ children }) => {

  const [highlight, setHighlight] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [promptNo, setPromptNo] = useState(1);


  return (
    <CliveStateContext.Provider value={{
      highlight,
      isListening,
      isThinking,
      setHighlight,
      setIsListening,
      setIsThinking,
      promptNo,
      setPromptNo
    }}>
      {children}
    </CliveStateContext.Provider>
  );
};

//custom hook that wraps use context to be used in children
export const useCliveContext = ()=> useContext(CliveStateContext)

