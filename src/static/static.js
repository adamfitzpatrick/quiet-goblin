"use strict";

const LOGGER = require("../configuration/logging/logger")({ source: "static"});

module.exports = (req, res, next) => {
    LOGGER.info(`Request for ${req.path}`);
    const direct = req.path.substr(1, req.path.length);
    if (direct) { return res.redirect(`/?direct=${direct}`); }
    next();
};