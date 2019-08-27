'use strict';
module.exports = function(app) {
  var apiController = require('../controllers/apiController');

  // api Routes
  app.route('/providerRequest')
     .post(apiController.createRequest);

};
