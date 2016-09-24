"use strict";

let express = require("express");
let bodyParser = require("body-parser");
let appConfig = require("./configuration/app-config");
let chalk = require("chalk");
let initRoutes = require("./configuration/init-routes");
let startupHealthCheck = require("./configuration/startup-health-check");

module.exports = function () {
    "use strict";

    require("./configuration/aws-config");
    let LOGGER = require("./configuration/logger");

    LOGGER.log("info", "Starting application...");

    let app = express();
    app.use(bodyParser.json());
    app.use(express.static(appConfig["static_source"]));

    initRoutes(app);

    let port = appConfig["port"];
    startupHealthCheck().then(() => {
        app.listen(appConfig["port"]);
        LOGGER.log("info", `Goblins listening on ${port}`);
    }).catch(() => {
        LOGGER.log("error", `Database (${appConfig["dynamo_endpoint"]}) cannot be reached.`);
    })
};
