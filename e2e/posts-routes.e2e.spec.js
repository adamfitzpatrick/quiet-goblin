"use strict";

let chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();

let bluebird = require("bluebird");
let request = bluebird.promisify(require("request"));
let dbOps = require("../utility/db-utilities/basic-db-ops");
let Post = require("../src/models/post/post");
let appConfig = require("../app-config.json").e2e;

let origin = `http://localhost:${appConfig.port}`;

let parseResponse = (res) => JSON.parse(res.body);

describe("posts routes", () => {
    let post;

    before(() => {
        post = new Post({
            date: new Date(),
            title: "Test Post",
            description: "This is a test post",
            cover: "/some/url",
            height: 100,
            tags: ["tag1"]
        });
        return dbOps.put("ragingGoblinPosts", post);
    });

    describe("get /posts", () => {
        it("should get an array of items", () => {
            return request(`${origin}/posts`).then(parseResponse)
                .should.eventually.have.length.above(0);
        });

        it("should return posts", () => {
            return request(`${origin}/posts`).then(parseResponse)
                .should.eventually.have.property(0).with.property("id");
        });

        it("should get a single post by id", () => {
            return request(`${origin}/posts/${post.id}`).then(parseResponse)
                .should.eventually.have.property("title", "Test Post");
        });
    });

    describe("post /posts", () => {
        let options;

        beforeEach(() => {
            options = {
                url: `${origin}/posts`,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(post)
            };
        });

        it("should add a single post when the post id is not included", () => {
            return request(options).then((data) => {
                let id = JSON.parse(data.body).id;
                return dbOps.get("ragingGoblinPosts", id).should.eventually
                    .have.property("Item").which.has.property("title", "Test Post");
            });
        });

        it("should modify an existing post when the post id is included", () => {
            options.url += `/${post.id}`;
            options.body = JSON.stringify({ title: "Updated title" });
            post.title = "Updated title";
            return request(options).then(parseResponse).then((data) => {
                data.should.have.property("title", "Updated title");
                return dbOps.get("ragingGoblinPosts", post.id).should.eventually
                    .have.property("Item").which.has.property("title", "Updated title");
            });
        });
    });
});