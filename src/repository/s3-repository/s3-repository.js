"use strict";

let AWS = require("aws-sdk");
let bluebird = require("bluebird");
let s3 = bluebird.promisifyAll(new AWS.S3());

class S3Repository {

    constructor(bucket) {
        this.bucket = bucket;
    }

    listObjects() {
        return s3.listObjectsAsync(this.bucket).then(data => {
            return data.Contents.map(item => item.Key);
        });
    }

    listFolder(folder) {
        let folderPattern = new RegExp(`^${folder}`);
        return this.listObjects().then(items => {
            return items.filter(folderPattern.test.bind(folderPattern));
        });
    }

    getObject(key) {
        let params = { Bucket: this.bucket, Key: key };
        return s3.getObjectAsync(params).then(data => data.Body);
    }

    putObject(key, body) {
        let params = { Bucket: this.bucket, Key: key, Body: body };
        return s3.putObjectAsync(params);
    }
}

module.exports = S3Repository;