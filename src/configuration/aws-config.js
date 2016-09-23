"use strict";

let AWS = require("aws-sdk");
let endpoint = require("./app-config").dynamo_endpoint;

AWS.config.update({
    region: "us-west-2",
    endpoint: endpoint
});
