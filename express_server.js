//modules
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;

//object
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); //allows us to utilize cookies
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");


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
const findUserByEmail = (email) => {
  for (const id in users) {
    const user = users[id];
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
  const user = users[users];
  const templateVars = {user: user, id: users.id, email: users.email};

  if (!user) {
    return res.status(401).send("please register");
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {user: user};

  if (!user) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.users.id
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
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

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");  //avoid this level of specificity in error message outside of development for security reasons
  }
  const user = findUserByEmail(email);
  console.log('user', user);
  if (!user) {
    return res.status(400).send("a user with specified email does not exist");
  }
  if (user.password !== password) {
    return res.status(400).send('password does not match');
  }
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send("the user already exists with the specified email address");
  }

  const userID = generateRandomString();

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: password
  };

  console.log('users', users);

  // eslint-disable-next-line camelcase
  req.session.user_id = userID;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});