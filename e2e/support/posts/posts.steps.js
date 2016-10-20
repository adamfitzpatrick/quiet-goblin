"use strict";

let chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();

let driver = require("./posts.driver");

function Posts() {
    this.Given(/^I have a post I wish to save$/, () => {
        driver.addTestPost();
    });

    this.Then(/^I can save the post to the database$/, () => {
        return driver.savePost().expect(response => {
            response.status.should.equal(200);
            response.should.have.property("body");
            driver.supportData.lastPost().id = response.body.id;
            return driver.supportData.lastPost().id.should.be.defined;
        });
    });

    this.Then(/^I can verify the post I just [^\s]+$/, () => {
        return driver.getLastPost().expect(response => {
            let post = response.body;
            post.id.should.equal(driver.supportData.lastPost().id);
            post.title.should.equal(driver.supportData.lastPost().title);
            return post.description.should.equal(driver.supportData.lastPost().description);
        });
    });

    this.Then(/^I want to retrieve a listing of all posts$/, () => {
        return driver.getAll().expect(200);
    });

    this.Then(/^I can update the post I just [^\s]+$/, () => {
        driver.duplicateLastTestPost();
        driver.supportData.lastPost().title = "Updated";
        return driver.post(driver.supportData.previousPost().id).send({ title: "Updated"})
            .expect(response => {
                response.body.id.should.equal(driver.supportData.previousPost().id);
                return response.body.title.should.equal(driver.supportData.lastPost().title);
            });
    });
}

module.exports = Posts;
