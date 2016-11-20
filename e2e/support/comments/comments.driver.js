"use strict";

let AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2"
});
let bluebird = require("bluebird");
let docClient = bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient());
let supportData = require("../support-data");
let request = require("supertest")("http://localhost:7003/comment");

let commentsDriver = {
    supportData: supportData,
    getAll: () => {
        return request.get("/");
    },
    getOne: (id) => {
        return request.get(`/${id}`);
    },
    put: (comment) => {
        return request.post("/").set("Authorization", `Bearer ${supportData.token}`).send(comment);
    },
    update: (id, comment) => {
        return request.post(`/${id}`)
            .set("Authorization", `Bearer ${supportData.token}`)
            .send(comment);
    },
    delete: (id) => {
        return request.delete(`/${id}`).set("Authorization", `Bearer ${supportData.token}`);
    },
    directPut: (comment) => {
        return docClient.putAsync({ TableName: "ragingGoblin_qa_comment", Item: comment })
            .catch(err => {
                throw new Error(err);
            });
    },
    directDelete: (id) => {
        return docClient.deleteAsync({ TableName: "ragingGoblin_qa_comment", Key: { id: id }})
            .catch(err => {
                throw new Error(err);
            });
    }
};

module.exports = commentsDriver;
