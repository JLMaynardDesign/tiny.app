//modules
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;

//middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); //allows us to utilize cookies
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

//object
let urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.youtube.com",
    userID: "bx782a",
  },
  i4BoYr: {
    longURL: "https://www.google.ca",
    userID: "bx782a",
  },
};

//global object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//helper function:
const findUserByEmail = (email, database) => {
  for (const property in database) {
    const user = database[property];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//helper function
const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

//
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//home
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    return res.status(401).send("please register");
  }

  const templateVars = {user: user, id: users.id, email: users.email};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[users];

  if (!user) {
    res.redirect("/login");
  }

  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = userID;

  res.redirect(`/urls/${shortURL}`);
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
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.session.user_id
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const deleteURL = req.params.shortURL;
  delete urlDatabase[deleteURL];
  //console.log(res.body);
  res.redirect("/urls");
});
//login
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  if (user) {
    res.redirect("/urls");
  }

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const user = findUserByEmail(req.body.email, users);
  const password = req.body.password;
  const templateVars = { user };

  if (!user) {
    return res.status(403).send("a user with specified email does not exist");
  } else if (user.password !== password) {
    return res.status(403).send('password does not match');
  } else if (user) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
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

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: password,
  };

  // eslint-disable-next-line camelcase
  req.session.user_id = userID;
  res.redirect('/urls');
});

//logout
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});