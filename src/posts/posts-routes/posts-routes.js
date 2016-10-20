"use strict";

const TABLE_NAME = require("../../configuration/app-config").dynamo_tables.posts;

let Post = require("../post/post");
let DynamoDBRepository = require("../../common/dynamodb-repo/dynamodb-repo");
let SecureRouter = require("../../iam/secure-router/secure-router");
let permissions = require("../../iam/permissions/permissions");

class PostRoutes {

    constructor(application) {
        this.router = new SecureRouter(application, "/posts");
        this.repository = new DynamoDBRepository(TABLE_NAME);
        this.makeRoutes();
    }

    addPost(request, response) {
        let post = new Post(request.body);
        return this.repository.put(post).then((data) => response.json(data));
    }

    getPost(request, response) {
        return this.repository.get(request.params.id).then((data) => response.json(data));
    }

    getPosts(request, response) {
        return this.repository.scan().then((data) => response.json(data));
    }

    updatePost(request, response) {
        let id = request.params.id;
        return this.repository.get(id).then((data) => {
            if (data.status) {
                return response.json(data);
            } else {
                let postToUpdate = new Post(data);
                postToUpdate.updateProperties(request.body);
                return this.repository.put(postToUpdate).then((data) => response.json(data));
            }
        });
    }

    makeRoutes() {
        this.router.get("/", this.getPosts.bind(this), { secure: false });
        this.router.get("/:id", this.getPost.bind(this), { secure: false });
        this.router.post("/", this.addPost.bind(this), { permissions: [permissions.write_post] });
        this.router.post("/:id", this.updatePost.bind(this),
            { permissions: [permissions.write_post] });
    }
}

module.exports = PostRoutes;
