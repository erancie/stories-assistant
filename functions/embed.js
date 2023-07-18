
//example of embedding html from cloud function into a react component

//alternatively you could also use react router to create a whole new page 
//in the SPA and have a component that fetches SSR html.

//ultimately next.js could handle the need for both SPA and SSR in a react app
export default function App() {
  const [embedHtml, setEmbedHtml ] = useState(null)
  async function getHtml() {
    try {
      let postURL ='http://127.0.0.1:5001/quickstories/us-central1/embedHtml' 
      let response = await axios.get( postURL );
      const data = response.data;
      console.log(data)
      setEmbedHtml(data); 
    } catch (error) {
      console.log(error)
    }
  }
  return(
    <div>
      <button onClick={getHtml}>Get HTML</button>
      {<div dangerouslySetInnerHTML={{ __html: embedHtml }} />}
      {/* //this is not ideal ^^ */}
    </div>
  )
}

//firebase cloud function that returns embedded html
  //server sends string - react client renders into DOM?
exports.embedHtml= functions.https.onRequest((req, res) => {
    try {
      const serverData = 'data from server';
      res.set('Access-Control-Allow-Origin', '*'); 
      res.status(200).send(
        `<div>
          <p>This is in a div with data from a cloud function.</p>
          <p>Data:  ${serverData}.</p>
        </div>`
      ); 
    } catch (error) {
        res.status(500).json({ error: 'An error occurred.' });
    }
});


// When you return a string with HTML from an Express app to a React app 
//  the rendering happens on the client-side within the React app.

// Here's how the process typically works:

// The Express app receives a request from the React app.
// The Express app generates the HTML string with the desired content.
// The Express app sends the HTML string as a response to the React app.
// The React app receives the HTML string and renders it as part of the 

// component's content using dangerouslySetInnerHTML or by parsing and rendering the HTML elements.
// In this case, the rendering of the HTML string into an actual DOM structure 
// happens on the React client-side. The Express app is responsible for generating 
// the HTML string, but the React app is responsible for rendering it into the browser.

// It's important to note that using dangerouslySetInnerHTML poses a potential security risk, 
// as it bypasses React's built-in protections against cross-site scripting (XSS) attacks. 
// Make sure to sanitize any user-generated content before using dangerouslySetInnerHTML 
// to prevent XSS vulnerabilities.