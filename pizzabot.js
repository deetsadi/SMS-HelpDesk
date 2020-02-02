var express = require('express');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
var ip = require("ip");
var app = express();

var natural = require('natural');
var Analyzer = natural.SentimentAnalyzer;
var stemmer = natural.PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");

var out = "";

var count = 0;

var contexts = [];

app.get('/smssent', function (req, res) {
  var message = req.query.Body;
  var number = req.query.From;
  var twilioNumber = '+15005550006';

  const accountSid = 'ACf50cc727783f71685b3be1d350246edb'; 
  const authToken = '05bfbd5ef74c7d0cc87ecf39e929a422'; 
  const client = require('twilio')(accountSid, authToken); 


  var context = null;
  var index = 0;
  var contextIndex = 0;
  contexts.forEach(function(value) {
    console.log(value.from);
    if (value.from == number) {
      context = value.context;
      contextIndex = index;
    }
    index = index + 1;
  });
  if (count > 0){
      if (analyzer.getSentiment(message.split(" ")) > 0.60 && analyzer.getSentiment(message.split(" ")) < 0.80){
          console.log(out + " - customer had a good experience but it could be better.");
      }
      else if (analyzer.getSentiment(message.split(" ")) > 0.30 && analyzer.getSentiment(message.split(" ")) < 0.60){
          console.log(out + " - customer did not have a good overall experience, but found parts of the service useful")
      }
      else if (analyzer.getSentiment(message.split(" "))>0.8){
          console.log(out + " - customer had a great experience. Repeat business is likely.")
      }
      else if (analyzer.getSentiment(message.split(" "))<0.30){
          console.log(out + " - customer had a bad experience.")
      }
  }
  console.log('Recieved message from ' + number + ' saying \'' + message  + '\'');

  const conversation = new AssistantV2({
    
    version: '2019-02-28',
    authenticator: new IamAuthenticator({
        apikey: 'LThtByL953qKpwFJF2JM5Ekx5dcLEqJcDfjTp7nAp3M_',
      
    }),
    url: 'https://api.us-south.assistant.watson.cloud.ibm.com/instances/1fb8e4d8-b3f6-4634-ad03-a4f2b074bd4c',
  });

  const assist = '8b4ade6a-c626-4597-8fdf-608e42903f3b';
  let session;
  
  // Create session.
conversation
.createSession({
  assistantId: assist,
})
.then(res => {
  session = res.result.session_id;
  
  sendMessage({
    messageType: 'text',
    text: '', 
  });
})
.catch(err => {
  console.log(err); 
});

function sendMessage(messageInput) {
conversation
  .message({
    assistantId: assist,
    sessionId: session,
    input: { text: message },
  })
  .then(res => {
    processResponse(res.result);
  })
  .catch(err => {
    console.log(err); 
  });
}

// Process the response.
function processResponse(response) {
// Display the output from assistant, if any. Supports only a single
// text response.
if (response.output.generic) {
  if (response.output.generic.length > 0) {
    if (response.output.generic[0].response_type === 'text') {
          client.messages.create({
            body: response.output.generic[0].text,
            from: '+12029317049',
            to: number
            
          }, function(err, message) {
            if(err) {
              console.error(err.message);
            }
            if (response.output.generic[0].text.indexOf("20 minutes") != -1){
                var d = new Date();
                if (d.getMinutes >= 10){
                    out+=number + " has ordered at " + d.getHours() + ":0" + d.getMinutes();
                }
                else {
                    out+=number + " has ordered at " + d.getHours() + ":" + d.getMinutes();
                }
                count+=1;
            }
          });
    }
  }
}
}})

app.listen(3000, function () {
  console.log('app listening on port 3000');
  console.log ( ip.address() );
});
