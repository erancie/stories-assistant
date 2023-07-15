console.log('Functions Online Start')

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai-api');
// const axios = require('axios');

const cors = require('cors');
// const cors = require('cors')({ origin: true });

//TODO: reactivate openai-GPT API
const OPENAI_API_KEY = functions.config().openai.api_key;
const openai = new OpenAI(OPENAI_API_KEY);

admin.initializeApp(); 

// Determine the origin based on the environment
const getOrigin = () => {
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    console.log('process.env.FUNCTIONS_EMULATOR === true')
    // Set the origin for the Firebase emulators
    return 'localhost:3000'; // Replace with the actual origin of your client application in development
  } else {
    // Set the origin to true for the production environment
    console.log('origin: true')
    return true;
  }
};



console.log('Functions Online Mid')

// Define your Firebase Cloud Function
exports.chatGPTFunction = functions.https.onRequest(async (req, res) => {
  // const origin = getOrigin();
  // const corsMiddleware = cors({ origin });
  // const corsMiddleware = cors({ origin: 'localhost:3000' });
  const origin = getOrigin();
  const corsMiddleware = cors({ origin: origin });
  corsMiddleware(req, res, async () => {
      try {
      // console.log('Executing: chatGPTFunction');
      const { inputText } = req.body; // Assuming the client sends a JSON object with the 'text' field
      const gptResponse = await openai.complete({
          engine: 'ada', //davinci-instruct-beta
          maxTokens: 64,
          prompt: inputText
      });
      // Extract text from response
      const responseText = gptResponse.data.choices[0].text;
      // Send the text back to the client
      res.status(200).json({ result: responseText }); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred.' });
    }
  });
});

// exports.voiceFunction = functions.https.onRequest(async (req, res) => {

//   const options = {
//     method: 'GET',
//     url: 'https://rev-ai.p.rapidapi.com/jobs/%7Bid%7D/transcript',
//     headers: {
//       Accept: 'application/vnd.rev.transcript.v1.0+json',
//       'X-RapidAPI-Key': '11c150e928mshf52d576699cc12ap1ae020jsnb267af58de8a',
//       'X-RapidAPI-Host': 'rev-ai.p.rapidapi.com'
//     }
//   };

//   try {
//     const response = await axios.request(options);
//     console.log(response.data);
//   } 
//   catch (error) {
//     console.error(error);
//   }

// });

//add function to generate mp3 of text 

console.log('Functions Online End')
