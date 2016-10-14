"use strict";

let S3Repository = require("../../repository/s3-repository/s3-repository");
let multer = require("multer");
let storage = multer.memoryStorage();
let upload = require("multer")({ storage: storage });

let _this;

class S3Routes {

    constructor(bucket, router) {
        _this = this;
        this.bucket = bucket;
        this.repository = new S3Repository(bucket);
        this.addRoutes(router);
    }

    getBucket(request, response) {
        if (request.query.folder) {
            return _this.repository.listFolder(request.query.folder)
                .then(data => response.json(data));
        } else if (request.query.key) {
            return _this.repository.getObject(request.query.key)
                .then(data => response.json(data));
        } else {
            return _this.repository.listObjects()
                .then(data => response.json(data));
        }
    }

    putObject(request, response) {
        return _this.repository.putObject(request.body.key, request.file.buffer)
            .then(data => response.json(data));
    }

    deleteObject(request, response) {
        return _this.repository.deleteObject(request.query.key).then(data => response.json(data));
    }

    addRoutes(router) {
        router.get(`/${this.bucket}`, this.getBucket);
        router.post(`/${this.bucket}`, upload.single('upload'), this.putObject);
        router.delete(`/${this.bucket}`, this.deleteObject);
    }
}

module.exports = S3Routes;
