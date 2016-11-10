"use strict";

let bluebird = require("bluebird");

let appConfig = require("../../../app-config.json").e2e;
let baseUrl = `http://localhost:${appConfig.port}`;
let request = require("supertest")(`${baseUrl}/admin`);

let AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2"
});
let docClient = bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient());
let userTable = appConfig.dynamo_tables.user;

let supportData = require("../support-data");
let iamDriver = require("../iam/iam.driver");

let users = [];

let adminDriver = {
    supportData: supportData,
    users: users,
    createAccountWithoutApp: iamDriver.createAccountWithoutApp,
    login: iamDriver.login,
    changePassword: (username, password) => {
        return request.post("/change-password").send({
            username: username,
            password: password
        });
    },
    cleanDynamoDbUserTable: iamDriver.cleanDynamoDbUserTable,  // Will be deprecated
    cleanUserTable: () => {
        let promises = [];
        while (users.length) {
            let promise = docClient.deleteAsync({
                TableName: userTable,
                Key: { id: users.pop() }
            });
            promises.push(promise);
        }
        return Promise.all(promises);
    }
};

module.exports = adminDriver;
