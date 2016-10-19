"use strict";

let AWS = require("aws-sdk");
let LOGGER = require("../../configuration/logging/logger");
let bluebird = require("bluebird");

let getParams = function (repository, otherParams) {
    let params = { TableName: repository.table };
    return Object.assign(params, otherParams);
};

class DynamoDBRepository {

    constructor(tableName) {
        this.docClient = bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient());
        this.table = tableName;
        this.LOGGER = LOGGER({ source: "DynamoDB", table: this.table });
    }

    get(key, optional) {
        return this.docClient.getAsync(getParams(this, { Key: { id: key }})).then((data) => {
            if (data.Item) {
                this.LOGGER.info(`Returning item from table`, { id: key});
                return data.Item;
            } else {
                let logMethod = optional ? this.LOGGER.warn : this.LOGGER.error;
                logMethod("item not found", { id: key, error: "not found" });
                throw new Error("not found");
            }
        }, (err) => {
            this.LOGGER.error("Error getting item", { id: key, error: JSON.stringify(err) });
            throw new Error(err);
        });
    }

    put(item) {
        return this.docClient.putAsync(getParams(this, { Item: item })).then(() => {
            this.LOGGER.info("Added item to table", { id: item.id });
            return item;
        }).catch((err) => {
            this.LOGGER.error("Error saving item", { id: item.id, error: JSON.stringify(err) });
            throw new Error(err);
        });
    }

    putUnique(item) {
        return this.get(item.id, true).then(() => {
            let err = "object must be unique by id";
            this.LOGGER.error("item already exists", { id: item.id, error: err });
            throw new Error(err);
        }, (err) => {
            if (err.message === "not found") { return this.put(item); }
            this.LOGGER.error("unknown error occured reading DB",
                { id: item.id, error: JSON.stringify(err) });
            throw new Error(err.message);
        });
    }

    scan() {
        return this.docClient.scanAsync(getParams(this, {})).then((data) => {
            this.LOGGER.info("Returning all items from table");
            return data.Items;
        }).catch((err) => {
            this.LOGGER.error("Error scanning database", { error: JSON.stringify(err) });
            throw new Error(err);
        });
    }
}

module.exports = DynamoDBRepository;
