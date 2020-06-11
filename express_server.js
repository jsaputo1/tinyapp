// const bcrypt = require("bcrypt");
// const saltRounds = 10;
// const users = {
//   userRandomID: {
//     id: "userRandomID",
//     email: "user@example.com",
//     ,
//   },

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

//bcrypt
const saltRounds = 10;

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("1234", saltRounds),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("1234", saltRounds),
  },
};

//Functions

// const getUserByEmail = (email, database) => {
// for (const userID in database) {
// if (database[userID].email === email) {
// return database[userID];
// }
// }
// return false;
// };

const getUserByEmail = (email, database) => {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID];
    }
  }
  return false;
};

console.log(getUserByEmail("user2@example.com"));

const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000)
    .toString(16)
    .substring(1);
};

const urlForUser = (userID) => {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    const longURL = urlDatabase[shortURL].longURL;
    if (urlDatabase[shortURL].userID === userID) {
      userURLs[shortURL] = longURL;
    }
  }
  return userURLs;
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

// / page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Index
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const username = req.session.user_id;
    const templateVars = {
      username: users[username],
      urls: urlForUser(username),
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Page to add new
app.get("/urls/new", (req, res) => {
  const username = req.session.user_id;
  let templateVars = {
    username: users[req.session.user_id],
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
  shortURL = req.params.shortURL;
  console.log(urlDatabase);
  let templateVars = {
    username: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
  };
  res.render("urls_show", templateVars);
});

//Redirect after submitting a new URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const userID = req.session.user_id;

  if (!longURL.startsWith("http://")) {
    urlDatabase[shortURL] = {
      longURL: `http://${longURL}`,
      userID: userID,
      shortURL: shortURL,
    };
  } else {
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userID,
      shortURL: shortURL,
    };
  }
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
    res.send("Error: You are not logged in");
  }
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const username = req.session.user_id;
  let longURL = req.body.longURL;
  if (urlDatabase[shortURL].userID === username) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.send("Error: You are not logged in");
  }
});

// //Login
// app.post("/login", (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   const user = getUserByEmail(email);

//   if (!getUserByEmail(email)) {
//     res.send("Error: 403. E-Mail address cannot be found");
//     return;
//   } else if (!bcrypt.compareSync(password, user.password)) {
//     res.send("Error: 403. Incorrect password");
//     return;
//   }
//   console.log("test");
//   req.session.user_id = user.username;
//   res.redirect("/urls");
//   return;
// });

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.statusCode = 400;
    res.render("login", {
      user: undefined,
      error: "Incorrect email or password!",
    });
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
    res.send("Error: 400. Your password is not long enough");
    return;
  } else if (getUserByEmail(email, users)) {
    res.send("Error: 400. Your e-mail is already registered");
    return;
  }
  const id = generateRandomString();
  users[id] = {
    username: id,
    email: email,
    password: bcrypt.hashSync(password, saltRounds),
  };
  req.session.user_id = users[id].username;
  res.redirect("/urls");
});

// module.exports = { urlDatabase };

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
