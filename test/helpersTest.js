const { assert } = require("chai");

const { getUserByEmail, urlForUser } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const testURLs = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
};

describe("getUserByEmail", function () {
  it("should return the appropriate user if the email is within the database", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    };
    assert.deepEqual(user, expectedOutput);
  });

  it("should return undefined if the email is not in the database", function () {
    const user = getUserByEmail("user1@example.com", testUsers);
    assert.strictEqual(user, undefined);
  });
});

describe("urlForUser", function () {
  it("should return the appropriate URLs that match the userID", function () {
    const userURLs = urlForUser("aJ48lW", testURLs);
    const expectedOutput = {
      b6UTxQ: "https://www.tsn.ca",
    };
    assert.deepEqual(userURLs, expectedOutput);
  });

  it("should return an empty object if there is no user ID in the database", function () {
    const userURLs = urlForUser("123456", testURLs);
    assert.deepEqual(userURLs, {});
  });
});
