"use strict";

let chai = require("chai");
chai.should();

let driver = require("./comments.driver");

function CommentsSteps() {

    this.Before(() => {
        driver.supportData.comments = [{
            id: "1",
            content: "Test comment",
            submitterId: "1",
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        }];
        return driver.directPut(driver.supportData.comments[0]);
    });

    this.Then(/^I can view all comments$/, () => {
        return driver.getAll().expect(response => {
            response.status.should.equal(200);
            return response.body.should.have.length.at.least(1);
        });
    });

    this.Then(/^I can view a single comment$/, () => {
        return driver.getOne(driver.supportData.comments[0].id).expect(response => {
            response.status.should.equal(200);
            return response.body.should.eql(driver.supportData.comments[0]);
        });
    });

    this.Then(/^I (attempt to )?save a comment to the database$/, (doomedToFail) => {
        let comment = {
            id: "2",
            content: "Added comment",
            submitterId: "2",
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        driver.supportData.comments.push(comment);
        return driver.put(comment).expect(response => {
            if (doomedToFail) {
                return response.status.should.equal(403);
            } else {
                response.status.should.equal(200);
                return response.body.should.have.property("id", "2");
            }
        });
    });

    this.Then(/^I (attempt to )?update an existing comment$/, (doomedToFail) => {
        if (!doomedToFail) { driver.supportData.comments[0].content = "Updated comment"; }
        return driver.update(driver.supportData.comments[0].id, { content: "Updated comment" })
            .expect(response => {
                if (doomedToFail) {
                    return response.status.should.equal(403);
                } else {
                    response.status.should.equal(200);
                    response.body.id.should.equal("1");
                    return response.body.content.should.equal("Updated comment");
                }
            });
    });

    this.Then(/^I can verify the comment I just (.+)/, (updatedSaved) => {
        if (updatedSaved === "updated") {
            driver.supportData.comments[0].content = "Updated comment";
        }
        return driver.getOne(driver.supportData.comments[0].id)
            .expect(response => {
                response.status.should.equal(200);
                return response.body.should.have
                    .property("content", driver.supportData.comments[0].content);
            });
    });

    this.Then(/^the comment is not saved$/, () => {
        return driver.getOne("2").expect(404);
    });

    this.Then(/^the comment is not updated$/, () => {
        return driver.getOne(driver.supportData.comments[0].id).expect(response => {
            return response.body.should.have
                .property("content", driver.supportData.comments[0].content);
        });
    });

    this.After(() => {
        let promises = [];
        driver.supportData.comments.forEach(comment => {
            promises.push(driver.directDelete(comment.id));
        });
        return Promise.all(promises);
    });
}

module.exports = CommentsSteps;
