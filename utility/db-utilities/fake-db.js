"use strict";

let faker = require("faker");

const postsCount = 55;

let properize = (str) => { return str.replace(/(^|\s|-)(.)/g, (first) => first.toUpperCase()); };

let supportData = {
    tags: []
};
while (supportData.tags.length < 15) {
    let tag = properize(faker.hacker.adjective());
    if (supportData.tags.indexOf(tag) === -1) {
        supportData.tags.push(tag);
    }
}

function Post() {
    this.id = faker.random.uuid();
    this.title = faker.commerce.productName();
    this.featured = false;
    this.description = faker.company.catchPhrase();
    this.height = faker.random.number(1000) + 300;
    this.tags = faker.helpers.shuffle(supportData.tags).slice(0, faker.random.number(4));
    this.cover = faker.internet.avatar();
}

let posts = [];
while (posts.length < postsCount) {
    posts.push(new Post());
}
faker.random.arrayElement(posts).featured = true;

module.exports = {
    ragingGoblinPosts: posts
};