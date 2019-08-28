const express = require("express");
const app = express();
const cors = require("cors");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || 'development';
const dbConfig = require("./config/config.json")[env];
const port = 8080;
const bodyParser = require('body-parser');

dbConnect();

// Set up API
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Import Routes
const routes = require('./routes/apiRoutes')(app);

// Start API
let server = app.listen(port);
console.log('API server listening on port: ' + port);

module.exports = app; // for testing
module.exports.stop = function() {
  server.close();
}; // for testing

function dbConnect() {
  const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
        timestamps: false
    }
  });

  sequelize
    .authenticate()
    .then(() => {
      console.log("DB Connection established successfully.");
    })
    .catch(err => {
      console.log("Unable to connect to the database:", err);
    });
}

