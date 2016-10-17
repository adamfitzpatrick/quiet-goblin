"use strict";

let AWS = require("aws-sdk");
let LOGGER = require("../configuration/logging/logger");
let bluebird = require("bluebird");

let getParams = function (repository, otherParams) {
    let params = { TableName: repository.table };
    return Object.assign(params, otherParams);
};

class Repository {

    constructor(tableName) {
        this.docClient = bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient());
        this.table = tableName;
        this.LOGGER = LOGGER({ source: "DynamoDB", table: this.table });
    }

    get(key) {
        return this.docClient.getAsync(getParams(this, { Key: { id: key }})).then((data) => {
            if (data.Item) {
                this.LOGGER.info(`Returning item from table`);
                return data.Item;
            } else {
                this.LOGGER.error("Error getting item", { error: "not found" });
                throw new Error("not found");
            }
        }, (err) => {
            this.LOGGER.error("Error getting item", { error: JSON.stringify(err) });
            throw new Error(JSON.stringify(err));
        });
    }

    put(item) {
        return this.docClient.putAsync(getParams(this, { Item: item })).then(() => {
            this.LOGGER.info("Added item to table");
            return item;
        }).catch((err) => {
            this.LOGGER.error("Error saving item", { error: JSON.stringify(err) });
            throw err;
        });
    }

    putUnique(item) {
        return this.get(item.id).then(() => {
            let err = "object must be unique by id";
            this.LOGGER.error("Item already exists", { error: err });
            throw new Error(err);
        }, () => {
            return this.put(item);
        });
    }

    scan() {
        return this.docClient.scanAsync(getParams(this, {})).then((data) => {
            this.LOGGER.info("Returning all items from table");
            return data.Items;
        }).catch((err) => {
            this.LOGGER.error("Error scanning database", { error: JSON.stringify(err) });
            throw err;
        });
    }
}

module.exports = Repository;
