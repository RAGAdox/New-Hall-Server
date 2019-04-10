const express = require('express');
const fileUpload = require('express-fileupload')
const path = require('path')
const fs = require("fs");
const testFolder = "./uploads/";
const user = require('../models/user')
let filelist = [];
const router = express.Router();
fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    //console.log(file);
    filelist.push(file);
  });
});
var sessionChecker = (req, res, next) => {
  //console.log(req.session.user + ' session checker')
  //console.log(req.cookies.user_sid + ' cookies checker')
  if (req.session.user || req.cookies.user_sid) {
    next();
    //res.redirect('/dashboard');
  } else {
    res.json({ status: 'not loged in' })
  }
};
router.get('/check', sessionChecker, (req, res) => {
  res.json({ status: "its ok" })
})
router.get('/upload', sessionChecker, (req, res) => {
  //res.json({status:'this is the upload'})
  res.render('upload')
})
router.get('/', (req, res) => {
  res.render("index", {
    title: "Files App",
    filelist,
  })
})
router.get('/login', (req, res) => {
  res.render('login')
})
router.use(fileUpload());
router.post('/upload', sessionChecker, function (req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  if (req.files.sampleFile[0])
    sampleFile.forEach(file => {

      uploadPath = path.join("./uploads/" + file.name);

      file.mv(uploadPath, function (err) {
        if (err) {
          return res.status(500).send(err);
        }

        //res.send('File uploaded to ' + uploadPath);
        filelist.push(file.name);

      });

    })
  else {
    uploadPath = path.join("./uploads/" + sampleFile.name);

    sampleFile.mv(uploadPath, function (err) {
      if (err) {
        return res.status(500).send(err);
      }

      //res.send('File uploaded to ' + uploadPath);
      filelist.push(sampleFile.name);

    });
  }
  res.redirect("/");
})
router.post('/login', (req, res) => {
  //console.log(user)
  if (req.body.username == 'admin' && req.body.password == 'admin') {
    console.log('correct')
    user.username = req.body.username
    user.password = req.body.password
    req.session.user = user
    res.redirect('/')
  }
})
router.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie('user_sid');
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});
router.get("/downloadFile/:file", (req, res) => {
  //console.log(req.params.file);
  res.download("./uploads/" + req.params.file.substring(1), err => {
    if (err == null) console.log("File Transfered Successfully");
    else console.log(err);
  });
});
router.get('/view/:file', (req, res) => {
  //res.json({ check: '/uploads/' + req.params.file.substring(1) })
  //res.redirect('/uploads/' + req.params.file.substring(1))
  let link = '/' + req.params.file.substring(1)
  res.render('view', {
    link,
  })
})
module.exports = router;