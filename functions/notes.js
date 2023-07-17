
//try openAI api directly

// const { Configuration, OpenAIApi } = require("openai");
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);
// const response = await openai.createCompletion({
//   model: "text-davinci-003",
//   prompt: "Say this is a test",
//   max_tokens: 7,
//   temperature: 0,
// });





///////////////////////////////////////

//ALLOW ANY ORIGIN
// Allow an origin without cors by passing in the requst origin 
// to the response header 'Access-Control-Allow-Origin' 
      //setting this allows cross-origin
// res.set('Access-Control-Allow-Origin', req.headers.origin); 
// res.set('Access-Control-Allow-Methods', 'GET, POST');
// res.set('Access-Control-Allow-Headers', '*');

//ALLOW SPECIFIC ORIGINS
// if (allowedOrigins.includes(req.headers.origin)) {
//   res.set('Access-Control-Allow-Origin', req.headers.origin); 
//   res.set('Access-Control-Allow-Methods', 'GET, POST');
//   res.set('Access-Control-Allow-Headers', '*');
// }

//ALLOW ANY OR SPECIFIC WITH CORS
// the cors package essentially does something like this under the hood by 
// auto setting 'Access-Control-Allow-Origin' response with specified origins 
// --> cors({
//   origin: allowedOrigins
// })

//some cors info
// https://sentry.io/answers/why-does-my-javascript-code-receive-a-no-access-control-allow-origin-header-error-while-postman-does-not/#:~:text=Postman%20does%20not%20enforce%20CORS,browsers%20on%20the%20client%20side.