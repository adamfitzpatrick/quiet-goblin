"use strict";

let baseUrl = "http://localhost:7003";

let rp = require("request-promise");
let chai = require("chai");
let manageTestDb = require("./manage-test-db");

chai.use(require("chai-as-promised"));
chai.should();

function parseResponse(response) {
    try {
        return JSON.parse(response);
    } catch (err) {
        return response;
    }
}
function get(url) {
    return rp(url).then(parseResponse);
}

function post(url, data) {
    let options = {
        method: 'POST',
        uri: url,
        body: data,
        json: true
    };
    return rp(options).then(parseResponse);
}



module.exports = {
    request: {
        get: get,
        post: post
    },
    getUrl: (path) => `${baseUrl}${path}`,
    wipe: manageTestDb.wipe,
    load: manageTestDb.load,
    initialize: manageTestDb.initialize,
    getAll: manageTestDb.getAll
};