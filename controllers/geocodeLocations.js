'use strict';
const fetch = require("node-fetch");
const querystring = require('querystring');

const URLPrefix = "https://geocoder.api.here.com/6.2/geocode.json?";
const config = require("../config/config.json").api;

// This variable will hold on to all of the locations.
var geocodedLocations = [];
var locationIndex = 0;

/**
 * This is the main controller for the module that interacts with the
 * HERE api to geocode locations. Locations are geocoded one at a time
 * using chained promises.
 *
 * @param array      array of addresses
 * @param function   the callback function to call once all locations
 *                    are geocoded
 */
exports.geocodeLocations = function (addresses, finishedCallBack) {
  var num_addresses = addresses.length;
  geocodeLocation(null, addresses, num_addresses, finishedCallBack);
}

/**
 * This is a recursive function that chains requests to the HERE API
 *
 * @param mixed      Body               Be sure to pass null the first time around.
 * @param function   addresses          The array of addresses to gecode
 * @param array      total              total number of addresses
 * @param function   finishedCallBack   the callback function to call once all locations
 */
function geocodeLocation(body, addresses, total, finishedCallBack) {
  var finished = ( geocodedLocations.length === total);
  // If this is the first time around or we have reached the total don't increment the counter
  if ( body !== null && (!finished) ) {
    // We have an existing promise
    locationIndex++;
  } else if ( finished ) {
    finishedCallBack(geocodedLocations);
    return 'Chained Promises Finished';
  }

  var this_address = addresses[locationIndex];
  var search = Object.values(this_address).join(' ');
  var URLparams = {
    app_id:     config.app_id,
    app_code:   config.app_code,
    searchtext: search
  };
  URLparams = querystring.stringify(URLparams);
  var URL = URLPrefix + URLparams;

  // This will recursively cycle through API requests chaining them together
  return handleRequest(URL, locationIndex).then( body => geocodeLocation(body, addresses, total, finishedCallBack) );
}

/**
 * This is a promise for handling the API call using `fetch`
 *
 * @param string    URL        The URL + query parameters
 * @param number    index      Used to cache the location in `geocodedLocations`
 */
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
