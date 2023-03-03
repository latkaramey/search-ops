const express = require("express")
const ejs = require('ejs');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const app = express();

const args = process.argv.slice(3);

if (args.length < 3) {
  console.error('Usage: node app.js ACCESS_KEY_ID SECRET_ACCESS_KEY');
  process.exit(1);
}




const accessKeyId = args[0];
const secretAccessKey = args[1];
const region = args[2]

// Set up the Kendra client with credentials
const kendra = new AWS.Kendra({
  accessKeyId,
  secretAccessKey,
  region: region
});



app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3010;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.post('/search', (req, res) => {
  
  // Do something with the form data
  const query = req.body.searchText;
  console.log(`search request text:  ` + query);
  //res.redirect('/health_insurance_form_downloads.html');

  const params = {
    IndexId: '',
    QueryText: query
  };

  // Execute the search request
  kendra.query(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      res.status(500).send('Error searching Kendra');
    } else {
      // Convert the search results to HTML
      const awsResponse = data.ResultItems;
      const results = [];
      for (let i = 0; i < awsResponse.length; i++) {

        const response = awsResponse[i];
        console.log(response);
        const obj = { url: response.DocumentURI, title: decodeURIComponent(response.DocumentTitle.Text), description: decodeURIComponent(response.DocumentExcerpt.Text) }
        results.push(obj);
      }
       
      res.render('search-results', { query, results });
    }
  });

  


 
});
