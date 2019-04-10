const express = require('express');
const exphbs = require("express-handlebars");
const fileUpload = require('express-fileupload')
const session = require('express-session')
var cookieParser = require('cookie-parser');
const path = require("path");
var bodyParser = require("body-parser");
const testFolder = "./uploads/";
const router = require('./router/router.js');
const app = express();
app.use(cookieParser());
app.use(session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}));
app.use(express.static('uploads'))
app.use(bodyParser.urlencoded({ extended: false }));


// Use the mv() method to place the file somewhere on your server
/*sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
  if (err)
    return res.status(500).send(err);
 
  res.send('File uploaded!');
});*/

app.use('/', router);
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Started at post : " + PORT));