"use strict";

const statusMap = {
    "username already exists": 400,
    "invalid password": 401,
    "not found": 404,
    "unknown error": 500
};

const DEFAULT_CODE = 500;

let statusKey = function (statusString) {
    let status = Object.keys(statusMap).find(key => statusString.match(new RegExp(`^${key}`)));
    return status;
};

function httpStatusMatcher(status) {
    if (status.message) { status = status.message; }
    return statusMap[statusKey(status)] || DEFAULT_CODE;
}

module.exports = httpStatusMatcher;
