"use strict";

process.argv.push("--env");
process.argv.push("e2e");

let bluebird = require("bluebird");
let AWS = require("aws-sdk");

require("../../src/configuration/aws-config");

let docClient = new AWS.DynamoDB.DocumentClient();
bluebird.promisifyAll(docClient);

let put = (tableName, item) => {
    if (item.date) { item.date = item.date.toISOString(); }
    return docClient.putAsync({ TableName: tableName, Item: item}).catch((err) => {
        console.log(err);
    });
};

let get = (tableName, id) => {
    return docClient.getAsync({ TableName: tableName, Key: { id: id}}).then((data) => {
        return data;
    });
};

let wipe = () => require("./make-tables")(true);

module.exports = {
    put: put,
    get: get,
    wipe: wipe
};