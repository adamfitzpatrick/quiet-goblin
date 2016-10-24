"use strict";

let LOGGER = require("../../configuration/logging/logger");
let AWS = require("aws-sdk");
let bluebird = require("bluebird");
let s3 = bluebird.promisifyAll(new AWS.S3());

class S3Repository {

    constructor(bucket) {
        this.bucket = bucket;
        this.LOGGER = LOGGER({ source: "S3Repository", bucket: this.bucket });
    }

    listObjects() {
        return s3.listObjectsAsync({ Bucket: this.bucket }).then(data => {
            this.LOGGER.info("Listing bucket contents");
            return data.Contents.map(item => item.Key);
        }).catch((err) => {
            this.LOGGER.error("Error reading bucket", {error: JSON.stringify(err) });
            return err;
        });
    }

    listFolder(folder) {
        let folderPattern = new RegExp(`^${folder}`);
        return this.listObjects().then(items => {
            this.LOGGER.info("List contents of virtual folder", { folder: folder });
            return items.filter(folderPattern.test.bind(folderPattern));
        });
    }

    getObject(key) {
        let params = { Bucket: this.bucket, Key: key };
        return s3.getObjectAsync(params).then(data => {
            this.LOGGER.info("Getting object contents", { key: key });
            return data.Body.toString();
        }).catch((err) => {
            this.LOGGER.error("Error getting item", { error: JSON.stringify(err) });
            return err;
        });
    }

    putObject(key, body) {
        let params = { Bucket: this.bucket, Key: key, Body: body };
        return s3.putObjectAsync(params).then((data) => {
            this.LOGGER.info("Item added to bucket", { key: key });
            return data;
        }).catch((err) => {
            this.LOGGER.error("Error saving item", { error: JSON.stringify(err) });
            return err;
        });
    }

    deleteObject(key) {
        let params = { Bucket: this.bucket , Key: key };
        return s3.deleteObjectAsync(params).then((data) => {
            this.LOGGER.info("Item deleted from bucket", { key: key});
            return data;
        }).catch((err) => {
            this.LOGGER.error("Error deleting item", { error: JSON.stringify(err) });
            return err;
        });
    }
}

module.exports = S3Repository;
