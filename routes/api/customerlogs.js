/*
Create below an express.js route that queries a Mongo database to get all the customer logs for a given locationId and date range
and returns them grouped by customer. The relevant database tables have the following structures:
locations { locationId, name, createdDate }
customers { customerId, locationId, firstName, lastName, email, phone, createdDate }
customerLogs { customerId, type, text, date }
*/

const express = require('express'); //Needed to set up routers
const router = express.Router();

const db = require('mongodb').MongoClient; //Needed to connect to database
const url = process.env.ATLAS_CONNECTION; //Where the database lives. I stored my URL in a secure .env file
const settings = {useUnifiedTopology: true};
const dbName = 'opiniion_test';



//Helper function getCustomersByLocationId
//param locationId: (string) the id of a location in the database we want the customer logs of.
//returns an array of customers that have the same locationId as the parameter.
const getCustomersByLocationId = (locationId) => {
    const myPromise = new Promise((resolve, reject) => {  //Utilizes a promise
        db.connect(url, settings, function(err, client) { //connect to Mongo database using the mongo connection object db
          if(err) { //if connection fails
            reject(err);  //Reject promise with error message of connection failure
          } else {  //if connection is successful, continue
            const dB = client.db(dbName); //Identify proper database and collection to read
            const collection = dB.collection("customers");
            collection.find({locationId}).toArray(function(err, docs) {
              if(err) { //if turning find results into array doesn't work 
                reject(err);  //send error message
              } else {
                resolve(docs);  //resolve promise with the array of customers with the right locationId
                client.close(); //end connection with Mongo database
              }
            });
          }
        });
    });
    return myPromise; //send a promise to provide either resolved array or rejection error object
  }
  //helper function getCustomerLogsByCustomerId 
  //Param customerId: the ID of the customer you wish to get the logs of.
  //Param startDate: a string describing the start date of the logs you wish to request. 
  //Param endDate: a string describing the end date of the logs you wish to request.
  //returns an object with the following key value pairs:
  //  customerLogs- an array of customer logs that fit all parameters.
  //  customerId- the same as the function parameter (string).
  //  logCount- the length of the customerLogs array or the amount of logs that fit the parameters (number). 
  const getCustomerLogsByCustomerId = (customerId, startDate, endDate) => {
    const myPromise = new Promise((resolve, reject) => {  //Utilizes a promise to handle async behavior
      db.connect(url, settings, function(err, client) { //connect to the Mongo database using the mongo connection object db
        if(err) { //if the connection fails
          reject(err);  //return a rejected promise because of a failed database connection
        } else {  //If connection is successful
          const dB = client.db(dbName); //Identify the right database and collection to read
          const collection = dB.collection("customerLogs");
          collection.find({customerId}).toArray(function(err, docs) { //turn results of find function into array
            if(err) { //If find breaks, send promise rejection
              reject(err);
            } else {  //If collection.find works
              let unfilteredLogs = docs;  //grab the array from the database
              let filteredLogs;
              try { //Attempt to filter down logs array to match requested date range
                let start = new Date(startDate);  //convert string into Date object
                let end = new Date(endDate);
                filteredLogs = unfilteredLogs.filter(log => { //assign filtered down array to filterLogs
                  let date = new Date (log.date); //turn string from the current log into a date value
                  if(date >= start && date <= end) {  //If the date is within range
                    return true;  //Keep it in the filtered array
                  } else {
                    return false; //drop it from the filtered array
                  }
                });
              } catch(err) {  //If something goes wrong with the filtering
                reject({error: "Invalid date input given"});  //Send rejection due to dates messing up filter
              }
              let logObject = { //This object groups each set of customer logs by customer
                customerId,
                logCount : filteredLogs.length,
                customerLogs : filteredLogs,
              }
              resolve(logObject); //Return the grouped customer logs as a promise resolution
              client.close(); //end connection to the database
            } 
          });
        }
      });
    });
    return myPromise; //Returns a promise to provide either the resolved object or a rejection error object
  }
  
  // Use db as the mongo connection object
  // Assume req.body contains a locationId, startDate and endDate.

  router.get('/', async function(req, res) {
    try { //Attempt to get the requested list of customer logs
      const customers = await getCustomersByLocationId(req.body.locationId);  //get the array of customers that have the right locationId.
      let result = [];  //begin with emty array
      for(const customer of customers) {  //get the logs for every customer that match the parameters
        let currentCustomerLogs = await getCustomerLogsByCustomerId(customer.customerId, req.body.startDate, req.body.endDate);
        result.push(currentCustomerLogs); //add the log object to the result array.
      }
      res.send(result); //Send the array of customer logs grouped by customer that matches the locationId and date range.
    } catch(err) {
      if(err.error) { //If the helper functions returned an object with an error key
        res.status(400).send(err);  //Return a bad request HTTP code.
      } else {
        console.log(err); //Print out the detailed error
        res.status(500).send('Internal server issue, check logs');  //Send level 500 error message, caused by error on server
      }
    }
    
  });
  
  router.post('/opiniionTest', function(req, res) {
    res.send('Finished!');
  });

  module.exports = router;