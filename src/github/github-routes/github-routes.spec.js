"use strict";

const chai = require("chai");
chai.should();
const sinon = require("sinon");
const rewire = require("rewire");

const express = require("express");
const GithubRoutes = rewire("./github-routes");
const memCache = require("memory-cache");

describe("GithubRoutes", () => {
    let githubRoutes;
    let httpsMock;
    let response;

    beforeEach(() => {
        httpsMock = sinon.mock(GithubRoutes.__get__("https"));
        githubRoutes = new GithubRoutes(express());
        githubRoutes.token = "token";
        response = {
            status: (code) => {
                response.statusCode = code;
                return response;
            },
            json: (value) => {
                response.value = value;
                return response;
            },
            send: (value) => {
                response.value = value;
                return response;
            }
        };
    });

    describe("get", () => {
        it("should call github if there is no valid cache entry and cache the response", () => {
            const responseHandler = {
                on: (event, callback) => {
                    if (event === "data") {
                        callback(JSON.stringify({ data: "github" }));
                    } else {
                        callback();
                    }
                }
            };
            httpsMock.expects("get").returns({ on: (err) => {} });
            githubRoutes.get({ path: "/request/path" }, response);
            httpsMock.expectations.get[0].args[0][1](responseHandler);
            response.value.data.should.equal("github");
            httpsMock.verify();
            const cached = memCache.get("github__/request/path");
            chai.expect(cached).to.have.property("data").which.equals("github");
        });

        it("should return the cached response if it exists", () => {
            memCache.put("github__/cached/path", { data: "cached" });
            githubRoutes.get({ path: "/cached/path" }, response);
            response.value.data.should.equal("cached");
        });

        it("should return the error response if the api call failes", () => {
            memCache.clear();
            httpsMock.expects("get").returns({ on: (event, callback) => callback({ statusCode: 500 }) });
            githubRoutes.get({ path: "/request/path" }, response);
            response.statusCode.should.equal(500);
            httpsMock.verify();
        });
    });
});
