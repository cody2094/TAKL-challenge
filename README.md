# TAKL TSP Challenge

## Description
This is a docker package with a node.js based API to help solve a variation of the Traveling Salesman Problem.
This node package uses the Nearest Neighbor(NN) approximation method to determine an optimized route.

## Running this package

  ### Run Locally
  1. Using `config/config.dist.json`, create `config/config.json` and fill in the `api` and `db` properties with the correct HERE API and database settings
  2. Install the package using `npm i` from the package root
  3. Run `sequelize db:migrate` from the package root. This will take care of setting up the database for you.
  4. Run `npm start` from the root directory to start the API
  5. You can now test out the `/providerRequest` endpoint by following the directions in the "API Endpoints" section below.
  6. Alternatively you can run the tests by running `npm test`. This uses Karma for unit testing and nyc for code coverage. As of current writing the code coverage is as follows.
  ```
    ------------------------|----------|----------|----------|----------|-------------------|
    File                    |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
    ------------------------|----------|----------|----------|----------|-------------------|
    All files               |    88.21 |    72.13 |     88.1 |    88.02 |                   |
    TAKL                    |    95.24 |      100 |       75 |    95.24 |                   |
      server.js             |    95.24 |      100 |       75 |    95.24 |                49 |
    TAKL/controllers        |    85.71 |    71.15 |     87.5 |    85.42 |                   |
      apiController.js      |    85.23 |    67.39 |    93.33 |    84.88 |... 18,125,128,134 |
      geocodeLocations.js   |     87.5 |      100 |    85.71 |     87.1 |       68,69,70,71 |
      geocodeRouteMatrix.js |    86.36 |      100 |    85.71 |    86.36 |          50,51,52 |
      requestlog.js         |       80 |      100 |    66.67 |       80 |                14 |
    TAKL/models             |    95.83 |    77.78 |      100 |    95.83 |                   |
      index.js              |       95 |    77.78 |      100 |       95 |                13 |
      requestlog.js         |      100 |      100 |      100 |      100 |                   |
    TAKL/routes             |      100 |      100 |      100 |      100 |                   |
      apiRoutes.js          |      100 |      100 |      100 |      100 |                   |
    ------------------------|----------|----------|----------|----------|-------------------|
  ```

  ### Run In a docker container
  1. Using `config/config.dist.json`, create `config/config.json` and fill in the `api` and `db` properties with the correct HERE API and database settings
  2. For the first time around run `docker-compose up`.
  3. To rebuild after making any changes run `docker-compose up --build`
  4. I've got the DB set up to run on port 3307 locally so it doesn't interfeare with my local 3306 port but the server itself is on 3306. I've also done the same thing with the API. Its running on 8080 in the container but 8081 locally.
  5. You can now test out the `/providerRequest` endpoint by following the directions in the "API Endpoints" section below.

## API Endpoints
1. **POST** `/providerRequest`
 - This Request takes in a pair of geo_coordinates for a starting point and then an array of addresses.
   Using the HERE API, It will then geocode each address and generate a point-paired route matrix. Using that matrix,
   it will use the NN approximation method to genereate a few route possibilities and pick the shortest route based on time.
   The response is an array of objects with the geocodes coordinates and address. The objects are in the optimized order.
 - Request
  Once the API is running send a POST request like the one below to `http://localhost:8080/providerRequest`
  ```
   {
     "provider": "some-random-provider",
     "geo_coordinates": [38.0453,-84.51458],
     "addresses": [
       {"street_address":"an address","city":"a city","state":"KY","zip":"55555"},
       {"street_address":"an address","city":"a city","state":"TN","zip":"55555"}
      ]
    }
  ```
 - Response
  Upon a successful request you should receive something similar to the following. :
  ```
   [
     {"street_address":"2309 meadow drive","coordinates":[38.20584,-85.6625]},
     {"street_address":"427 nichol mill lane","coordinates":[35.95608,-86.81908]}
   ]
  ```

## To Dos
 1. Unit Testing
 - This challenge only called for 80% code coverage... I hit `88.21` and I ran out of time with other challenges so I didn't test
    sending invalid data to the functionality but I did cover validating the datatypes with `apiController.validateCreateData()`
 2. HERE API integration
 - I'm assuming a success on the API calls for geocoded locations once the datatypes are validated.. I had a hard time _not_ receiving a latitude and longitude for locations outside of that.
 - I could do a better job of logging errors and handling `fetch` error calls to the HERE API functionality.
 3. Organization
 - I could fragment out some of `apiController()` and have some better organization with the helper functions but I didn't spend a ton of time on it
  given that there is only one API request.
 - Overall I could use promises to make things cleaner.

## Links
[TSP Overview](https://en.wikipedia.org/wiki/Travelling_salesman_problem)
[GeoLocation/Routing](https://developer.here.com)
