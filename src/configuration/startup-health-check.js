"use strict";

let Promise = require("bluebird");
let request = Promise.promisify(require("request"));
let endpoint = require("./app-config")["dynamo_endpoint"];

function checkHealth() {
    return request(endpoint);
}

module.exports = checkHealth;