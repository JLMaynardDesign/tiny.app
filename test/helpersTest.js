const { assert } = require('chai');
const bcrypt = require("bcryptjs");
const  findUserByEmail  = require('../express_server');

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};
describe('findUserByEmail', function() {
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

