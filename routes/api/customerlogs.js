const express = require('express'); //Needed to set up routers
const router = express.Router();

const MongoClient = require('mongodb').MongoClient; //Needed to connect to database
const ObjectID = require('mongodb').ObjectID;
const url = process.env.ATLAS_CONNECTION;
const settings = {useUnifiedTopology: true};
const dbName = 'opiniion_test';

/*
Create below an express.js route that queries a Mongo database to get all the customer logs for a given locationId and date range
and returns them grouped by customer. The relevant database tables have the following structures:
locations { locationId, name, createdDate }
customers { customerId, locationId, firstName, lastName, email, phone, createdDate }
customerLogs { customerId, type, text, date }
*/

//Helper function getCustomersByLocationId returns an array of customers with matching locationId
//Reaches it out to the Mongo Database to retrieve data.
const getCustomersByLocationId = (locationId) => {
    const myPromise = new Promise((resolve, reject) => {
        MongoClient.connect(url, settings, function(err, client) {
          if(err) {
            reject(err);
          } else {
            const db = client.db(dbName);
            const collection = db.collection("customers");
            try {
              collection.find({locationId}).toArray(function(err, docs) {
                if(err) {
                  reject(err);
                } else {
                  resolve(docs);
                  client.close();
                }
              });
            } catch(err) {
              reject({error : "something went wrong"});
            }
          }
        });
    });
    return myPromise;
  }
  
  // Use db as the mongo connection object
  // Assume req.body contains a locationId, startDate and endDate.

  router.get('/', async function(req, res) {
    console.log("Url", url);
    const customers = await getCustomersByLocationId("0");
    const result = "result";
    res.send(result);
  });
  router.post('/opiniionTest', function(req, res) {
    res.send('Finished!');
  });

  module.exports = router;