'use strict';
const fetch = require("node-fetch");
const querystring = require('querystring');

const URLPrefix = "https://matrix.route.api.here.com/routing/7.2/calculatematrix.json?";
const config = require("../config/config.json").api;

exports.geocodeRouteMatrix = function (startingGeocodes, destinationGeocodes, callBack) {

  var URLparams = {
    app_id:            config.app_id,
    app_code:          config.app_code,
    mode:              'fastest;car',
    traffic:           'disabled',
    summaryAttributes: 'traveltime'
  }
  // Handle start and destination parameters
  URLparams = Object.assign( URLparams, createGeocodeParams('start', startingGeocodes) );
  URLparams = Object.assign( URLparams, createGeocodeParams('destination', destinationGeocodes) );
  URLparams = querystring.stringify(URLparams);

  var URL = URLPrefix + URLparams;

  handleRequest(URL, callBack);
}

function createGeocodeParams(type, geocodes) {
  var geocodeParams = {};
  geocodes.forEach( function (geocode, index) {
    geocodeParams[ type + index ] = geocode.join(',');
  });
  return geocodeParams;
}

function handleRequest(URL, requestCallBack) {
  return fetch(URL, { method : 'get' })
        .then( response => response.json() )
        .then( function(body) {
          // Handle matrix stuff
          requestCallBack(body.response.matrixEntry);
          return true;
        })
        // Catch any errors and resolve promise
        .catch(function(error) {
          console.log('Oops there was an error with the request!');
          console.log(error);
          return false;
        });
}
