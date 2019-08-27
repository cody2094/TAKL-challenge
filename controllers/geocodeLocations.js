'use strict';
const fetch = require("node-fetch");
const querystring = require('querystring');

var geocodedLocations = [];
var locationCounter = 0;
const URLPrefix = "https://geocoder.api.here.com/6.2/geocode.json?";
const config = require("../config/config.json").api;

exports.geocodeLocations = function (addresses, finishedCallBack) {
  /*var addresses = [
    {
      street_address: '2309 meadow drive',
      city:           'louisville',
      state:          'ky',
      zip:            '40218',
    },
    {
      street_address: '427 Nichol Mill Lane',
      city:           'Franklin',
      state:          'TN',
      zip:            '37067',
    }
  ];*/
  var num_addresses = addresses.length;
  geocodeLocation(null, addresses, num_addresses, finishedCallBack);
}


function geocodeLocation(body, addresses, total, finishedCallBack) {
  var finished = (locationCounter === (total - 1))
  // If this is the first time around or we have reached the total don't increment the counter
  if ( body !== null && (!finished) ) {
    // We have an existing promise
    locationCounter++;
  } else if ( finished ) {
    finishedCallBack(geocodedLocations);
    return 'Chained Promises Finished';
  }

  var this_address = addresses[locationCounter];
  var search = Object.values(this_address).join(' ');
  var URLparams = {
    app_id:     config.app_id,
    app_code:   config.app_code,
    searchtext: search
  };
  URLparams = querystring.stringify(URLparams);
  var URL = URLPrefix + URLparams;

  // This will recursively cycle through API requests chaining them together
  return handleRequest(URL, locationCounter).then( body => geocodeLocation(body, addresses, total, finishedCallBack) );
}


function handleRequest(URL, index) {
  return fetch(URL, { method : 'get' })
        .then( response => response.json() )
        .then( function(body) {
          // Store geocode for later
          var geocode = body.Response.View[0].Result[0].Location.NavigationPosition[0];
          geocode = [geocode.Latitude, geocode.Longitude];
          geocodedLocations[index] = geocode;
          return body;
        })
        // Catch any errors and resolve promise
        .catch(function(error) {
          console.log('Oops there was an error with the request!');
          console.log(error);
          geocodedLocations[index] = false;
          return false;
        });
}
