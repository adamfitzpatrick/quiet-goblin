"use strict";

let chai = require("chai");
chai.use(require("chai-datetime"));
chai.use(require("chai-as-promised"));
chai.should();

let bluebird = require("bluebird");
let request = bluebird.promisify(require("request"));
let dbOps = require("../utility/db-utilities/basic-db-ops");
let Post = require("../src/models/post/post");

let origin = `http://localhost:7003`;

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
        it("should get an array of posts", () => {
            let response = request(`${origin}/posts`).then(parseResponse);
            response.should.eventually.have.length.above(0);
            response.should.eventually.have.property(0).with.property("id");
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
                let result = dbOps.get("ragingGoblinPosts", id);
                result.should.eventually.have.property("Item").which.has.property("id", id);
                result.should.eventually.have.property("title", "Test post");
                return result.should.eventually;
            });
        });

        it("should modify an existing post when the post id is included", () => {
            options.url += "/";
        });
    });
});