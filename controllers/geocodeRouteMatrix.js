'use strict';
const fetch = require("node-fetch");
const querystring = require('querystring');

const URLPrefix = "https://matrix.route.api.here.com/routing/7.2/calculatematrix.json?";
const config = require("../config/config.json").api;


/**
 * This is the main controller for the module that interacts with the
 * HERE api to generate a paired route matrix
 *
 * @param array      startingGeocodes     The starting codes for the matrix
 * @param array      destinationGeocodes  The destination codes for the matrix
 * @param function   callBack             The function to call once completed
 */
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

/**
 * This is the main controller for the module that interacts with the
 * HERE api to generate a paired route matrix
 *
 * @param string      type    The prefix for the parameter key
 * @param array    geocodes   The codes to key
 *
 * @return a keyed array with type+index as the key and the geocode as the value
 */
function createGeocodeParams(type, geocodes) {
  var geocodeParams = {};
  geocodes.forEach( function (geocode, index) {
    geocodeParams[ type + index ] = geocode.join(',');
  });
  return geocodeParams;
}

/**
 * This is a promise for handling the API call using `fetch`
 *
 * @param string    URL                 The URL + query parameters
 * @param function  requestCallBack     called when completed
 */
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
