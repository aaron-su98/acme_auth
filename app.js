const express = require("express");
const app = express();
const {
  models: { User, Note },
} = require("./db");
const path = require("path");
require("dotenv").config();

// middleware
app.use(express.json());

const requireToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const user = await User.byToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth", requireToken, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users", async (req, res, next) => {
  try {
    const users = await User.findAll(req.body);
    res.send(users);
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    console.log(Note);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:id/notes", requireToken, async (req, res, next) => {
  try {
    const user = req.user;

    if (user.id !== parseInt(req.params.id)) {
      const error = new Error("Unauthorized access");
      error.status = 401;
      throw error;
    }
    const notes = await Note.findAll({
      where: {
        userId: user.id,
      },
    });
    res.send(notes);
  } catch (error) {
    next(error);
  }
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
