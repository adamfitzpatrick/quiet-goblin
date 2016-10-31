"use strict";

let AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2"
});
let iamDriver = require("../iam/iam.driver");
let supportData = require("../support-data");

let adminDriver = {
    supportData: supportData,
    deleteUsers: () => iamDriver.cleanDynamoDbUserTable()
};

module.exports = adminDriver;
