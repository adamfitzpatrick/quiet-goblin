"use strict";

const appConfig = require("../app-config");
const LOGGER = require("../logging/logger")({ source: "http-interceptor" });

const httpInterceptor = (req, res, next) => {
    LOGGER.info(`********   x-forwarded-proto: ${JSON.stringify(req.headers["x-forwarded-proto"])}`);
    if (req.headers["x-forwarded-proto"] === "http") {
        LOGGER.info(`Redirected to https`);
        return res.redirect(`https://${appConfig.origin}${req.baseUrl}`);
    }
    next();
};

module.exports = httpInterceptor;