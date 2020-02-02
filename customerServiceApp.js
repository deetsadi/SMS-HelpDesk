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
  var twilioNumber = req.query.To;

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
      apikey: 'LThtByL953qKpwFJF2JM5Ekx5dcLEqJcDfjTp7nAp3M_'
    }),
    url: 'https://api.us-south.assistant.watson.cloud.ibm.com/instances/1fb8e4d8-b3f6-4634-ad03-a4f2b074bd4c',
  });

  const assist = '8b4ade6a-c626-4597-8fdf-608e42903f3b';
  
  conversation.createSession({
    assistantId: assist
  })
    .then(res => {
      console.log(JSON.stringify(res, null, 2))
    })
    .catch(err => {
      console.log(err);
    });
  

    
  console.log(JSON.stringify(context));
  console.log(contexts.length);

  conversation.message({
    assistantId: assist,
    sessionId: session,
    input: { text: message },

    context: context
   }, function(err, response) {
       if (err) {
         console.error(err);
       } else {
         console.log(response.output.text[0]);
         if (context == null) {
           contexts.push({'from': number, 'context': response.context});
         } else {
           contexts[contextIndex].context = response.context;
         }

         var intent = response.intents[0].intent;
         console.log(intent);
         if (intent == "done") {
           //contexts.splice(contexts.indexOf({'from': number, 'context': response.context}),1);
           contexts.splice(contextIndex,1);
           // call api to actually do the shit (order pizza)
         }

         var client = require('twilio')(
           'AC5d0b49792e81913c4e274363c1242226',
           'e9c6a98e38f9d6557f2ae650cd793f3d'
         );

         client.messages.create({
           body: response.output.text[0],
           from: twilioNumber,
           to: number
         }, function(err, message) {
           if(err) {
             console.error(err.message);
           }
         });
       }
  });

  res.send('');
});

app.listen(3000, function () {
  console.log('app listening on port 3000');
  console.log ( ip.address() );
});