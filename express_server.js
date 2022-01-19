//modules
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const PORT = 8080;
const cookieParser = require('cookie-parser');

//middleware
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
}));

//global object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "3456"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//object
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.youtube.com",
    userID: "peter23",
  },
  i4BoYr: {
    longURL: "https://www.google.ca",
    userID: "peter23",
  },
};

//helper function:
//getUserByEmail function
const findUserByEmail = require("./helpers");
//const generateRandomString = require("./helpers");
const { request } = require("express");
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

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

//
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//home
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user, urls: urlsForUser(userID) };

  if (!user) {
    res.redirect("/login");
  }

  // eslint-disable-next-line no-undef
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    return res.redirect("/login");
  }

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
    return res.redirect("/login");
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
    res.status(403).send("either the list does not belong to you, or you are entering the proper URL");
  }

  res.render("urls_show", templateVars);
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
    res.redirect(`http://${redirectURL}`);
  }
});


app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const userOwnURLs = urlsForUser(userID);
  const templateVars = { user };

  if (!user) {
    return res.status(403).send("please log-in before attempting to edit");
  } else if (!userOwnURLs) {
    return res.status(403).send("either the list does not belogn to you, or you are entering the proper URL");
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/');
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

app.post("/login", (req, res) => {
  let user = findUserByEmail(req.body.email, users);
  const bodyPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(bodyPassword, 10);
  const templateVars = { user };

  if (!user) {
    return res.status(403).render("login_error", templateVars);
  } else if (user && bcrypt.compareSync(user.password, hashedPassword)) {
    return res.status(403).render("login_error", templateVars);
  } else {
    // eslint-disable-next-line camelcase
    req.session.user_id = user.id;
    res.redirect("/urls/");
  }
});

//logout
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  //req.session = null;
  return res.redirect('/urls');
});


//registration
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  if (user) {
    res.redirect("/urls");
  }

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("email and password cannot be blank");
  }

  const user = findUserByEmail(req.body.email, users);
  const templateVars = { user };
  if (user) {
    return res.status(400).send("the user already exists with the specified email address");
  }

  const userID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const email = req.body.email;

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: hashedPassword,
  };

  // eslint-disable-next-line camelcase
  req.session.user_id = userID;
  return res.redirect('/urls');
});

//login
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  if (user) {
    return res.redirect("/urls");
  }

  return res.render("login", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});