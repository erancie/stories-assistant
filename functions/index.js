const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai-api');

// const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_KEY = functions.config().openai.api_key;

const openai = new OpenAI(OPENAI_API_KEY);

admin.initializeApp();

// Define your Firebase Cloud Function
exports.chatGPTFunction = functions.https.onRequest(async (req, res) => {
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
