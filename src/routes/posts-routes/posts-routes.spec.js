"use strict";

let chai = require("chai");
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
        response = { json: (data) => data };
    });

    describe("constructor", () => {
        it("should properly configure the repo", () => {
            postsRoutes.should.have.property("repository");
            postsRoutes.repository.constructor.should.have.property("name", "PostsRepository");
        });

        it("should add endpoints to router", () => {
            router.get.calledWithExactly("/posts", postsRoutes.getPosts).should.equal(true);
            router.post.calledWithExactly("/posts", postsRoutes.addPost).should.equal(true);
            router.post.calledWithExactly("/posts/:id", postsRoutes.updatePost)
                .should.equal(true);
            router.get.calledWithExactly("/posts/:id", postsRoutes.getPost).should.equal(true);
        });
    });

    describe("addPost", () => {
        it("should add a post to the repo", () => {
            repositoryMock.expects("put").once().withExactArgs(new Post(testPost))
                .returns(Promise.resolve(testPost));
            return postsRoutes.addPost({ body: testPost}, response).then((data) => {
                repositoryMock.verify();
                data.should.eql(testPost);
            });
        });
    });

    describe("updatePost", () => {
        let expectGet;
        let request;
        let replacementPost;

        beforeEach(() => {
            testPost.id = "1";
            replacementPost = new Post(testPost);
            replacementPost.id = "1";
            replacementPost.title = "Updated post";
            expectGet = repositoryMock.expects("get").once().withExactArgs("1");
            request = {
                body: { title: "Updated post" },
                params: { id: "1" }
            };
        });

        it("should update the values of an existing post", () => {
            expectGet.returns(Promise.resolve(testPost));
            repositoryMock.expects("put").once().withExactArgs(replacementPost)
                .returns(Promise.resolve(replacementPost));
            return postsRoutes.updatePost(request, response).then((data) => {
                repositoryMock.verify();
                data.should.eql(replacementPost);
            });
        });

        it("should return a 404 error when the post is not found", () => {
            expectGet.returns(Promise.resolve({ status: 404 }));
            return postsRoutes.updatePost(request, response).then((data) => {
                repositoryMock.verify();
                data.status.should.equal(404);
            });
        });
    });

    describe("getPosts", () => {
        it("should request all data from the repo", () => {
            repositoryMock.expects("scan").once().withExactArgs()
                .returns(Promise.resolve([testPost]));
            return postsRoutes.getPosts(request, response).then((data) => {
                repositoryMock.verify();
                data.should.eql([testPost]);
            });
        });
    });

    describe("getPost", () => {
        it("should fetch a single post from the repo", () => {
            request = { params: { id: "1" }};
            repositoryMock.expects("get").once().withExactArgs("1")
                .returns(Promise.resolve(testPost));
            return postsRoutes.getPost(request, response).then((data) => {
                repositoryMock.verify();
                data.should.eql(testPost);
            });
        });
    });
});