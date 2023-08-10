const Button = (props) => {
  return(
    <button className={`button btn ${props.type} btn-lg px-4 m-5`}
            onClick={props.onclick} >
      {props.message}
    </button>
  )
}
export default Button 