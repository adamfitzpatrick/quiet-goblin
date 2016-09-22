"use strict";

let AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

let tableName = "ragingGoblinPosts";

let dynamodb = new AWS.DynamoDB();

let createTable = () => {
    let params = {
        TableName : tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH"}  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
};

dynamodb.deleteTable({ TableName: tableName }, () => createTable());
