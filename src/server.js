"use strict";

let express = require("express");
let bodyParser = require("body-parser");
let appConfig = require("./configuration/app-config");
let initRoutes = require("./configuration/init-routes");

module.exports = function () {
    require("./configuration/aws-config");
    let LOGGER = require("./configuration/logger");

    LOGGER.log("info", "Starting application...");

    let app = express();
    app.use(bodyParser.json());
    app.use(express.static(appConfig.static_source));

    initRoutes(app);

    let port = appConfig.port || process.env.PORT;
    app.listen(port);
    LOGGER.log("info", `Goblins listening on ${port}`);
};
