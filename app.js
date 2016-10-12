"use strict";

if (process.env.EB_INSTANCE_ENV_TAG) {
    process.env.NODE_ENV = process.env.EB_INSTANCE_ENV_TAG;
}

let bluebird = require("bluebird");
let request = bluebird.promisify(require("request"));
let endpoint = require("./src/configuration/app-config").dynamo_endpoint;

require("./src/server.js")();
