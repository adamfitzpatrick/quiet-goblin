"use strict";

let bluebird = require("bluebird");
let request = bluebird.promisify(require("request"));
let endpoint = require("./src/configuration/app-config").dynamo_endpoint;

request(endpoint).then(() => {
    require("./src/server.js")();
}).catch(() => {
    console.error(`Database (${endpoint}) cannot be reached.`);
});