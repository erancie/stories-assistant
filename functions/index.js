const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai-api');
const axios = require('axios');

//TODO: enable cors

//TODO: reactivate openai-GPT API
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

exports.chatGPTFunction = functions.https.onRequest(async (req, res) => {

  const options = {
    method: 'GET',
    url: 'https://rev-ai.p.rapidapi.com/jobs/%7Bid%7D/transcript',
    headers: {
      Accept: 'application/vnd.rev.transcript.v1.0+json',
      'X-RapidAPI-Key': '11c150e928mshf52d576699cc12ap1ae020jsnb267af58de8a',
      'X-RapidAPI-Host': 'rev-ai.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } 
  catch (error) {
    console.error(error);
  }

});

//add function to generate mp3 of text 