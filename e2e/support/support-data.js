"use strict";

let supportData = {
    users: [],
    posts: [],
    lastPost: () => supportData.posts[supportData.posts.length - 1],
    previousPost: () => supportData.posts[supportData.posts.length -2],
    testResources: [],
    addTestResource: (testResource, testFolder) => {
        let key = `${testFolder}/${testResource}`;
        if (supportData.testResources.indexOf(key) === -1) {
            supportData.testResources.push(key);
        }
    }
};

module.exports = supportData;
