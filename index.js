// index.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var unix = require('unix-timestamp')
// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204
app.use(bodyParser.urlencoded({extends: false}));
app.use(bodyParser.json());
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.get("/api", (req, res, next) => {
  req.timestamp = unix.now()
  next();
},(req, res,next)=>{
  req.timestam = new Date().toUTCString();
  next();
},(req,res)=>{
  res.json({
    "unix": req.timestamp*1000,
    "utc": req.timestam
  })
});

app.get("/api/:number",(req, res) => {
  const { number }  = req.params;
  try{
    if (number >= 13){
      req.timestam = new Date(parseInt(number)).toUTCString();
      if(req.timestam == "Invalid Date"){
        res.json({error : "Invalid Date"})
      }
      res.json({
      "unix": parseInt(number),
      "utc": req.timestam
    })
    }else{
      req.timestamp = unix.fromDate(number)
      req.timestam = new Date(req.timestamp * 1000).toUTCString();
      if(req.timestam == "Invalid Date"){
        res.json({error : "Invalid Date"})
      }
      res.json({
        "unix": req.timestamp*1000,
        "utc": req.timestam
      })
    }
  }catch(err) {
    if( err == "Invalid Date" ){
      res.json({error : "Invalid Date"})
    }
  }  
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
