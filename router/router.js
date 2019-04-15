const express = require('express');
const fileUpload = require('express-fileupload')
const path = require('path')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require("fs");
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });

const testFolder = "./uploads/";
const user = require('../models/user')
let filelist = [];
let dirlist = [];
const router = express.Router();
async function del(arg) {
  let pathToDel
  if(arg.charAt(arg.length)=='/')
  pathToDel=arg.substring(1,arg.length-1)
  else
  pathToDel=arg.substring(1,arg.length)
  

  const { stdout, stderr } = await exec('cd uploads && rm -rf '+pathToDel);
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
  
}
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
router.post('/delete',(req,res)=>{
  console.log(req.body.curfolder)
  let folder=req.body.curfolder
  del(folder).then(()=>{
    res.redirect('/')
  });
})
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
  //console.log(req.body.foldername)
  let curpath=req.body.foldername||''
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  if (req.files.sampleFile[0])
    sampleFile.forEach(file => {

      uploadPath = path.join("./uploads/"+curpath + file.name);

      file.mv(uploadPath, function (err) {
        if (err) {
          return res.status(500).send(err);
        }

        //res.send('File uploaded to ' + uploadPath);
        filelist.push(file.name);

      });

    })
  else {
    uploadPath = path.join("./uploads/"+curpath + sampleFile.name);

    sampleFile.mv(uploadPath, function (err) {
      if (err) {
        return res.status(500).send(err);
      }

      //res.send('File uploaded to ' + uploadPath);
      filelist.push(sampleFile.name);

    });
  }
  res.redirect(req.headers.referer);
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
    //console.log('correct')
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
  let counter = 0;
  filelist = []
  fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
      counter++
      if (!fs.statSync(testFolder + file).isDirectory())
        filelist.push(file);
      //filelistExt.push(path.extname(file || '').split('.'))
      if (counter == files.length) {
        let files = filelist
        res.render("index", {
          title: "Files App",
          files,
        })
      }
    });
  });

})
router.post('/downloadFile',(req,res)=>{
  //console.log(req.body.file);
  res.download("./uploads/"+req.body.file , err => {
    if (err == null) console.log("File Transfered Successfully");
    else console.log(err);
  });
})
router.post('/delete',(req,res)=>{
  let fileToDel=req.body.filedel
  fs.unlink(testFolder+fileToDel,err=>{
    if(err)
      console.log(err)
    else{
      //console.log('File Deleted')
      //console.log(req.headers.referer)
      //res.redirect(`/showFiles/`)
      res.redirect(req.headers.referer)
    }
  });
})
router.post('/newfolder',(req,res)=>{
  let cur=testFolder+req.body.foldername
  fs.mkdir(cur+req.body.newfolder, { recursive: true }, (err) => {
    if (err) throw err;
    else res.redirect(req.headers.referer)
  });
})

//Route for viewing the Mp4 and mp4
router.post('/view',(req,res)=>{
  let id=req.body.fileView
  res.redirect(`/view/?id=${id}`)
})
router.get('/view', (req, res) => {

  let link =req.query.id||''

  //console.log(link)
  //console.log(path.extname(link).split('.')[1])
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
    res.download("./uploads/"+link , err => {
      if (err == null) console.log("File Transfered Successfully");
      else console.log(err);
    });
  }

  //
})

//IN TESTING MODE 
//router.use(bodyParser.urlencoded({ extended: false }));
router.get('/showfiles', (req, res) => {
  let dirlist = []
  let dirSize=0;
  let fileToShow=[]
  
  var id=req.query.id||''
  //console.log(testFolder+id)
  fs.readdir(testFolder+id, (err, files) => {
    let l=files.length
    let stat
    if(l)
    files.forEach((file,i) => {
      //console.log(file);
      //console.log(fs.statSync(testFolder + file).isDirectory())
      stat=fs.statSync(testFolder+id +'/'+ file)
      if (stat.isDirectory()){
        dirlist.push(file);
        //console.log(stat.size)
        //dirSize.push(file.)
      }
      else if(!stat.isDirectory()){
        console.log(stat.size)
        dirSize+=stat.size
        fileToShow.push(file)
      }
      if(i==l-1){
        dirSize/=1024
        
      res.render('showFiles', {
        dirlist:dirlist,
        fileToShow:fileToShow,
        dirSize:dirSize,
        id:id+'/' 
      })
      //console.log(dirlist)

    }
      //filelistExt.push(path.extname(file || '').split('.'))
    });
    else
    res.render('showFiles', {
      dirlist:dirlist,
      fileToShow:fileToShow,
      id:id+'/' 
    })
      //res.json({msg:'no files'})
  });
  
})
router.post('/showfiles', (req, res) => {
  let id=req.body.folder
  //console.log(id)
  res.redirect(`/showFiles/?id=${id}`)
})

router.get('/uploadFile', (req, res) => {
  res.render('uploadFile')
})
router.post('/uploadFile', (req, res) => {
  //console.log(req.body.folder)
  fs.mkdir('./uploads/' + req.body.folder, function (err) {
    if (err == null || err.code == 'EEXIST') {
      //console.log('dir created successfully');
      //console.log('in req.file'+req.file)
      if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
      }

      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let sampleFile = req.files.sampleFile;

      if (req.files.sampleFile[0])
        sampleFile.forEach(file => {

          uploadPath = path.join("./uploads/" + req.body.folder + '/' + file.name);

          file.mv(uploadPath, function (err) {
            if (err) {
              return res.status(500).send(err);
            }

            //res.send('File uploaded to ' + uploadPath);
            filelist.push(file.name);

          });

        })
      else {
        uploadPath = path.join("./uploads/" + req.body.folder + '/' + sampleFile.name);

        sampleFile.mv(uploadPath, function (err) {
          if (err) {
            return res.status(500).send(err);
          }

          //res.send('File uploaded to ' + uploadPath);
          filelist.push(sampleFile.name);

        });
      }
    }
    else
      console.log(err.code);

  });
  res.redirect('/')
})
//if you want to make uploads file secure
//router.use(sessionChecker,express.static('uploads'))
module.exports = router;