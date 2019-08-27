'use strict';

exports.createRequest = function (req, res) {
  // Create Response Callbacks
  var errorCallBack = function(errors) {
    res.status(400).send(errors);
  }
  var successCallBack = function(response) {
    res.status(201).send(response);
  }

  // Verify we have good data
  var errors = validateCreateData(req.body);
  if (errors.length > 0) {
    errorCallBack(errors);
    return;
  }

  // Convert Addresses to geocodes
  var geocodeLocations = require('./geocodeLocations');
  geocodeLocations.geocodeLocations(req.body.addresses, geocodeMatrixCallback);

  // This variable will be used in OptimizeRoutes in order to map the optimized order back
  //  to the route information
  var destGeocodes = [];
  // Build gecodeMatrix
  function geocodeMatrixCallback(destinationGeocodes) {
    destGeocodes = destinationGeocodes;
    var startingGeocode = [ req.body.geo_coordinates ]
    // We will need to appened destination Geocodes to the start to complete the matrix in one request
    // Note that this limits the amount of requests we can take to 14. (limit of 15 starting points)
    startingGeocode = startingGeocode.concat(destinationGeocodes);
    const geocodeRouteMatrix = require('./geocodeRouteMatrix');
    geocodeRouteMatrix.geocodeRouteMatrix(startingGeocode, destinationGeocodes, optimizeRoutes);
  }

  function optimizeRoutes (routeMatrix) {
    var cleanedMatrix = cleanRoutes(routeMatrix);
    // Returns [ minimumTime, optimizedRoute ]
    var minimumRoute = calculateMinimumRoute(cleanedMatrix);

    // Build the Response Route
    var responseRoute = [];
    minimumRoute[1].forEach( function (value) {
      responseRoute.push({
        street_address: req.body.addresses[value].street_address,
        coordinates:    destGeocodes[value]
      });
    });
    insertData(responseRoute);
    //console.log(responseRoute);
  }

  function insertData(jsonResponse) {
    const requestLog = require('./requestlog');
    var data = {
      providerID:   req.body.provider,
      jsonRequest:  req.body,
      jsonResponse: jsonResponse,
      created:      new Date()
    };
    requestLog.create(data, errorCallBack, successCallBack);
  }
}


function validateCreateData(data) {
  var errors = [];

  // Verify we have a json object;
  if (typeof data !== 'object') {
    errors.push('Data must be a json object');
  }

  // Handle "provider"
  var hasProvider = data.hasOwnProperty('provider');
  if (hasProvider) {
    if ( typeof data.provider !== 'string' && typeof data.provider !== 'number' ) {
      errors.push('The provider parameter must be a string or number');
    }
  } else {
    errors.push('You must give a provider');
  }

  // Handle "geo_coordinates"
  var hasGeoCoords = data.hasOwnProperty('geo_coordinates');
  if (hasGeoCoords) {
    if (!Array.isArray(data.geo_coordinates) || data.geo_coordinates.length !== 2) {
      errors.push('The geo_coordinates parameter must be an array containing two coordinates');
    }
  } else {
    errors.push('You must give "geo_coordinates"');
  }

  // Handle "Addresses"
  var hasAddresses = data.hasOwnProperty('addresses');
  if (hasAddresses) {
    if (!Array.isArray(data.addresses) || data.addresses.length === 0) {
      errors.push('The addresses parameter must be an array with at least one address');
    } else if (data.addresses.length > 14) {
      errors.push('The limit for the number of addresses on one request is 14.');
    } else {
      var keys = ['street_address', 'city', 'state', 'zip'];
      // Verify each address
      data.addresses.forEach(function(address) {
        keys.forEach(function(key) {
          if (typeof address !== 'object') {
            errors.push('Each address must be an object');
          } else if (!address.hasOwnProperty(key) || typeof address[key] !== 'string' ||
                      address[key].length === 0) {
            errors.push('Each address property "' + key + '" must be a non-empty string');
          }
        })
      });
    }
  } else {
    errors.push('You must give atleast 1 valid address');
  }

  return errors;
}

function cleanRoutes(matrixEntries) {
  var cleanMatrix = [];

  matrixEntries.forEach(function (entry) {
    if (!Array.isArray(cleanMatrix[entry.startIndex])) {
      cleanMatrix[entry.startIndex] = [];
    }
    cleanMatrix[entry.startIndex][entry.destinationIndex] = entry.summary.travelTime;
  });

  return cleanMatrix;
}


function calculateMinimumRoute(matrix) {
  // Initialize Variables
  var totalDestinations = matrix[0].length;
  var totalTime = [];
  var DestinationsUsed = [];
  var minimumTime = null;
  var optimizedRoute = null;

  // Using NN approximation method cycle through each destination as a starting point
  for (var i=0; i < totalDestinations; i++) {
    // Begin time counter
    totalTime[i] = matrix[0][i];
    // Keep track of destination orders
    DestinationsUsed[i] = [ i ];
    // Cache last destination
    var lastDestination = i;

    for (var x=1; x < totalDestinations; x++) {
      var nextMin = findMatrixMin(matrix[lastDestination+1], DestinationsUsed[i]);
      // Cache used destination
      DestinationsUsed[i].push(nextMin[0]);
      totalTime[i] += nextMin[1];
      // Cache the most recent destination
      lastDestination = nextMin[0];
    }

    // Update the minimum route if applicable
    if ( minimumTime === null || (totalTime[i] < minimumTime) ) {
      minimumTime = totalTime[i];
      optimizedRoute = DestinationsUsed[i];
    }
  }

  return [ minimumTime, optimizedRoute ];
}

function findMatrixMin(matrixRow, excludeKeys) {
  var min = null;
  var minKey = null;
  matrixRow.forEach( function (value, index) {
    if ( value !== 0 && !excludeKeys.includes((index)) ) {
      if (min === null || (min !== null && value < min)) {
        min = value;
        minKey = (index);
      }
    }
  });

  return [ minKey, min ];
}