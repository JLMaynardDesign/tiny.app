const { response } = require("express");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); //set ejs as the view engine

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
//bodyParser needs to come before all routes to convert request body into readable form

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//add new route handler for "/urls" and use res.rener() to pass the URL data to our template
//routes should be orderd from most specific to least specific
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]/* What goes here? */ };
  res.render("urls_show", templateVars);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let urlDatabase = {shortURL, longURL};
  console.log(urlDatabase);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
});

//redirect short urls
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];//req.body.longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  //const shortURL = req.params.shortURL;
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

