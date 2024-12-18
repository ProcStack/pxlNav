
const projectName = "pxlNav Examples";
var httpPort = 3000;

const args = process.argv.slice(2);


const express = require('express');
const app = express();

const path = require('path');
const http = require('http').Server(app);



//Setup folders
//app.use( express.static(path.join(__dirname, '/Build')) );

console.log("Booting pxlNav examples from `./examples`")
app.use( express.static(path.join(__dirname, '/examples')) );

app.get("/", function(req,res){
  res.redirect('/index.htm');
});


// -- -- --


//Setup http and https servers
http.listen(httpPort, function () {
	console.log(`${projectName} listening at localhost:${httpPort}`);
});
