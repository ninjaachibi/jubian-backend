var axios = require('axios');
import express from 'express';
import bodyParser from 'body-parser';
const app = express();

import routes from './routes/routes.js'
import authRoutes from './routes/authRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import driverAuthRoutes from './routes/driverAuthRoutes';
import notificationRoutes from './routes/notificationRoutes';
import notificationAuthRoutes from './routes/notificationAuthRoutes';

const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
  console.log('MONGODB_URI config failed');
  process.exit(1);
}

import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on('connected', function() {
  console.log('Connected to MONGODB!', process.env.MONGODB_URI);
  console.log('GOOGLE_API KEY is ',process.env.API_KEY)
})

const allowCrossDomain = function(req, res,next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

app.use(allowCrossDomain)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/tos.pdf', function(req,res){
  res.sendFile(__dirname + '/public/tos.pdf');
 }); 

app.use('/driver', driverRoutes);
app.use('/driver', driverAuthRoutes);
app.use('/notification', notificationRoutes);
app.use('/notification', notificationAuthRoutes);
app.use('/', routes);
app.use('/', authRoutes);

// app.use(logger('dev'));

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

const server = app.listen(PORT, () => {
  const { address, port } = server.address();
  console.log(`Listening at http://localhost:${port}`);
})
