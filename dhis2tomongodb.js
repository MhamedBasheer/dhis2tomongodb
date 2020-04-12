const mongoose = require('mongoose');
var request = require('request');
var options = {
  'method': 'GET',
  'url': 'http://192.168.226.130:8877/api/organisationUnits?level=6&pageSize=5000',
  'headers': {
    'Authorization': 'Basic YW16YTpkaXN0cmljdA==',
    'Cookie': 'JSESSIONID=5D803149A98171F31BF324B88657347D'
  }
};

mongoose.connect('mongodb://127.0.0.1:27017/savics'); //No password used

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error'));
db.on('open', function(callback) {
console.log('Connected to database.');
});

var Schema = mongoose.Schema;

var facilitySchema = new Schema({
  id: String,
  fosaCode: Number,
  name: String,
  description: String,
  url: String,
  type: String,
  geoPosition: {
    province: String,
    district: String,
    sector: String,
    cell: String,
    umudugudu: String,
  },
  openingDate: Date,
  closingDate: Date,
  email: String,
  phoneNumber: String,
  manager: String,
  coordinate: {
    longitude: String,
    latitude: String,
    altitude: String,
  }
});
var Facility = mongoose.model('Facility', facilitySchema);

request(options, function (error, response) {
  if (error) throw new Error(error);

  var body = JSON.parse(response.body);
  console.log(body.pager.total);

  function loopOrg(a,orgSize){
    orgSize = body.pager.total;
    if(a==orgSize){
      console.log(a +" organisations loaded");
      process.exit();
    }
    else {
      var options1 = {
        'method': 'GET',
        'url': 'http://192.168.226.130:8877/api/organisationUnits/'+body.organisationUnits[a].id,
        'headers': {
          'Authorization': 'Basic YW16YTpkaXN0cmljdA==',
          'Cookie': 'JSESSIONID=5D803149A98171F31BF324B88657347D'
        }
      };
      request(options1, function (error, response1) {
        if (error) throw new Error(error);
        var body1 = JSON.parse(response1.body);
  
        var NewFacilty = Facility({
          id: body1.id,
          name: body1.displayName,
          fosaCode: body1.code,
          description: body1.description,
          url: body1.url,
          type: body1.type,
          geoPosition: {
            province: body1.province,
            district: body1.district,
            sector: body1.sector,
            cell: body1.cell,
            umudugudu: body1.umudugudu,
          },
          openingDate: body1.openingDate,
          closingDate: body1.closingDate,
          email: body1.email,
          phoneNumber: body1.phoneNumber,
          manager: body1.manager,
          coordinate: {
            longitude: body1.longitude,
            latitude: body1.latitude,
            altitude: body1.altitude,
          }
        });
        console.log (NewFacilty);
        NewFacilty.save(); //See error handling/confirmation in our Mongoose guide.	
        loopOrg(a+1);
      });  
    }
  }
  loopOrg(0,body.organisationUnits.length);
});