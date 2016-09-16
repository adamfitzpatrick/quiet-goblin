"use strict";

let express = require("express");
let bodyParser = require("body-parser");
let getAppParams = require("./configuration/get-app-config");
let port = getAppParams("port");

// Mongoose configuration
require("./configuration/mongoose-config")();

// Server configuration
let app = express();
app.use(bodyParser.json());
//app.use(express.static(getAppParams("static_source")));

require("./configuration/logging-config")(app);

// Routing configuration
require("./routes/health-routes")(app);
require("./routes/post-routes")(app);

// Start server
console.log(`Goblins rampaging on port ${port}.`);
app.listen(port);