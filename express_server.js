/////////////////////////
// SETUP
/////////////////////////

const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const getUserByEmail = require("./helpers");

const app = express();
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['jorgeluis-01', 'jorgeluis-02']
}));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

/////////////////////////
// OBJECTS
/////////////////////////

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouse.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};

/////////////////////////
// FUNCTIONS
/////////////////////////
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

// Returns only URLs created by logged in user from urlDatabase
const urlsForUser = function (id, database) {
  const urlsByUserId = {};

  for (const key in database) {
    if (database[key].userID === id) {
      urlsByUserId[key] = database[key];
    }
  }
  return urlsByUserId;
};

/////////////////////////
// END POINTS --- GET
/////////////////////////

app.get("/", (req, res) => {
  // res.send("Hello!");
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const urlDatabaseByID = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: urlDatabaseByID,
    user: users[id]
  };

  if (id === undefined) {
    res.status(403).send('Please log in to see availables shortURLs')
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const templateVars = {
    user: users[id]
  };

  if (id === undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// logs /register template 
app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const urlDatabaseByID = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: urlDatabaseByID,
    user: users[id]
  };

  if (id === undefined) {
    res.render("register", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

// renders login.ejs
app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[id]
  };

  if (id === undefined) {
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

// Redirects the shortened version to actual URL assigned in urlDatabase
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  if (urlDatabase[id] === undefined) {
    res.status(403).send(`This tinyURL hasn't yet been registered.`);
    return;
  }

  const longURL = urlDatabase[id].longURL;

  if (longURL === undefined) {
    res.status(403).send(`This tinyURL doesn't have anything assigned yet, please adjust that at 'localhost:8080/urls/new'`);
  } else {
    res.redirect(longURL);
  }
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;

  if (urlDatabase[id] === undefined) {
    res.status(404).send('The tinyURL you are trying to reach hasn\'t been registered.');
    return;
  }

  const longURL = urlDatabase[id].longURL;
  const templateVars = {
    id,
    longURL,
    user: users[userId]
  };

  if (userId === undefined) {
    res.status(403).send('Please sign in to be able to generate tinyURLs');
    return;
  }

  if (urlDatabase[id].userID !== userId) {
    res.status(403).send('You can access and/or edit only tinyURL pages created by you');
    return;
  }

  res.render("urls_show", templateVars);
  return;
});

app.get("/urls.json", (req, res) => {
  res.send(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

/////////////////////////
// END POINTS --- POST
/////////////////////////

// logs the request body and gives a dummy response
app.post("/urls", (req, res) => {
  const idCookie = req.session.user_id;

  if (idCookie === undefined) {
    res.status(403).send('Please register and/or login to be able to tinyURL');
  } else {
    const id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: idCookie
    };
    res.redirect(`/urls/${id}`);
  }
});

// sets up a cookie with the info taken by the form at _header.ejs
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (email === "" || password === "") { // No email or password input
    res.status(403).send('Email and/or password cannot be empty.');
    return;
  } else if (!user) {
    res.status(403).send('This email is not registered.');
    return;
  }

  const hashedPassword = user.password;

  if (!bcrypt.compareSync(password, hashedPassword)) { // EMAIL CORRECT PASSWORD INCORRECT 
    res.status(403).send('Wrong password.');
    return;
  }  // HAPPY PATH! email and password found in "users" object

  const userId = user.id;

  req.session.user_id = userId;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Handles the registration data from "/login"
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" || password === "") {
    res.status(400).send('Email and/or password cannot be empty.');
    return;
  }

  if (!getUserByEmail(email, users)) {
    const id = generateRandomString();
    users[id] = {
      id,
      email,
      password: hashedPassword
    };
    const templateVars = {
      user: users[id]
    };

    req.session.user_id = id;
    res.redirect("/urls");
    return;
  }

  res.status(400).send('This email is already registered.');
  return;
});

// removes URL resource from object
app.post("/urls/:id/delete", (req, res) => {
  const idCookie = req.session.user_id;
  const id = req.params.id;

  if (urlDatabase[id].userID !== idCookie) {
    res.status(403).send("You can only delete a tinyURL if you created it");
    return;
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const userID = req.params.id;
  const idCookie = req.session.user_id;

  if (urlDatabase[userID].userID !== idCookie) {
    res.status(403).send("Unable to edit. Only the creator of a tinyURL can edit it.");
    return;
  }

  urlDatabase[userID].longURL = req.body.updatedURL;
  res.redirect("/urls");
});

/////////////////////////
// SERVER LISTEN
/////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});