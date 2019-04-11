const express = require('express');
const fileUpload = require('express-fileupload')
const path = require('path')
const fs = require("fs");
const testFolder = "./uploads/";
const user = require('../models/user')
let filelist = [];
let dirlist = [];
const router = express.Router();
fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    //console.log(file);
    //console.log(fs.statSync(testFolder + file).isDirectory())
    if (!fs.statSync(testFolder + file).isDirectory())
      filelist.push(file);
    //filelistExt.push(path.extname(file || '').split('.'))
  });
});
/*middleware for login Check*/
var sessionChecker = (req, res, next) => {
  if (req.session.user || req.cookies.user_sid) {
    next();
  } else {
    res.redirect('/login')
  }
};
/*testing if user is logged in or not
  //dummy route
  */
router.get('/check', sessionChecker, (req, res) => {
  res.json({ status: "its ok" })
})
//UPLOAD FUNCTIONALITY
/*route for rendering upload page*/
router.get('/upload', sessionChecker, (req, res) => {
  //res.json({status:'this is the upload'})
  res.render('upload')
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

//LOGIN FUNCTIONALLITY
/*Route for rendering login page*/
router.get('/login', (req, res, next) => {
  res.render('login')
})
/*route for ACTUAL AUTHENTICATION*/
router.post('/login', (req, res, next) => {
  //console.log(user)
  if (req.body.username == 'admin' && req.body.password == 'admin') {
    console.log('correct')
    user.username = req.body.username
    user.password = req.body.password
    req.session.user = user
    res.redirect('/upload')
    //next()
  }
  else {
    //res.send('Invalid Credentials')
    res.render('login', {
      msg: 'invalid Credentials'
    })
  }
})
/*route for Logging Out The user*/
router.get('/logout', (req, res) => {
  if (req.session.user || req.cookies.user_sid) {
    res.clearCookie('user_sid');
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});
//MAIN FUNCTIONALITY
//RENDERING HOME PAGE SHOWING ALL FILES PRESENT
router.get('/', (req, res) => {
  let files = filelist
  res.render("index", {
    title: "Files App",
    files,
  })
})
//Route for downloading Files
router.get("/downloadFile/:file", (req, res) => {
  //console.log(req.params.file);
  res.download("./uploads/" + req.params.file.substring(1), err => {
    if (err == null) console.log("File Transfered Successfully");
    else console.log(err);
  });
});
//Route for viewing the Mp4 and mp4
router.get('/view/:file', (req, res) => {
  //res.json({ check: '/uploads/' + req.params.file.substring(1) })
  //res.redirect('/uploads/' + req.params.file.substring(1))
  let link = '/' + req.params.file.substring(1)
  console.log(path.extname(link).split('.')[1])
  if (path.extname(link).split('.')[1] == 'mp4') {
    console.log('render video')
    res.render('viewVideo', {
      link,
    })
  }
  else if (path.extname(link).split('.')[1] == 'mp3') {
    console.log('render Audio')
    res.render('viewAudio', {
      link,
    })
  }
  else {
    console.log('error')
    res.redirect('/downloadFile/' + req.params.file)
  }

  //
})

//IN TESTING MODE 
router.get('/showfiles', (req, res) => {
  dirlist = []
  fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
      //console.log(file);
      //console.log(fs.statSync(testFolder + file).isDirectory())
      if (fs.statSync(testFolder + file).isDirectory())
        dirlist.push(file);
      //filelistExt.push(path.extname(file || '').split('.'))
    });
  });
  res.render('showFiles', {
    dirlist,
  })
})
router.get('/showFiles/:folder', (req, res) => {
  console.log(testFolder + req.params.folder.substring(1))
  let filesinDir = []
  let i = 0;
  fs.readdir(testFolder + req.params.folder.substring(1) + '/', (err, files) => {
    files.forEach(file => {
      console.log(file);
      filesinDir.push(file);
      i++;
      if (i == files.length) {
        let files = filesinDir
        res.render('index', {
          title: "Files App",
          files,
        });
      }
    })
  })
})

module.exports = router;