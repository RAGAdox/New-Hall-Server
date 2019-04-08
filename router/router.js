const express=require('express');
const fs = require("fs");
const testFolder = "./uploads/";
const user=require('../models/user')
let filelist = [];
const router = express.Router();
fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
      //console.log(file);
      filelist.push(file);
    });
  });
  var sessionChecker = (req, res, next) => {
    console.log(req.session.user+' session checker')
    console.log(req.cookies.user_sid+' cookies checker')
    if (req.session.user || req.cookies.user_sid) {
      next(); 
      //res.redirect('/dashboard');
    } else {
       res.json({status:'not loged in'})
    }    
};
router.get('/check',sessionChecker,(req,res)=>{
    res.json({status:"its ok"})
})
router.get('/',(req,res)=>{
    res.render("index", {
        title: "Files App",
        filelist,
      })
})
router.get('/login',(req,res)=>{
  res.render('login')
})
router.post('/login',(req,res)=>{
  console.log(user)
  if(req.body.username=='admin'&&req.body.password=='admin')
  {
    console.log('correct')
    user.username=req.body.username
    user.password=req.body.password
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
    console.log(req.params.file);
    res.download("./uploads/" + req.params.file.substring(1), err => {
      if (err == null) console.log("File Transfered Successfully");
      else console.log(err);
    });
  });
module.exports = router;