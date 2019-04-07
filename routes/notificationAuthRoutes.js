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
