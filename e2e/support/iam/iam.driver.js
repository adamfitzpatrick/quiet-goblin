"use strict";

let bluebird = require("bluebird");
let appConfig = require("../../../app-config.json").e2e;
let baseUrl = `http://localhost:${appConfig.port}`;
let request = require("supertest")(`${baseUrl}/auth`);
let postRequest = require("supertest")(`${baseUrl}/posts`);
let baseRequest = require("supertest")(`${baseUrl}`);

let AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2"
});
let docClient = bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient());
let userTable = appConfig.dynamo_tables.user;

let supportData = {
    users: []
};

let addUser = (username) => {
    if (supportData.users.indexOf(username) === -1) { supportData.users.push(username); }
};

let iamDriver = {
    supportData: supportData,
    createAccount: (username, password) => {
        addUser(username);
        return request.post("/add-user").send({ username: username, password: password });
    },
    login: (username, password) => {
        return request.post("/").send({ username: username, password: password }).then(response => {
            if (response.body.token) { supportData.token = response.body.token; }
            return response;
        });
    },
    logout: () => { return request.post("/logout").send({ token: supportData.token }); },
    postRequest: postRequest,
    baseRequest: baseRequest,
    cleanDynamoDbUserTable: () => {
        let promises = [];
        while (supportData.users.length) {
            let promise = docClient.deleteAsync({
                TableName: userTable,
                Key: { id: supportData.users.pop() }
            });
            promises.push(promise);
        }
        return Promise.all(promises);
    }
};

module.exports = iamDriver;
