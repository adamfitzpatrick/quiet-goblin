"use strict";

let express = require("express");
let bodyParser = require("body-parser");
let getAppParams = require("./configuration/get-app-config");

// Data setup
require("./configuration/data-config")();

// Mongoose configuration
require("./configuration/mongoose-config")();

// Server configuration
let app = express();
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.static(getAppParams("static_source")));
require("./configuration/logging-config")(app);

// Routing configuration
require("./routes/post-routes")(app);

// Start server
console.log("Goblins rampaging on port 7002.");
app.listen(7002);