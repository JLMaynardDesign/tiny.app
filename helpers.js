const findUserByEmail = (email, database) => {
  for (const property in database) {
    const user = database[property];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

module.exports = {findUserByEmail};
