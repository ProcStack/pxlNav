
const projectName = "pxlNav Examples";
let listenIP = 'localhost';
listenIP = '192.168.1.3'; // For testing on local network
var httpPort = 3000;

const args = process.argv.slice(2);

const express = require('express');
const app = express();

const path = require('path');
const http = require('http').createServer(app);



//Setup folders --
let indexFile = "index.htm";
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

// Direct 'dist/pxlAssets' to './dist/pxlAssets' --
app.use('/dist/pxlAssets', express.static(path.join(__dirname, 'dist/pxlAssets')));

app.use(function(req, res, next) {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

app.get("/", function(req,res){
  res.redirect( "/" + indexFile );
});


// Handle 404 errors; no single-page fragment app yet,
//   So the 404 page only reroutes to index.htm
app.use(function(req, res, next) {
  //res.status(404).sendFile(path.join(__dirname, publicDir, '404.html'));

  // Since no 404 page exists, reroute to index.htm
  // Only redirect HTML page requests, not asset requests (.js, .css, .png, etc.)
  if (req.accepts('html') && !req.path.includes('.')) {
    res.redirect( "/" + indexFile );
  } else {
    // For asset requests, return proper 404
    res.status(404).send('File not found');
  }
});

// -- -- --


//Setup http and https servers
http.listen(httpPort, listenIP, function () {
	//console.log(`${projectName} listening at localhost:${httpPort}`);
	console.log(`${projectName} listening at ${listenIP}:${httpPort}`);
});