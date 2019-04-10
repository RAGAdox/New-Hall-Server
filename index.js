const express = require('express');
const exphbs = require("express-handlebars");
const fs = require('fs');
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

/*testing*/
app.get('/video', function (req, res) {
  const pathvideo = 'assets/sample.mp4'
  //console.log(pathvideo)
  const stat = fs.statSync(pathvideo)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1
    const chunksize = (end - start) + 1
    const file = fs.createReadStream(pathvideo, { start, end })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(pathvideo).pipe(res)
  }
});
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