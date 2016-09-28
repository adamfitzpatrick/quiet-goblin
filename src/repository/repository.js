"use strict";

let AWS = require("aws-sdk");
let LOGGER = require("../configuration/logger");
let bluebird = require("bluebird");

let getParams = function (repository, otherParams) {
    let params = { TableName: repository.table };
    Object.getOwnPropertyNames(otherParams)
        .forEach(paramName => params[paramName] = otherParams[paramName]);
    return params;
};

let writeLog = (repository, message, operation, err) => {
    let level = err ? "error" : "info";
    let payload = {
        repository: repository.constructor.name,
        table: repository.table,
        operation: operation
    };
    if (err) {
        payload.error = err;
    }
    LOGGER.log(level, message, payload);
};

function Repository() {
    this.docClient = bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient());
    this.table = null;
}

Repository.prototype.put = function (item) {
    return this.docClient.putAsync(getParams(this, { Item: item })).then(() => {
        writeLog(this, `Added item to table ${this.table}`, "put");
        return item;
    }).catch((err) => {
        writeLog(this, `Failed adding item to table ${this.table}`, "put",
            JSON.stringify(err, null, 1));
        return err;
    });
};

Repository.prototype.scan = function () {
    return this.docClient.scanAsync(getParams(this, {})).then((data) => {
        writeLog(this, `Returning all items from table ${this.table}`, "scan");
        return data.Items;
    }).catch((err) => {
        writeLog(this, `Error scanning table ${this.table}`, "scan",
            JSON.stringify(err, null, 1));
        return err;
    });
};

Repository.prototype.get = function (key) {
    return this.docClient.getAsync(getParams(this, { Key: { id: key }})).then((data) => {
        if (data.Item) {
            writeLog(this, `Returning item ${key} from table ${this.table}`, "get");
            return data.Item;
        } else {
            let err = { status: 404, cause: "not found" };
            writeLog(this, `Error getting item ${key} from table ${this.table}`, "get",
                JSON.stringify(err, null, 1));
            return err;
        }
    }).catch((err) => {
        writeLog(this, `Error getting item ${key} from table ${this.table}`, "get",
            JSON.stringify(err, null, 1));
        return err;
    });
};

Repository.extendTo = function (target) {
    let constructor = target.prototype.constructor;
    Object.getOwnPropertyNames(Repository.prototype).forEach((propertyName) => {
        target.prototype[propertyName] = Repository.prototype[propertyName];
    });
    target.prototype.constructor = constructor;
};

module.exports = Repository;