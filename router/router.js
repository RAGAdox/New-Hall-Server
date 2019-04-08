const express=require('express');
const fs = require("fs");

const testFolder = "./uploads/";

let filelist = [];
const router = express();
fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
      //console.log(file);
      filelist.push(file);
    });
  });
router.get('/check',(req,res)=>{
    res.json({status:"its ok"})
})
router.get('/',(req,res)=>{
    res.render("index", {
        title: "Files App",
        filelist,
      })
})

router.get("/downloadFile/:file", (req, res) => {
    console.log(req.params.file);
    res.download("./uploads/" + req.params.file.substring(1), err => {
      if (err == null) console.log("File Transfered Successfully");
      else console.log(err);
    });
  });
module.exports = router;