"use strict";

let chai = require("chai");
chai.use(require("chai-datetime"));
chai.should();
let rewire = require("rewire");

let Post = rewire("./post");
Post.__set__("uuid", { v4: () => "1" });

describe("Post", () => {
    let date;
    let postObject;
    let post;

    beforeEach(() => {
        date = new Date("1/1/2015");
        postObject = {
            date: date,
            title: "Test Post",
            description: "This is a test post",
            featured: true,
            cover: "some-image",
            height: 1000,
            tags: ["Tag 1", "Tag 2"]
        };
        post = new Post(postObject);
    });

    describe("constructor", () => {
        it("should create an instance of Post", () => {
            post.should.have.property("id", "1");
            post.should.have.property("date", date);
            post.should.have.property("title", postObject.title);
            post.should.have.property("description", postObject.description);
            post.should.have.property("featured", postObject.featured);
            post.should.have.property("cover", postObject.cover);
            post.should.have.property("height", postObject.height);
            post.should.have.property("tags", postObject.tags);
        });

        it("should create an instance of Post with the current date when date is missing", () => {
            delete postObject.date;
            new Post(postObject).date.should.be.afterTime(date);
        });

        it("should make tags and empty array if tags are missing", () => {
            delete postObject.tags;
            new Post(postObject).tags.should.eql([]);
        })
    });

    describe("addTag", () => {
        it("should add a tag to the post's tag list", () => {
            post.addTag("Tag 3");
            post.tags.should.eql(["Tag 1", "Tag 2", "Tag 3"]);
        });
    })
});