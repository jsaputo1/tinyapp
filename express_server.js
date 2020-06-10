const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "1234",
  },
};

//Functions

const userLookup = (email) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  console.log("Email not found");
  return false;
};

const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000)
    .toString(16)
    .substring(1);
};

//Middleware to use body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Middleware to use cookie parser
var cookieParser = require("cookie-parser");
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//Index page
app.get("/urls", (req, res) => {
  let templateVars = {
    username: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//Page to add new
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_new", templateVars);
});

//Registration page
app.get("/register", (req, res) => {
  res.render("urls_register", { username: users[req.cookies["user_id"]] });
});

//Login
app.get("/login", (req, res) => {
  res.render("urls_login", { username: users[req.cookies["user_id"]] });
});

//Individual URL page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    username: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

//Redirect after submitting a new URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send(
      `<html><h3>Please resubmit your URL <a href="/urls/new">here</a></h3></html>`
    );
  }
});

//Posts

//Create new URL
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  const shortURL = generateRandomString();

  if (!longURL.startsWith("http://")) {
    urlDatabase[shortURL] = `http://${longURL}`;
  } else {
    urlDatabase[shortURL] = longURL;
  }
  res.redirect(`/urls/${shortURL}`);
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

//Login
app.post("/login", (req, res) => {
  if (!userLookup(req.body.email)) {
    res.send("Error: 403. E-Mail address cannot be found");
    return;
  } else if (userLookup(req.body.email).password != req.body.password) {
    res.send("Error: 403. Incorrect password");
    return;
  }
  let id = userLookup(req.body.email).id;
  res.cookie("user_id", users[id].id);
  res.redirect("/urls");
  return;
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Register
app.post("/register", (req, res) => {
  if (req.body.password.length < 1) {
    res.send("Error: 400. Your password is not long enough");
    return;
  } else if (userLookup(req.body.email)) {
    res.send("Error: 400. Your e-mail is already registered");
    return;
  }

  const id = generateRandomString();
  users[id] = {
    username: id,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie("user_id", users[id].username);
  res.redirect("/urls");
});
