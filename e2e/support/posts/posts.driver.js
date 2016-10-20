"use strict";

let appConfig = require("../../../app-config.json").e2e;
let baseUrl = `http://localhost:${appConfig.port}/posts`;
let request = require("supertest")(baseUrl);

let supportData = {
    posts: [],
    lastPost: () => supportData.posts[supportData.posts.length - 1],
    previousPost: () => supportData.posts[supportData.posts.length -2]
};

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
    duplicateLastTestPost: () => {
        supportData.posts.push(JSON.parse(JSON.stringify(supportData.lastPost())));
    },
    savePost: () => request.post("/").send(supportData.lastPost()),
    getLastPost: () => request.get(`/${supportData.lastPost().id}`),
    getAll: () => request.get("/"),
    post: (id) => request.post(`/${id}`)
};

module.exports = postDriver;
