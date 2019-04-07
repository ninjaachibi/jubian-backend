var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

import Notification from '../models/NotificationSchema';

router.use(function(req, res, next) {
  var token = req.headers.authorization;

  if (token === undefined) return res.status(401).json({ success: false, message: 'no jwt token' });

  var tokenArr = token.split(' ');
  if (tokenArr[0] !== 'Bearer' || tokenArr[1] === undefined) {
    return res.status(401).json({ success: false, message: 'Missing bearer or token fields' });
  }

  token = tokenArr[1];

  try {
    console.log(token);
    var userInfo = jwt.verify(token, process.env.JWT_SECRET);
  } catch(err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }

  if (userInfo._id === undefined) return res.status(401).json({ success: false, message: 'Could not sign with JWT SECRET' });

  req.user = userInfo;
  next();
});

// *** push notifications *** //

import Expo from 'expo-server-sdk';

// Create a new Expo SDK client
let expo = new Expo();
var somePushTokens = []; 
let messages = [];

// this endpoint should only run once per user
router.post('/register-push-token', async (req,res) => {
  const { token, user } = req.body

  //need to save these to database
  const value = token.value
  const username = user.username

  //only push token on if it's not there before
  if (!_.contains(somePushTokens, value)) {
    somePushTokens.push(value)
    console.log('new push token pushed', value)
  }
  else {
    console.log('this token is already registered')
  }

  res.json({
    success: true,
    token,
    user
  })
  console.log('registering for push notifs ', token, user)
})

let tickets = [];

//need to account for chunks, but now let's just do one by one.
router.get('/send-push', (req,res) => {  
  for (let pushToken of somePushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      body: 'This is a test notification',
      data: { withSome: 'data' },
    })
  }

  let chunks = expo.chunkPushNotifications(messages);
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('ticketChunk',ticketChunk);
        tickets.push(...ticketChunk); //for receipts

        //if done, clear the messages we have to send
        messages = []
      } catch (error) {
        console.error(error);
      }
    }
  })();
});

let receiptIds = [];

router.get('/get-receipts', (req,res) => {
  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  console.log('receiptIds', receiptIds)

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    for (let chunk of receiptIdChunks) {
      console.log('chunk',chunk)
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log('receipts',receipts);

        for (let r of Object.keys(receipts)) {
          let receipt = receipts[r];
          console.log('receipt', receipt)
          if (receipt.status === 'ok') {
            continue;
          } else if (receipt.status === 'error') {
            console.error(`There was an error sending a notification: ${receipt.message}`);
            if (receipt.details && receipt.details.error) {
              console.error(`The error code is ${receipt.details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
});

//New Notification
router.post('/new',(req,res)=>{ //need to make this account for multiple orders
    console.log('new notification');

    let newNotif = new Notification({
        sender: req.user._id,
        receiver: req.body.receiver,
        type: req.body.type,
        content: req.body.content,
    })

    newNotif.save().then(notif => res.json('notification saved!'))

    // NOW ADD ROUTE TO PUSH NOTIFICATIONS ON USER END

})

// GET NOTIFICATION FOR BOTH USER & DRIVER
router.get('/', (req, res) => {
    const searchQ = {};

    if (req.query.sender) {
        searchQ['sender'] = req.user._id
    } else if (req.query.receiver) {
        searchQ['receiver'] = req.user._id
    } else {
        res.json({ error: 'No user found'})
    }

    Notification.find(searchQ)
    .then(notifs => {
        res.json({
            notifications: notifs
        })
    })
})

export default router;
