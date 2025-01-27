
const projectName = "pxlNav Examples";
var httpPort = 3000;

const args = process.argv.slice(2);


const express = require('express');
const app = express();

const path = require('path');
const http = require('http').Server(app);



//Setup folders --
let  = "index.htm";
if(args.length > 0 && args[0] == "examples"){
  console.log("Booting in 'Live' mode")
  console.log("Serving from: ./examples");
  app.use( express.static(path.join(__dirname, 'examples')) );
}else{
  indexFile = "indexDev.htm";
  console.log("Booting in 'Developer' mode");
  console.log("Serving from: ./src");
  app.use( express.static(path.join(__dirname, 'src')) );
}


app.get("/", function(req,res){
  res.redirect( "/" + indexFile );
});


// Handle 404 errors; no single-page fragment app yet,
//   So the 404 page only reroutes to index.htm
app.use(function(req, res, next) {
  //res.status(404).sendFile(path.join(__dirname, publicDir, '404.html'));
  // Since no 404 page exists, reroute to index.htm
  res.redirect( "/" + indexFile );
});

// -- -- --


//Setup http and https servers
http.listen(httpPort, function () {
	console.log(`${projectName} listening at localhost:${httpPort}`);
});
