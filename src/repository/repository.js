"use strict";

let AWS = require("aws-sdk");
let LOGGER = require("../configuration/logger");
let Promise = require("bluebird");

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

let makeUpdateExpression = (properties) => {
    let values = Object.keys(properties);
    let expression = "set ";
    values.forEach((val) => expression += `${val} = :${val}, `);
    return expression.slice(0, expression.length - 2);
};

let makeExpressionAttributeValues = (properties) => {
    let values = Object.keys(properties);
    let eavs = {};
    values.forEach((val) => eavs[`:${val}`] = properties[val]);
    return eavs;
};

function Repository() {
    this.docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
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

Repository.prototype.update = function (id, properties) {
    let params = {
        Key:{ id: id },
        UpdateExpression: makeUpdateExpression(properties),
        ExpressionAttributeValues: makeExpressionAttributeValues(properties),
        ReturnValues:"UPDATED_NEW"
    };
    return this.docClient.updateAsync(getParams(this, params)).then(() => {
        writeLog(this, `Updated item ${id} in table ${this.table}`, "update");
        properties.id = id;
        return properties;
    }).catch((err) => {
        writeLog(this, `Failed updating item ${id} in table ${this.table}`, "update",
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
        writeLog(this, `Returning item ${key} from table ${this.table}`, "get")
        return data.Item;
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