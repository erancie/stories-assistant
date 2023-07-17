const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai-api');
const cors = require('cors');

admin.initializeApp(); 

const allowedOrigins = [
  'http://localhost:3000',
  'https://quickstories-60609.web.app'
];
const corsMiddleware = cors({ origin: allowedOrigins }); //set allowed origins

exports.chatgpt= functions
  .runWith({ secrets: ["OPENAI_API_KEY"]})
  .https.onRequest(
    async (req, res) => {
      const openai = new OpenAI(process.env.OPENAI_API_KEY);
      const engine = 'davinci';
      corsMiddleware(req, res, async () => {
        try {
          const { inputText } = req.body;
          const gptResponse = await openai.complete({
            engine: engine,
            maxTokens: 64,
            prompt: inputText
          });
          const responseText = gptResponse.data.choices[0].text;
          res.status(200).json({ result: responseText, engine: engine });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'An error occurred.' });
        }
      });
    }
  );