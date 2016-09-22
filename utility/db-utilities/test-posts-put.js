"use strict";

let Promise = require("bluebird");
process.argv.push("--env");
process.argv.push("dev");

require("../../src/configuration/aws-config");

let Post = require("../../src/models/post/post");
let PostRepository = require("../../src/repository/posts-repository/posts-repository");
let postRepository = new PostRepository();

let post = new Post({
    title: "Test Post",
    description: "This is a test post.",
    featured: true,
    cover: "http://some.url/",
    height: 1050,
    tags: ["Tag 1", "Tag 2"]
});

let postId = post.id;

postRepository.put(post).then(() => {
    let AWS = require("aws-sdk");
    let docClient = new AWS.DynamoDB.DocumentClient();

    Promise.promisifyAll(docClient);

    let table = "ragingGoblinPosts";

    docClient.getAsync({ TableName: table, Key: { id: post.id }}).then((data) => {
        console.log(JSON.stringify(data, null, 2));
    }, (err) => {
        console.log("Error", err)
    });
});