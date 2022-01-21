//modules
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
}));
app.set("view engine", "ejs");

//global object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123456"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};

//object
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.youtube.com", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  ytMcC1: { longURL: "https://www.utoronto.ca", userID: "userRandomID" },
};

const urlsForUser = function (id) {
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

const generateRandomString = function () {
  return Math.random().toString(36).slice(2, 8);
};

const findUserByEmail = function (email, database) {
  for (let profile in database) {
    const user = database[profile];
    if (user.email === email) {
      console.log(user.email);
      return user;
    }
  }
};

module.exports = findUserByEmail;

const loginUserID = (req, users) => {
  const id = req.session.user_id;

  if (users[id]) {
    return users[id];
  }
  return null;
};
//
app.get("/", (req, res) => {

  if (loginUserID(req, users)) {
    return res.redirect("/urls");
  }
  res.redirect(`/login`);
});

//login
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user: loginUserID(req, users)
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("No input detected");
  }

  let email = req.body.email;
  let userID = findUserByEmail(email, users);
  const newPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);


  if (!userID) {
    return res.status(400).send("user not found");
  } else if (!bcrypt.compareSync(userID.password, hashedPassword)) {
    return res.status(403).send("invalid password, please try again");
  } else {
  //if (userID && bcrypt.compareSync(req.body.password, users[userID].password)) {
    req.session.user_id = userID.id;
    return res.redirect("/urls");
  }
});

//home
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: loginUserID(req, users), urls: urlsForUser(userID), users: users, account: req.session.user_id, };

  //if (!user) {
  //return res.render("error_page", templateVars);
  // }

  return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  //if (!user) {
  //return res.redirect(`/login`);
  //}

  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = userID;

  return res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user };

  if (!user) {
    return res.redirect(`/login`);
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const userOwnURLs = urlsForUser(userID);

  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase,
    //username: req.session.user_id
  };

  if (!userOwnURLs[req.params.shortURL]) {
    return res.render("/error_page", templateVars);
  }

  return res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  /*if (urlDatabase[req.params.shortURL]) {
    return res.redirect(urlDatabase[req.params.shortURL]["longURL"]);
  }
  res.status(404).send("the short URL here does not correspond to the specified long URL");
  */
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  const redirectURL = urlDatabase[req.params.shortURL].longURL;
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send('URL does not exist');
  } else {
    return res.redirect(`${redirectURL}`);
  }
});


app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const userOwnURLs = urlsForUser(userID);
  const templateVars = { user };

  if (!user || !userOwnURLs) {
    return res.render("error_page", templateVars);
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    return res.redirect(`/`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const userOwnURLs = urlsForUser(userID);
  const templateVars = { user };

  if (!user) {
    return res.status(403).send("please log-in before attempting to edit");
  } else if (!userOwnURLs) {
    return res.status(403).send("either the list does not belogn to you, or you are entering the proper URL");
  } else {
    const deleteURL = req.params.shortURL;
    delete urlDatabase[deleteURL];
    res.redirect("/");
  }
});

//logout
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  //req.session = null;
  return res.redirect(`/urls`);
});


//registration
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  if (user) {
    return res.redirect(`/urls`);
  }

  return res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("email and password cannot be blank");
  }

  const user = findUserByEmail(req.body.email, users);
  const templateVars = { user };
  if (user) {
    return res
      .status(400)
      .render("login_error", templateVars);
  }

  const userID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: hashedPassword,
  };
  req.session.user_id = userID;
  return res.redirect(`/urls`);
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});