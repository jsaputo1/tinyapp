const getUserByEmail = (email, database) => {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID];
    }
  }
  return undefined;
};

const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000)
    .toString(16)
    .substring(1);
};

const urlForUser = (userID, database) => {
  const userURLs = {};
  for (const shortURL in database) {
    const longURL = database[shortURL].longURL;
    if (database[shortURL].userID === userID) {
      userURLs[shortURL] = longURL;
    }
  }
  return userURLs;
};

httpConverter = function (longURL) {
  const http = "http://";
  const https = "https://";
  longUrlStart = longURL.substring(7, 0);
  longURL.toLowerCase();
  if (longURL.startsWith(https)) {
    longURL = longURL;
  } else if (!longURL.startsWith(http)) {
    longURL = http + longURL;
  }
  longURL = longURL;
  return longURL;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlForUser,
  httpConverter,
};
