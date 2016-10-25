"use strict";

let chai = require("chai");
chai.should();
let rewire = require("rewire");

let Comment = rewire("./comment");
Comment.__set__("uuid", { v4: () => "uuid" });

describe("Comment model", () => {
    let commentObj;

    beforeEach(() => {
        commentObj = {
            id: "1",
            content: "content",
            created: new Date(),
            lastUpdate: new Date(),
            submitterId: "submitter"
        };
    });

    it("should assign a passed in properties to self", () => {
        let comment = new Comment(commentObj);
        comment.should.have.property("id", "1");
        comment.should.have.property("content", "content");
        comment.created.should.be.an.instanceof(Date);
        comment.lastUpdate.should.be.an.instanceof(Date);
        comment.submitterId.should.equal("submitter");
    });

    it("should assign a uuid if one is not provided", () => {
        delete commentObj.id;
        (new Comment(commentObj)).should.have.property("id", "uuid");
    });

    it("should convert a string date to a Date object", () => {
        commentObj.created = new Date().toISOString();
        commentObj.lastUpdate = new Date().toISOString();
        let comment = new Comment(commentObj);
        comment.created.should.be.an.instanceof(Date);
        comment.lastUpdate.should.be.an.instanceof(Date);
    });

    describe("update", () => {
        let comment;

        beforeEach(() => {
            comment = new Comment(commentObj);
        });

        it("should update class fields", () => {
            comment.update({ content: "updated" });
            comment.content.should.equal("updated");
        });

        it("should not update fields that aren't part of the class", () => {
            comment.update({ notAField: "updated" });
            comment.should.not.have.property("notAField");
        });
    });
});
