
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

//dummy data
const users = {
  123: {
    id: '123',
    email: 'scully@xfiles.com',
    pasword: 'abcd'
  }
};

const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const app = express();
const PORT = 8080;

//middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); //allows us to utilize cookies

app.set("view engine", "ejs");

//function
const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};
//object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//methods
app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;

  if (!userId) {
    return res.status(401).send("please register");
  }

  const user = users[userId];

  const templateVars = { urls: urlDatabase,
    email: user.email,
    username: userId };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username
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

app.get("/", (req, res) => {
  res.send("Hello!");
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
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const templateVars = {
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  //res.clearCookie('user_id');
  //delete req.session['user_id']
  req.session['user_id'] = null;
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});