"use strict";

let winston = require("winston");
let appConfig = require("./app-config");
let path = require("path");
let mkdirp = require("mkdirp");

let transports = appConfig.log_transports.map((transport) => {
    mkdirp(path.resolve(process.cwd(), path.dirname(transport.params.filename)));
    return new (winston.transports[transport.type])(transport.params);
});

let loggerConfig = {
    transports: transports
};

let LOGGER = new winston.Logger(loggerConfig);

module.exports = LOGGER;