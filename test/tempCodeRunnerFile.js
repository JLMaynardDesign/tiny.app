
describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(expectedUserID, user.id);
  });

  it('should return undefined, if an attempt to pass an email that does not already exist in the user database is committed', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedEmail = undefined;
    assert.equal(expectedEmail, user.email);
  });
});
