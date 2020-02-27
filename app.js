const express = require("express");
const fs = require("fs");
const https = require("https");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const secret = process.env.secret;
const mysql = require("mysql");
var bodyParser = require("body-parser");
const authService = require("./auth-service/authservice");

app.use(bodyParser.json());

var connection = mysql.createConnection({
  host: "mysql-server",
  port: "3306",
  user: "mysql",
  password: "password123!",
  database: "auth"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting " + err);
  }

  console.log("database is connected wow !");
});

app.get("/", function(req, res) {
  res.send("hello world");
});

// new user return jwt
app.post("/auth/new", async function(req, res) {
  try {
    const { email, password } = req.body;
    console.log("inside here");

    const sqlQueryExisting = `select * from users where email = `;
    connection.query(sqlQueryExisting + connection.escape(email), function(
      err,
      result,
      field
    ) {
      if (err) throw err;
      // user exists already
      if (result.insertId === 0) {
        res.status(403).json({
          error: "Invalid Username or Password"
        });
      }
      const hashPassword = bcrypt.hashSync(password, saltRounds);
      connection.query(
        `insert into users (email, password) values (?,?)`,
        [email, hashPassword],
        (err, result, fields) => {
          if (err) throw err;
          // create jwt token
          const token = authService.generateJwt(result.insertId);
          if (token) {
            res.status(200).json({
              user: result[0],
              token: token
            });
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
});

// user login
app.post("/auth/login", async function(req, res) {
  const { email, password } = req.body;
  const sqlQueryExisting = `select * from users where email = `;
  connection.query(
    sqlQueryExisting + connection.escape(email),
    (err, data, fields) => {
      if (data.insertId === 0) {
        res.status(403).json({
          error: "Invalid Username or Password"
        });
      }
      if (err) throw err;
      // bcryp compare
      const match = bcrypt.compareSync(password, data[0].password);
      if (!match) {
        res.status(403).json({
          error: "Invalid Username or Password"
        });
      } else {
        const token = authService.generateJwt(data.insertId);
        if (token) {
          res.status(200).json({
            userId: data[0].id,
            token: token
          });
        }
      }
    }
  );
});

//suppose we want to get it from reqbody.
https
  .createServer(
    {
      key: fs.readFileSync("keys/localhost.key"),
      cert: fs.readFileSync("keys/localhost.cert")
    },
    app
  )
  .listen(443, function() {
    console.log(
      "Example app listening on port 443! Go to https://localhost:443/"
    );
  });
