"use strict";

let bluebird = require("bluebird");
let chalk = require("chalk");
let AWS = require("aws-sdk");
require("../../src/configuration/aws-config");

let tables = require("./datatables.json");

let dynamodb = new AWS.DynamoDB();
bluebird.promisifyAll(dynamodb);

let createTable = (table, silent) => {
    return dynamodb.createTableAsync(table).then(() => {
        if (!silent) {
            console.log(chalk.green(`Created table ${table.TableName}`));
        }
    }).catch(err => {
        if (!silent) {
            /* jshint maxlen: false */
            console.log(chalk.red(`Unable to create table ${table.TableName}. Error JSON: ${err.cause}`));
        }
    });
};

module.exports = function (silent) {
    let promises = [];
    tables.forEach((table) => {
        let promise = dynamodb.deleteTableAsync({ TableName: table.TableName })
            .then(() => createTable(table, silent))
            .catch(err => {
                if (!silent) {
                    /* jshint maxlen: false */
                    console.log(chalk.red(`Unable to delete table ${table.TableName}. Error JSON: ${err.cause}`));
                }
                return createTable(table, silent);
            });
        promises.push(promise);
    });
    return bluebird.all(promises);
};
