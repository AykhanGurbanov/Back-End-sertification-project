require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const isUrl = require('is-url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/public', express.static(`${process.cwd()}/public`));

let urlDatabase = {};
let urlCounter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post('/api/shorturl', (req, res) =>{
  const originalUrl = req.body.url
  const shortUrl = urlCounter++; // Generate short URL as a number (incremented)
  urlDatabase[shortUrl] = originalUrl;
  if( isUrl(req.body.url)){
    res.json({
      "original_url": originalUrl,
      "short_url": shortUrl
    })
  }else{
    res.json({"error":"Invalid URL"})
  }
});

app.get('/api/shorturl/:number',(req, res) =>{
  const { number } = req.params
  const originalUrl = urlDatabase[number]
  if ( originalUrl ){
    return res.redirect(originalUrl)
  }else{
    res.json({"error":"Invalid URL"})
  }
})

/*
// API POST method
app.post('/name', (req, res) =>{
  res.json({
      name: req.body.first + " " + req.body.last
  });
});
*/

app.listen(port, function() {
  console.log(`Listening on port ${port} sucsessfully`);
});
