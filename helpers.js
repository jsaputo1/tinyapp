const getUserByEmail = (email, database) => {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID];
    }
  }
  return false;
};

// console.log(getUserByEmail("user2@example.com"));

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
      console.log(database[shortURL]);
      userURLs[shortURL] = longURL;
    }
  }
  return userURLs;
};

module.exports = { getUserByEmail, generateRandomString, urlForUser };
