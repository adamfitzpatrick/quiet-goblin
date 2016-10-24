"use strict";

let multer = require("multer");
let storage = multer.memoryStorage();
let upload = require("multer")({ storage: storage });

let SecureRouter = require("../../iam/secure-router/secure-router");
let S3Repository = require("../s3-repository/s3-repository");
let permissions = require("../../iam/permissions/permissions");

let _this;

class S3Routes {

    constructor(bucket, application) {
        _this = this;
        this.bucket = bucket;
        this.repository = new S3Repository(bucket);
        this.router = new SecureRouter(application, `/${this.bucket}`);
        this.addRoutes();
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

    addRoutes() {
        this.router.get("/", this.getBucket, { secure: false });
        this.router.post("/", [upload.single('upload'), this.putObject],
            { permissions: permissions[`write_${this.bucket}`] });
        this.router.delete("/", this.deleteObject,
            { permissions: permissions[`write_${this.bucket}`] });
    }
}

module.exports = S3Routes;
