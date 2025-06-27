// Imports 
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const initiateDBConnection = require('./Config/db');
const routes = require('./routes');

// Load environment variables
dotenv.config({ 
    path: './.env' 
});

// Create Express app instance
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount API routes
app.use('/api', routes);

// Start server
app.listen(process.env.PORT, async() => {
    console.log(`Server has been started and is listening to port ${process.env.PORT}`);
    // Call the asynchronous function to initiate DB connection once the server starts listening 
    await initiateDBConnection();
});