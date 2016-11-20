"use strict";

let bluebird = require("bluebird");
let bcrypt = require("bcrypt");

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

let supportData = require("../support-data");

let addUserToSupportData = (username) => {
    if (supportData.users.indexOf(username) === -1) { supportData.users.push(username); }
};

function putUser(username, password, permissions) {
    let passwordHash = bcrypt.hashSync(password, 12);
    let user = {
        id: username,
        username: username,
        password: passwordHash,
        permissions: permissions
    };
    return docClient.putAsync({ TableName: "ragingGoblin_qa_user", Item: user });
}

let iamDriver = {
    supportData: supportData,
    createAccountWithoutApp: putUser,
    createAccount: (username, password) => {
        addUserToSupportData(username);
        return request.post("/add-user").send({ username: username, password: password });
    },
    login: (username, password) => {
        let supertestPromise = request.post("/").send({ username: username, password: password });
        supertestPromise.then(response => {
            if (response.body.token) { supportData.token = response.body.token; }
        });
        return supertestPromise;
    },
    changePassword: (username, oldPassword, newPassword) => {
        return request.post("/change-password")
            .set("Authorization", `Bearer ${supportData.token}`)
            .send({ username: username, oldPassword: oldPassword, newPassword: newPassword });
    },
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
