var express = require('express');
//var ConversationV1 = require('watson-developer-cloud/conversation/v1');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
var ip = require("ip");
var app = express();

var contexts = [];

tonekey = 'kkX5p0EpKV8O8r5Czt5XSe8tuV-84p4zG5jRn8HAoTnd';
toneurl = 'https://api.us-south.tone-analyzer.watson.cloud.ibm.com/instances/73ae9d4c-0801-45f5-b7da-32e981754c7e';
app.get('/smssent', function (req, res) {
  var message = req.query.Body;
  var number = req.query.From;
  var twilioNumber = '+15005550006';

  /*
  var client = require('twilio')(
    //'AC5d0b49792e81913c4e274363c1242226',
    //'e9c6a98e38f9d6557f2ae650cd793f3d'
    'AC22006a008e1e9156ccae7677c44baad8',
    'ffab018a689d69802a35b052c3df0087'
  );///
  */
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

  console.log('Recieved message from ' + number + ' saying \'' + message  + '\'');

  //var conversation = new ConversationV1({version_date: ConversationV1.VERSION_DATE_2019_02_01});
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
    text: '', // start conversation with empty message
  });
})
.catch(err => {
  console.log(err); // something went wrong
});

// Send message to assistant.
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
    console.log(err); // something went wrong
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
                console.log(number + " has ordered at " + d.getHours() + ":" + d.getMinutes());
            }
          });
      //console.log(response.output.generic[0].text);
    }
  }
}


// We're done, so we close the session.
/*
service
.deleteSession({
  assistantId,
  sessionId,
})
.catch(err => {
  console.log(err); // something went wrong
});
*/
}})

app.listen(3000, function () {
  console.log('app listening on port 3000');
  console.log ( ip.address() );
});
