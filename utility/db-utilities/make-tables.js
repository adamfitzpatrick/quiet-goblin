"use strict";

let Promise = require("bluebird");
let chalk = require("chalk");
let AWS = require("aws-sdk");
require("../../src/configuration/aws-config");

let tables = require("./datatables.json");

let dynamodb = new AWS.DynamoDB();
Promise.promisifyAll(dynamodb);

let createTable = (table) => {
    return dynamodb.createTableAsync(table).then(() => {
        console.log(chalk.green(`Created table ${table.TableName}`));
    }).catch(err => {
        console.log(chalk.red(`Unable to create table ${table.TableName}. Error JSON: ${err.cause}`));
    });
};

module.exports = function () {
    let promises = [];
    tables.forEach((table) => {
        let promise = dynamodb.deleteTableAsync({ TableName: table.TableName }).then(() => createTable(table))
            .catch(err => {
                console.log(chalk.red(`Unable to delete table ${table.TableName}. Error JSON: ${err.cause}`));
                return createTable(table);
            });
        promises.push(promise);
    });
    return Promise.all(promises);
};
