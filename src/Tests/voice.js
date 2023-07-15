
//add function to generate mp3 of text 

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