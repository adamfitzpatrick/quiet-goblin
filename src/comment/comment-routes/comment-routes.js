"use strict";

const TABLE_NAME = require("../../configuration/app-config").dynamo_tables.comment;

let Comment = require("../comment/comment");
let DynamoDBRepository = require("../../common/dynamodb-repo/dynamodb-repo");
let SecureRouter = require("../../iam/secure-router/secure-router");
let permissions = require("../../iam/permissions/permissions");
let httpStatusMatcher = require("../../common/http-status-matcher/http-status-matcher");

class CommentRoutes {

    constructor(application) {
        this.router = new SecureRouter(application, "/comment");
        this.repository = new DynamoDBRepository(TABLE_NAME);
        this.makeRoutes();
    }

    addComment(request, response) {
        let comment = new Comment(request.body);
        return this.repository.put(comment).then(data => response.json(data))
            .catch(err => {
                return response.status(httpStatusMatcher(err)).json(err);
            });
    }

    getComment(request, response) {
        return this.repository.get(request.params.id).then(data => response.json(data))
            .catch(err => {
                return response.status(httpStatusMatcher(err)).json(err);
            });
    }

    getComments(request, response) {
        return this.repository.scan().then(data => response.json(data))
            .catch(err => {
                return response.status(httpStatusMatcher(err)).json(err);
            });
    }

    updateComment(request, response) {
        return this.repository.get(request.params.id).then(data => {
            if (data.status) {
                return response.json(data);
            } else {
                let comment = new Comment(data);
                comment.update(request.body);
                return this.repository.put(comment).then(data => response.json(data));
            }
        }).catch(err => {
            return response.status(httpStatusMatcher(err)).json(err);
        });
    }

    makeRoutes() {
        this.router.post("/", this.addComment.bind(this),
            { permissions: permissions.write_comment });
        this.router.get("/:id", this.getComment.bind(this), { secure: false });
        this.router.get("/", this.getComments.bind(this), { secure: false });
        this.router.post("/:id", this.updateComment.bind(this),
            { permissions: permissions.write_comment });
    }
}

module.exports = CommentRoutes;
