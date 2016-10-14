"use strict";

let appConfig = require("../../app-config.json").e2e;
let baseUrl = `http://localhost:${appConfig.port}/posts`;
let request = require("supertest")(baseUrl);

let chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();

let supportData = {
    posts: [],
    lastPost: () => supportData.posts[supportData.posts.length - 1],
    previousPost: () => supportData.posts[supportData.posts.length -2]
};

function Posts() {
    this.Given(/^I have a post I wish to save$/, () => {
        supportData.posts.push({
            date: new Date().toISOString(),
            title: "Test Post",
            description: "E2E testing test post for testing",
            cover: "/some/url",
            height: 100,
            tags: ["tag1"]
        });
    });

    this.Then(/^I can save the post to the database$/, () => {
        return request.post("/").send(supportData.lastPost()).expect(response => {
            response.status.should.equal(200);
            response.should.have.property("body");
            supportData.lastPost().id = response.body.id;
            return supportData.lastPost().id.should.be.defined;
        });
    });

    this.Then(/^I can verify the post I just [^\s]+$/, () => {
        return request.get(`/${supportData.lastPost().id}`).expect(response => {
            let post = response.body;
            post.id.should.equal(supportData.lastPost().id);
            post.title.should.equal(supportData.lastPost().title);
            return post.description.should.equal(supportData.lastPost().description);
        });
    });

    this.Then(/^I want to retrieve a listing of all posts$/, () => {
        return request.get("/").expect(200);
    });

    this.Then(/^I can update the post I just [^\s]+$/, () => {
        supportData.posts.push(JSON.parse(JSON.stringify(supportData.lastPost())));
        supportData.lastPost().title = "Updated";
        return request.post(`/${supportData.previousPost().id}`).send({ title: "Updated"})
            .expect(response => {
                response.body.id.should.equal(supportData.previousPost().id);
                return response.body.title.should.equal(supportData.lastPost().title);
            });
    });
}

module.exports = Posts;
