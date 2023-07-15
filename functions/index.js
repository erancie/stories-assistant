console.log('Functions Online Start')

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai-api');
const cors = require('cors');
// const cors = require('cors')({ origin: true });

const OPENAI_API_KEY = functions.config().openai.api_key;
// console.log('REVEAL: '+ OPENAI_API_KEY)

const openai = new OpenAI(OPENAI_API_KEY);

admin.initializeApp(); 

// Determine the origin based on the environment
const getOrigin = () => {
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    console.log('process.env.FUNCTIONS_EMULATOR === true')
    // Set the origin for the Firebase emulators
    return 'localhost:3000'; //origin url of client application in development
  } else {
    // return true for the production environment
    console.log('origin: true')
    return true;
  }
};

// getOrigin()

console.log('Functions Online Mid')

// Define your Firebase Cloud Function
exports.chatGPTFunction = functions.https.onRequest(async (req, res) => {
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

console.log('Functions Online End')
