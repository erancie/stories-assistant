
const OpenAI = require('openai-api');


// const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY ;
const OPENAI_API_KEY = process.argv[2];
console.log('OPENAI_API_KEY: ' + OPENAI_API_KEY );
const openai = new OpenAI(OPENAI_API_KEY);

const inputText = 'The top 3 programming languages are '

async function testGPT(){
  try {
    console.log('Executing testGPT()');
    const gptResponse = await openai.complete({
        // engine: 'ada', 
        engine: 'davinci-instruct-beta',
        maxTokens: 64,
        prompt: inputText
    });
    // Extract text from response
    const responseText = gptResponse.data.choices[0].text;
    console.log(responseText)
  } 
  catch (error) {
    console.log('GPT TEST ERROR')
    console.error(error);
  }
}

testGPT()