const express=require('express');
const exphbs = require("express-handlebars");
const fileUpload=require('express-fileupload')
const path = require("path");
var bodyParser = require("body-parser");
const testFolder = "./uploads/";
const router=require('./router/router.js');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
app.use('/',router);
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Started at post : " + PORT));