const express = require('express');
const router = express.Router();

/*
Create below an express.js route that queries a Mongo database
to get all the customer logs for a given locationId and date range
and returns them grouped by customer.
The relevant database tables have the following structures:
locations {
  locationId,
  name,
  createdDate
}

customers {
  customerId,
  locationId,
  firstName,
  lastName,
  email,
  phone,
  createdDate
}

customerLogs {
  customerId,
  type,
  text,
  date
}
*/

//Helper function getCustomersByLocationId returns an array of customers with matching locationId
//Reaches it out to the Mongo Database to retrieve data.
const getCustomersByLocationId = (locationId) => {
    const myPromise = new Promise((resolve, reject) => {
        
    });
    return myPromise;
  }
  
  // Use db as the mongo connection object
  // Assume req.body contains a locationId, startDate and endDate.
  router.post('/opiniionTest', function(res, req) {
    res.send('Finished!');
  });

  module.exports = router;