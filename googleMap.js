const {google} = require('googleapis');
const express = require ('express');
const bodyParser = require('body-parser');

var googleMapsClient = require('@google/maps').createClient({
    key:'AIzaSyDPf8q0Exfruq38Lv8b-Ni7K2kZ-OcDeYc'
})

var app = express();
var _ = require('underscore');
var stringSimilarity = require('string-similarity')
var geolib = require('geolib');
var iplocation = require('iplocation');

app.get('/',async(req,res)=>{
    axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          key: process.env.API_KEY,
          origins: `37.7749,-122.4192`,
          destinations: `32.78306,-96.80667`,
        },
      })
      .then((res)=>{
          console.log(res.data.row[0].elements[0].distance.value)
      })
      .catch(err =>{
          console.log(err)
      })
      res.json({
          data:[]
      });
})

app.listen(3000);