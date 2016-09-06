"use strict";

let FileStreamRotator = require("file-stream-rotator");
let fs = require("fs");
let morgan = require("morgan");
let getAppConfig = require("./get-app-config");

module.exports = function loggingConfig(app) {
    // ensure log directory exists
    let logDir = getAppConfig("log_directory");
    fs.existsSync(logDir) || fs.mkdirSync(logDir);

    // create a rotating write stream
    var goblinLogStream = FileStreamRotator.getStream({
        date_format: 'YYYYMMDD',
        filename: logDir + '/goblins-%DATE%.log',
        frequency: 'daily',
        verbose: false
    });

    app.use(morgan(getAppConfig("log_format"), {stream: goblinLogStream}));
    app.use(morgan(getAppConfig("log_format")));
};
