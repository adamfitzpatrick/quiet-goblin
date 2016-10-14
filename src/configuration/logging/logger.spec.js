"use strict";

let chai = require("chai");
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

describe("logger", () => {
    let logger;
    let winstonMock;
    let LOGGER;

    beforeEach(() => {
        logger = rewire("./logger");
        winstonMock = sinon.mock(logger.__get__("WINSTONLOGGER"));
        LOGGER = logger({ item: "item" });
    });

    describe("info", () => {
        it("should properly log info", () => {
            winstonMock.expects("info")
                .withExactArgs("message", { item: "item", otherItem: "otherItem" }).once();
            LOGGER.info("message", { otherItem: "otherItem" });
            winstonMock.verify();
        });

        it("should properly log info without additional payload", () => {
            winstonMock.expects("info").withExactArgs("message", { item: "item" }).once();
            LOGGER.info("message");
            winstonMock.verify();
        });
    });

    describe("warn", () => {
        it("should properly log warnings", () => {
            winstonMock.expects("warn")
                .withExactArgs("message", { item: "item", otherItem: "otherItem" }).once();
            LOGGER.warn("message", { otherItem: "otherItem" });
            winstonMock.verify();
        });

        it("should properly log warnings without addition payload", () => {
            winstonMock.expects("warn").withExactArgs("message", { item: "item" }).once();
            LOGGER.warn("message");
            winstonMock.verify();
        });
    });

    describe("error", () => {
        it("should properly log errors", () => {
            winstonMock.expects("error")
                .withExactArgs("message", { item: "item", otherItem: "otherItem" }).once();
            LOGGER.error("message", { otherItem: "otherItem" });
            winstonMock.verify();
        });

        it("should properly log errors", () => {
            winstonMock.expects("error").withExactArgs("message", { item: "item" }).once();
            LOGGER.error("message");
            winstonMock.verify();
        });
    });
});
