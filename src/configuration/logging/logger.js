"use strict";

let winston = require("winston");
let appConfig = require("./../app-config");
let path = require("path");
let mkdirp = require("mkdirp");

let transports = appConfig.log_transports.map((transport) => {
    mkdirp(path.resolve(process.cwd(), path.dirname(transport.params.filename)));
    return new (winston.transports[transport.type])(transport.params);
});

let loggerConfig = {
    transports: transports
};

let WINSTONLOGGER = new winston.Logger(loggerConfig);

function makeLogger(payload) {
    payload = payload || {};
    return {
        info: (msg, data) => WINSTONLOGGER.info(msg, Object.assign(data || {}, payload)),
        warn: (msg, data) => WINSTONLOGGER.warn(msg, Object.assign(data || {}, payload)),
        error: (msg, data) => WINSTONLOGGER.error(msg, Object.assign(data || {}, payload))
    };
}

module.exports = makeLogger;
