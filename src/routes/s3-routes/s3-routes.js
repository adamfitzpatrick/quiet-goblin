"use strict";

let S3Repository = require("../../repository/s3-repository/s3-repository");

class S3Routes {

    constructor(bucket, router) {
        this.bucket = bucket;
        this.repository = new S3Repository(bucket);
        this.addRoutes(router);
    }

    getBucket(request) {
        if (request.query.folder) {
            return this.repository.listFolder(request.query.folder);
        } else if (request.query.key) {
            return this.repository.getObject(request.query.key);
        } else {
            return this.repository.listObjects();
        }
    }

    putBucket(request) {
        return this.repository.putObject(request.query.key, request.body);
    }

    addRoutes(router) {
        router.get(`/${this.bucket}`, this.getBucket);
        router.post(`/${this.bucket}`, this.putBucket);
    }
}

module.exports = S3Routes;
