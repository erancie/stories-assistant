const Text = (props) => {
  return(
    <textarea 
      className='in' 
      type="text" 
      name='text' 
      onChange={props.handleTextChange} 
      value={props.text}>
    </textarea>
  )
}
export default Text
 