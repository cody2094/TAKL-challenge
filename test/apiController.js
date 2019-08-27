
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
chai.use(chaiHttp);

describe('hooks', function() {

  after(done => {
    server.stop(done);
    done();
  });

  describe('Testing POST /providerRequest', () => {
    it('/providerRequest with correct data returns correct data', (done) => {
      let requestBody = {
        provider: 'some-random-provider',
        geo_coordinates: [38.04503, -84.51458],
        addresses: [{
          street_address: '2309 meadow drive',
          city: 'louisville',
          state: 'ky',
          zip: '40218'
        },{
          street_address: '427 nichol mill lane',
          city: 'franklin',
          state: 'TN',
          zip: '37067'
        }]
      };

      let expectedReturn = [
        {"street_address":"2309 meadow drive","coordinates":[38.20584,-85.6625]},
        {"street_address":"427 nichol mill lane","coordinates":[35.95608,-86.81908]}
      ];

      chai
        .request(server)
        .post("/providerRequest")
        .send(requestBody)
        .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.a('array');
              res.body.should.be.eql(expectedReturn);
          done();
        });
    })
  });

});
