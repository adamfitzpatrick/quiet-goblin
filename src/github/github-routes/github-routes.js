"use strict";

const express = require("express");
const memCache = require("memory-cache");
const https = require("https");
const LOGGER = require("../../configuration/logging/logger");

class GithubRoutes {

    constructor(application) {
        this.LOGGER = LOGGER({ source: "github-routes" });
        this.token = process.env.GITHUB_TOKEN;
        this.router = express.Router();
        this.router.use(this.get.bind(this));
        application.use("/github", this.router);
    }

    get(request, response) {
        const cached = memCache.get(`github__${request.path}`);
        if (cached) {
            this.LOGGER.info(`Fetching GitHub data from cache: ${request.path}`);
            return response.json(cached);
        }
        this.LOGGER.info(`Fetching from GitHub: ${request.path}`);
        return this.callApi(request, response);
    }


    callApi(request, response) {
        const options = {
            headers: this.getHeaders(),
            host: "api.github.com",
            path: request.path
        };
        return https.get(options, (res) => {
            let data = "";
            res.on("data", (chunk) => data += chunk);
            res.on("end", () => {
                response.json(JSON.parse(data));
                memCache.put(`github__${options.path}`, JSON.parse(data));
            });
        }).on("error", (err) => response.status(err.statusCode).send(err));
    }

    getHeaders() {
        return {
            Accept: "application/vnd.github.mercy-preview+json",
            Authorization: `token ${this.token}`,
            "User-Agent": "quiet-goblin"
        };
    }
}

module.exports = GithubRoutes;