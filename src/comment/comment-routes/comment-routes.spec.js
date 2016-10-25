"use strict";

let chai = require("chai");
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

let CommentRoutes = rewire("./comment-routes");
let Comment = require("../comment/comment");

describe("commentRoutes", () => {
    let commentRoutes;
    let application;
    let request;
    let response;
    let repoMock;
    let comment;

    beforeEach(() => {
        application = { use: sinon.spy() };
        commentRoutes = new CommentRoutes(application);
        request = {};
        response = {
            json: (data) => response.data = data,
            send: (data) => response.data = data,
            status: (code) => response.statusCode = code
        };
        repoMock = sinon.mock(commentRoutes.repository);
        comment = new Comment({ id: "1" });
    });

    it("should be properly configured", () => {
        commentRoutes.repository.should.have.property("table", "ragingGoblin_comment");
        application.use.calledWithExactly("/comment", sinon.match.func).should.equal(true);
    });

    describe("addComment", () => {
        it("should add a comment to the repo", () => {
            repoMock.expects("put").withExactArgs(comment).returns(Promise.resolve(comment));
            request.body = comment;
            return commentRoutes.addComment(request, response).then(() => {
                repoMock.verify();
                return response.data.should.eql(comment);
            });
        });

        it("should have an error status if the comment cannot be added", () => {
            repoMock.expects("put").withExactArgs(comment).returns(Promise.reject());
            request.body = comment;
            return commentRoutes.addComment(request, response).then(() => {
                chai.assert.fail();
            }).catch(() => {
                repoMock.verify();
                return response.status.should.not.equal(200);
            });
        });
    });

    describe("getComment", () => {
        it("should get a single comment from the repo", () => {
            repoMock.expects("get").withExactArgs("1").returns(Promise.resolve(comment));
            request.params = { id: "1" };
            return commentRoutes.getComment(request, response).then(() => {
                repoMock.verify();
                return response.data.should.eql(comment);
            });
        });

        it("should have an error status if the comment cannot be retrieved", () => {
            repoMock.expects("get").withExactArgs("1").returns(Promise.reject());
            request.params = { id: "1" };
            return commentRoutes.getComment(request, response).then(() => {
                chai.assert.fail();
            }).catch(() => {
                repoMock.verify();
                return response.status.should.not.equal(200);
            });
        });
    });

    describe("getComments", () => {
        it("should retrieve all comments from the repo", () => {
            repoMock.expects("scan").withExactArgs().returns(Promise.resolve([comment]));
            return commentRoutes.getComments(request, response).then(() => {
                repoMock.verify();
                return response.data.should.eql([comment]);
            });
        });

        it("should have an error status if comments cannot be retrieved", () => {
            repoMock.expects("scan").withExactArgs().returns(Promise.reject());
            return commentRoutes.getComments(request, response).then(() => {
                chai.assert.fail();
            }).catch(() => {
                repoMock.verify();
                return response.status.should.not.equal(200);
            });
        });
    });

    describe("updateComment", () => {
        it("should update a comment on the repo", () => {
            repoMock.expects("get").withExactArgs("1").returns(Promise.resolve(comment));
            comment.content = "updated";
            request.params = { id: "1" };
            repoMock.expects("put").withExactArgs(comment).returns(Promise.resolve(comment));
            request.body = comment;
            return commentRoutes.updateComment(request, response).then(() => {
                repoMock.verify();
                return response.data.should.eql(comment);
            });
        });

        it("should not attempt to update comment if comment doesnt exist", () => {
            repoMock.expects("get").withExactArgs("1").returns(Promise.resolve({ status: 404 }));
            request.params = { id: "1" };
            return commentRoutes.updateComment(request, response).then(() => {
                repoMock.verify();
                return response.data.should.eql({ status: 404 });
            });
        });

        it("should have an error status if the comment cannot be retrieved", () => {
            repoMock.expects("get").withExactArgs("1").returns(Promise.resolve(comment));
            request.params = { id: "1" };
            repoMock.expects("put").withExactArgs(comment).returns(Promise.reject());
            request.body = comment;
            return commentRoutes.updateComment(request, response).then(() => {
                chai.assert.fail();
            }).catch(() => {
                repoMock.verify();
                return response.status.should.not.equal(200);
            });
        });
    });
});
