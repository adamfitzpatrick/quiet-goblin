"use strict";

let appConfig = require("../../../app-config.json").e2e;
let baseUrl = `http://localhost:${appConfig.port}/posts`;
let request = require("supertest")(baseUrl);
let bluebird = require("bluebird");

let AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2"
});
let docClient = bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient());
let postsTable = appConfig.dynamo_tables.posts;

let supportData = require("../support-data");

let postDriver = {
    supportData: supportData,
    addTestPost: () => {
        supportData.posts.push({
            date: new Date().toISOString(),
            title: "Test Post",
            description: "E2E testing test post for testing",
            cover: "/some/url",
            height: 100,
            tags: ["tag1"]
        });
    },
    directAdd: (post) => {
        return docClient.putAsync({ TableName: postsTable, Item: post });
    },
    directRemove: (post) => {
        return docClient.deleteAsync({ TableName: postsTable, Key: { id: post.id }});
    },
    duplicateLastTestPost: () => {
        supportData.posts.push(JSON.parse(JSON.stringify(supportData.lastPost())));
    },
    savePost: () => request.post("/").send(supportData.lastPost()),
    getLastPost: () => request.get(`/${supportData.lastPost().id}`),
    getAll: () => request.get("/"),
    getOne: (id) => request.get(`/${id}`),
    post: (id) => request.post(`/${id}`)
};

module.exports = postDriver;
