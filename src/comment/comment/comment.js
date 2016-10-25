"use strict";

let uuid = require("uuid");


class Comment {
    /*
     id: string;
     content: string;
     submitterId: string;
     created: Date;
     lastUpdate: Date;
     */

    constructor(comment) {
        Comment.fields.forEach(key => this[key] = comment[key]);

        if (!this.id) { this.id = uuid.v4(); }
        if (!(this.created instanceof Date)) {
            this.created = new Date(this.created);
        }
        if (!(this.lastUpdate instanceof Date)) {
            this.lastUpdate = new Date(this.lastUpdate);
        }
    }

    update(update) {
        Comment.fields.forEach(key => {
            if (update[key]) { this[key] = update[key]; }
        });
    }
}
Comment.fields = ["id", "content", "submitterId", "created", "lastUpdate"];

module.exports = Comment;
