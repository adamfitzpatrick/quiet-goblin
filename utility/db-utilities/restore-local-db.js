"use strict";

let bluebird = require("bluebird");
let path = require("path");
let AWS = require("aws-sdk");
let chalk = require("chalk");
require("../../src/configuration/aws-config");

let backupDir = path.resolve(__dirname, "./backup");
let tables = require("./datatables.json");

let docClient = new AWS.DynamoDB.DocumentClient();
bluebird.promisifyAll(docClient);

let maxCount = 25;

function getData(table, fake) {
    if (fake) {
        return require("./fake-db.js")[table.TableName];
    }
    return require(path.join(backupDir, `${table.TableName}.json`)).Items;
}
function chunk(items) {
    let chunks = [];
    while (items.length) {
        let end = Math.min(maxCount, items.length);
        chunks.push(items.splice(0,end));
    }
    return chunks;
}

function batchWriteChunk(table, chunk) {
    let request = { RequestItems: {}};
    let putRequests = chunk.map(bit => {
        return {
            PutRequest: {
                Item: bit
            }
        };
    });
    request.RequestItems[table.TableName] = putRequests;
    return docClient.batchWriteAsync(request).then(() => {
        console.log(chalk.green(`${chunk.length} item(s) written to ${table.TableName}.`));
    }).catch((err) => {
        /* jshint maxlen: false */
        console.log(chalk.red(`Error writing ${chunk.length} item(s)to ${table.TableName}: ${err.cause}`));
    });
}

function doRestore(fake) {
    let promises = [];
    tables.forEach(table => {
        let items = getData(table, fake);
        chunk(items).forEach((chunk) => {
            promises.push(batchWriteChunk(table, chunk));
        });
    });
    return bluebird.all(promises);
}

module.exports = function (fake) {
    return require(path.resolve(__dirname, "./make-tables"))().then(() => doRestore(fake));
};