// import mongoose 
const mongoose = require('mongoose');

// Define an asynchronous function that initiates DB connection
const initiateDBConnection = async() => {
    try{
        // call connect() method in mongoose 
        // the method expects the connection URI which we stored as an environment variable.
        await mongoose.connect(process.env.MONGO_CONNECTION_URI);
        console.log('Connected to Mongo DB server.');
    }catch(error) {
        console.log(error);
    }
};

// Export this function as a default export  
module.exports = initiateDBConnection;