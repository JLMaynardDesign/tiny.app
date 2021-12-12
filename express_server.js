//modules
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

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

//global object
const users = {

};

//object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const user = users[userID];
  const templateVars = {user: user};

  if (!userID) {
    return res.status(401).send("please register");
  }

  //const templateVars = {
   // urls: urlDatabase,
  //  email: users.email,
   // id: users.id
  //};

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
  res.cookie('user_id', users.id);
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies.users
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

  const id = Math.floor(Math.random() * 2000) + 1;
  users[id] = {
    id: id,
    email: email,
    password: password
  };

  console.log('users', users);

  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  //delete req.session['user_id']
  res.clearCookie('users_id');
  req.session['users_id'] = null;
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.users_id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});