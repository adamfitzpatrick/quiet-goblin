"use strict";

function CORSFilter() {
    return (request, response, next) => {
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept");

        if (request.method === "OPTIONS") {
            response.sendStatus(200).end();
        } else {
            next();
        }
    };
}

module.exports = CORSFilter;
