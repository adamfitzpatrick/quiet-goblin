"use strict";

let yargs = require("yargs");
let appConfig = require("../app-config.json");

let env = yargs.argv.env || "prod";

module.exports = function getAppConfig(param) {
    return appConfig[env][param];
};