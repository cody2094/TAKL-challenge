const requestLog = require('../models').requestLog;

module.exports = {
  create(data, errorCallBack, successCallBack) {
    return requestLog
      .create({
        ID:           data.ID,
        providerID:   data.providerID,
        jsonRequest:  data.jsonRequest,
        jsonResponse: data.jsonResponse,
        created:      data.created
      })
      .then(data => successCallBack(data.jsonResponse))
      .catch(error => errorCallBack(error));
  }
}