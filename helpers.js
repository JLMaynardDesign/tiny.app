const findUserByEmail = function(email, database) {
  for (let profile in database) {
    const user = database[profile];
    if (user.email === email) {
      console.log(user.email);
      return user;
    }
  }
};

const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
  return undefined;
};

const loginUserID = (req, users) => {
  const id = req.session.user_id;

  if (users[id]) {
    return users[id];
  }
  return null;
};
//

module.exports = {
  findUserByEmail,
  getUserByEmail,
  loginUserID
};