var axios = require('axios');
import express from 'express';
import bodyParser from 'body-parser';
const app = express();
import routes from './routes/routes.js'
import authRoutes from './routes/authRoutes.js';
const PORT = process.env.PORT || 3000;



if (!process.env.MONGODB_URI) {
  console.log('MONGODB_URI config failed');
  process.exit(1);
}

import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on('connected', function() {
  console.log('Connected to MONGODB!');
  console.log('mong',process.env.API_KEY)
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);
app.use('/', authRoutes);


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


const server = app.listen(PORT, () => {
  const { address, port } = server.address();
  console.log(`Listening at http://localhost:${port}`);
})
