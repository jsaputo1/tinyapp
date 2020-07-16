const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 5000;
app.set("view engine", "ejs");

//Helper Functions
const {
  generateRandomString,
  getUserByEmail,
  urlForUser,
  httpConverter,
} = require("./helpers");


//Databases
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "password"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "password",
  },
};

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));

//Cookie-session
const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],
  })
);

//Get Routes

// Redirect to index
app.get("/", (req, res) => {
  res.redirect("/urls/");
});

// Index
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const userCookie = req.session.user_id;
    const templateVars = {
      username: users[userCookie],
      urls: urlForUser(userCookie, urlDatabase),
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Add new URL
app.get("/urls/new", (req, res) => {
  const userCookie = req.session.user_id;
  let templateVars = {
    username: users[userCookie],
    urls: urlDatabase,
  };
  if (templateVars.username) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Registration page
app.get("/register", (req, res) => {
  res.render("urls_register", { username: users[req.session.user_id] });
});

//Login
app.get("/login", (req, res) => {
  res.render("urls_login", { username: users[req.session.user_id] });
});

//Individual URL page
app.get("/urls/:shortURL", (req, res) => {
  userCookie = req.session.user_id;
  shortURL = req.params.shortURL;
  let templateVars = {
    username: users[userCookie],
    urls: urlForUser(userCookie, urlDatabase),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
  };
  res.render("urls_show", templateVars);
});

//Redirect after submitting a new URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    if (longURL) {
      res.redirect(longURL);
    }
  } else {
    res.send(
      `<html><h3>Invalid short URL. Please resubmit your URL <a href="/urls/new">here</a></h3></html>`
    );
  }
});

//Posts

//Create new URL
app.post("/urls", (req, res) => {
  const longURL = httpConverter(req.body.longURL);
  const shortURL = generateRandomString();
  const userID = req.session.user_id;

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID,
    shortURL: shortURL,
  };

  res.redirect(`/urls/${shortURL}`);
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const username = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === username) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("Error: You are not logged in");
  }
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const username = req.session.user_id;
  const longURL = httpConverter(req.body.longURL);
  if (urlDatabase[shortURL].userID === username) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("Error: You are not logged in");
  }
});

// Login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user && req.body.password === user.password) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Error: 403. Incorrect username or password");
  }
});

//Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (password.length < 1) {
    res.status(400).send("Your password is not long enough");
    return;
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("Your e-mail is already registered");
    return;
  }
  const id = generateRandomString();
  users[id] = {
    id: id,
    email: email,
    password: password
  };
  req.session.user_id = users[id].id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
