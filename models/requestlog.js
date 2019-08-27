'use strict';
module.exports = (sequelize, DataTypes) => {
  var requestLog = sequelize.define('requestLog', {
    providerID:   DataTypes.STRING,
    jsonRequest:  DataTypes.JSON,
    jsonResponse: DataTypes.JSON,
    created:      DataTypes.DATE
  }, {
    timestamps: false
  });
  requestLog.associate = function(models) {
    // associations can be defined here
  };
  return requestLog;
};