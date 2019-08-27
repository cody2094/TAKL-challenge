'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('requestLogs', {
      ID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      providerID: {
        allowNull: false,
        type: Sequelize.STRING
      },
      jsonRequest: {
        allowNull: false,
        type: Sequelize.JSON
      },
      jsonResponse: {
        allowNull: false,
        type: Sequelize.JSON
      },
      created: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('requestLogs');
  }
};