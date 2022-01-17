const findUserByEmail = function (email, database) {
  for (let profile in database) {
    const user = database[profile];
    if (user.email === email) {
      console.log(user.email);
      return user;
    }
  }
};

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};


module.exports = findUserByEmail, generateRandomString;
