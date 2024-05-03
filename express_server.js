/////////////////////////
// SETUP
/////////////////////////

const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

/////////////////////////
// OBJECTS
/////////////////////////

const urlDatabase = {
  b2xVn2: "http://www.lighthouse.ca",
  "9sm5xK": "http://www.google.com"
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

// Finds if the users object already has a user registered with the email
const getUserByEmail = function (email, users) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
};

/////////////////////////
// END POINTS --- GET
/////////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = {
    // username: req.cookies["username"],
    urls: urlDatabase,
    user: users[id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = {
    user: users[id]
  };
  res.render("urls_new", templateVars);
});

// logs /register template to login
app.get("/register", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = {
    // username: null
    user: users[id]
  };
  res.render("register", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    // username: req.cookies["username"],
    id: req.params.id, longURL: urlDatabase[req.params.id],
    user: users[userId]
  };
  res.render("urls_show", templateVars);
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
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// sets up a cookie with the info taken by the form at _header.ejs
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// Handles the registration data from "/login"
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.sendStatus(400);
  } else if (!getUserByEmail(email, users)) {
    const id = generateRandomString();
    users[id] = {
      id,
      email,
      password
    };
    const templateVars = {
      user: users[id]
    };
    res.cookie("user_id", id);
    res.redirect("/urls");
  } else {
    res.sendStatus(400);
  }
});

// removes URL resource from object
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[id] = req.body.updatedURL;
  console.log(urlDatabase)
  res.redirect("/urls");
});

/////////////////////////
// SERVER LISTEN
/////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});