"use strict";

let yargs = require("yargs");

let env = yargs.argv.env || process.env.NODE_ENV || "prod";

module.exports = require("../../app-config.json")[env];