// Finds if the users object already has a user registered with the email
const getUserByEmail = function (email, users) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
};

module.exports = getUserByEmail;