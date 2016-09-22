"use strict";

let chai = require("chai");
chai.use(require("chai-datetime"));
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

let PostsRoutes = rewire("./posts-routes");
let Post = rewire("../../models/post/post");
Post.__set__("uuid", { v4: () => "1" });
PostsRoutes.__set__("Post", Post);

describe("PostsRoutes", () => {
    let router;
    let postsRoutes;
    let repositoryMock;
    let testPost;
    let request;
    let response;

    beforeEach(() => {
        testPost = { title: "Test Post", date: new Date() };
        router = {
            get: sinon.spy(),
            post: sinon.spy()
        };
        postsRoutes = new PostsRoutes(router);
        repositoryMock = sinon.mock(postsRoutes.repository);
        response = { json: (data) => data }
    });

    describe("constructor", () => {
        it("should properly configure the repo", () => {
            postsRoutes.should.have.property("repository");
            postsRoutes.repository.constructor.should.have.property("name", "PostsRepository");
        });

        it("should add endpoints to router", () => {
            router.get.calledWithExactly("/posts", postsRoutes.getPosts).should.equal(true);
            router.post.calledWithExactly("/posts", postsRoutes.addPost).should.equal(true);
        });
    });

    describe("addPosts", () => {
        it("should add an array of posts to the repo", () => {
            repositoryMock.expects("put").once().withExactArgs(new Post(testPost))
                .returns(Promise.resolve(testPost));
            return postsRoutes.addPost({ body: testPost}, response).then((data) => {
                repositoryMock.verify();
                data.should.eql(testPost);
            });
        });
    });

    describe("getPosts", () => {
        it("should request all data from the repo", () => {
            repositoryMock.expects("scan").once().withExactArgs().returns(Promise.resolve([testPost]));
            return postsRoutes.getPosts(request, response).then((data) => {
                repositoryMock.verify();
                data.should.eql([testPost]);
            });
        });
    });
});