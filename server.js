const express = require('express');
const cors = require('cors');

// Initialize server
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Path to routes
const GoogleSearch = require('./api/routes/googlesearch');

// //Use routes
app.use('/webscrape', GoogleSearch);

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server running on port " + port);
});
