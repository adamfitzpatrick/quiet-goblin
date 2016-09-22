"use strict";

let AWS = require("aws-sdk");
let LOGGER = require("../configuration/logger");
let Promise = require("bluebird");

let getParams = function (repository, otherParams) {
    let params = { TableName: repository.constructor.table };
    Object.getOwnPropertyNames(otherParams)
        .forEach(paramName => params[paramName] = otherParams[paramName]);
    return params;
};

let writeLog = (repository, message, operation, err) => {
    let level = err ? "error" : "info";
    let payload = {
        repository: repository.constructor.name,
        table: repository.constructor.table,
        operation: operation
    };
    if (err) {
        payload.error = err;
    }
    LOGGER.log(level, message, payload);
};

function Repository() {
    this.docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
}

Repository.table = null;

Repository.prototype.put = function (item) {
    return this.docClient.putAsync(getParams(this, { Item: item })).then((data) => {
        writeLog(this, "Added item to database", "put");
        return item;
    }, (err) => {
        writeLog(this, "Failed adding item to database", "put", JSON.stringify(err, null, 1));
        return err;
    });
};

Repository.prototype.scan = function () {
    return this.docClient.scanAsync(getParams(this, {})).then((data) => {
        writeLog(this, "Returning all items from table", "scan");
        return data;
    }, (err) => {
        writeLog(this, "Error scanning database", "scan", JSON.stringify(err, null, 1));
        return err;
    });
};

Repository.extendTo = function (target) {
    target.prototype.put = Repository.prototype.put;
    target.prototype.scan = Repository.prototype.scan;
};

module.exports = Repository;