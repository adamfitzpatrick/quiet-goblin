"use strict";

module.exports = function (router) {
    router.get("/", (req, res) => {
        res.json({ status: "OK" });
        res.end();
    });
};