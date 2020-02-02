var express = require('express');
//var ConversationV1 = require('watson-developer-cloud/conversation/v1');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
var ip = require("ip");
var app = express();

var contexts = [];

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
        apikey: 'EItatpQGzs_0YcoOQNI1yZ0tsIRchz6_1N4prxRHf8MG',
      
    }),
    url: 'https://api.us-south.assistant.watson.cloud.ibm.com/instances/287006f6-be3d-4884-8ed6-6257bed4016c',
  });

  const assist = '24200525-6e16-4121-9a7b-4f19a6db9371';
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
