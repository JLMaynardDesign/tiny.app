const findUserByEmail = (email, database) => {
  for (const property in database) {
    const user = database[property];
    if (user.email === email) {
      console.log(user.email);
      return user;
    }
  }
};

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};


module.exports = {findUserByEmail, generateRandomString };
