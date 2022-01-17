const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return user with a valid email address', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined if the email does not exist in the database', function() {
    const user = findUserByEmail("notInDatabase@example.com", testUsers);
    const expected = undefined;
  
    assert.equal(user, expected);
    
  });
});

