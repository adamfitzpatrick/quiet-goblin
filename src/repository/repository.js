"use strict";

let AWS = require("aws-sdk");
let LOGGER = require("../configuration/logging/logger");
let bluebird = require("bluebird");

let getParams = function (repository, otherParams) {
    let params = { TableName: repository.table };
    Object.getOwnPropertyNames(otherParams)
        .forEach(paramName => params[paramName] = otherParams[paramName]);
    return params;
};

class Repository {

    constructor() {
        this.docClient = bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient());
        this.table = null;
        this.LOGGER = LOGGER({ source: "DynamoDB", table: this.table });
    }

    get(key) {
        return this.docClient.getAsync(getParams(this, { Key: { id: key }})).then((data) => {
            if (data.Item) {
                this.LOGGER.info(`Returning item from table`);
                return data.Item;
            } else {
                let err = { status: 404, cause: "not found" };
                this.LOGGER.error("Error getting item", { error: JSON.stringify(err) });
                return err;
            }
        }).catch((err) => {
            this.LOGGER.error("Error getting item", { error: JSON.stringify(err) });
            return err;
        });
    }

    put(item) {
        return this.docClient.putAsync(getParams(this, { Item: item })).then(() => {
            this.LOGGER.info("Added item to table");
            return item;
        }).catch((err) => {
            this.LOGGER.error("Error saving item", { error: JSON.stringify(err) });
            return err;
        });
    }

    scan() {
        return this.docClient.scanAsync(getParams(this, {})).then((data) => {
            this.LOGGER.info("Returning all items from table");
            return data.Items;
        }).catch((err) => {
            this.LOGGER.error("Error scanning database", { error: JSON.stringify(err) });
            return err;
        });
    }
}

module.exports = Repository;
