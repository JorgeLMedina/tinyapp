const { assert } = require('chai');

const findUserByEmail = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = 'userRandomID';
    assert.deepStrictEqual(user, testUsers[expectedUserID]);
  });
});

describe('findUserByEmail', function () {
  it('should return null with an non-existent email', function () {
    const user = findUserByEmail("example@example.com", testUsers);
    assert.strictEqual(user, null)
  });
});