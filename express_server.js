//modules
const express = require("express");

const {
  findUserByEmail,
  getUserByEmail,
  loginUserID
} = require('./helpers');

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
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("123456", 10),
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password:  bcrypt.hashSync("dishwasher-funk", 10),
  }
};

//object
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.youtube.com", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  ytMcC1: { longURL: "https://www.utoronto.ca", userID: "userRandomID" },
};

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
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


app.get("/", (req, res) => {

  if (loginUserID(req, users)) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
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
  
  const email = req.body.email;
  let user = findUserByEmail(email, users);
  let userID = getUserByEmail(email, users);
  const password = req.body.password;

  if (!user) {
    return res.status(400).send("user not found");
  } else if (!bcrypt.compareSync(password, user["password"])) {
    return res.status(403).send("invalid password, please try again");
  }

  if (userID && bcrypt.compareSync(password, user["password"])) {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
});

//home
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.redirect('login');
  }
  const templateVars = { user: loginUserID(req, users),
    urls: urlsForUser(userID), users: users,
    account: req.session.user_id, };

  return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.redirect('login');
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
  };

  if (!userOwnURLs[req.params.shortURL]) {
    return res.status(403).send("The requested URL does not belong to your user-ID. Perhaps you have another account? If so, please log onto the other account to check for the URLs list you want.");
  }

  return res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.redirect(`/login`);
  }

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

  if (!user || !userOwnURLs) {
    return res.status(403).send("You are not logged in. Please make sure to enter the correct email and password to access your account in order to create or access your shortened URLs.");
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    return res.redirect(`/`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const userOwnURLs = urlsForUser(userID);

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
  return res.redirect("/urls");
});


//registration
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user: loginUserID(req, users)
  };
  return res.render("register", templateVars);
});

app.post("/register", (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("input cannot be blank");
  }

  const email = req.body.email;
  const user = findUserByEmail(email, users);

  if (user) {
    return res.status(400).send("user already exists");
  }

  const userID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword,
  };

  console.log(users[userID]);

  req.session.user_id = userID;
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


