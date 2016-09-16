"use strict";

let MongoClient = require("mongodb").MongoClient;
let ObjectId = require("mongodb").ObjectID;
let dbData = require("./db.json");

let DB_URL = "mongodb://127.0.0.1:27017/ragingGoblinTest";
let COLLECTIONS = Object.keys(dbData);

COLLECTIONS.forEach((collection) => {
    dbData[collection].forEach(item => item._id = new ObjectId(item._id));
});

let doConnect = () => MongoClient.connect(DB_URL);

let wipe = () => {
    let workers = [];
    COLLECTIONS.forEach((collection) => {
        let wiper = doConnect().then(db => {
            db.collection(collection).deleteMany({}).then(() => db.close());
        });
        workers.push(wiper);
    });
    return Promise.all(workers);
};

let load = () => {
    let workers = [];
    COLLECTIONS.forEach((collection) => {
        let initializer = doConnect().then(db => {
            db.collection(collection).insertMany(dbData[collection]).then(() => db.close());
        });
        workers.push(initializer);
    });
    return Promise.all(workers);
};

let initialize = () => wipe().then(load);

let find = (collection, query) => {
    return doConnect().then(db => db.collection(collection).find(query).then(() => db.close()));
};

module.exports = {
    wipe: wipe,
    load: load,
    initialize: initialize,
    findInDb: find
};