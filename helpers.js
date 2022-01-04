const findUserByEmail = (email, database) => {
  for (const property in database) {
    const user = database[property];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const urlsForUser = function(id) {
  let userURLList = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLList[url] = {};
      userURLList[url] = {
        userID: urlDatabase[url].userID,
        longURL: urlDatabase[url].longURL,
      };
    }
  }
  return userURLList;
};

module.exports = {findUserByEmail, generateRandomString, urlsForUser };
