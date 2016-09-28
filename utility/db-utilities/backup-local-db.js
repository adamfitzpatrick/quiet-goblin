"use strict";

let bluebird = require("bluebird");
let fs = require("fs");
bluebird.promisifyAll(fs);
let path = require("path");

let AWS = require("aws-sdk");

let mkdirp = bluebird.promisify(require("mkdirp"));
let rimraf = bluebird.promisify(require("rimraf"));
let chalk = require("chalk");
require("../../src/configuration/aws-config");

let backupDir = path.resolve(__dirname, "./backup");
let tables = require("./datatables.json");

let docClient = new AWS.DynamoDB.DocumentClient();
bluebird.promisifyAll(docClient);

function saveData(tableName, data) {
    fs.writeFileAsync(path.join(backupDir, `${tableName}.json`), JSON.stringify(data))
        .catch((err) => { console.log(chalk.red("\nError writing backup file: " + err)); });
}

let promises = [];

function scanTable(table) {
    promises.push(docClient.scanAsync({ TableName: table.TableName }).then((data) => {
            saveData(table.TableName, data);
        })
    );
}

function doBackup() {
    tables.forEach(scanTable);
    let backupPromise = bluebird.all(promises).then(() => {
        console.log(chalk.green("Local database backed up successfully"));
    }).catch((err) => {
        console.log(chalk.red(err.cause));
    });
    return backupPromise;
}

module.exports = function () {
    return rimraf(backupDir).then(() => { return mkdirp(backupDir).then(doBackup); });
};