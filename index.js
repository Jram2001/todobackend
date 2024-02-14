var express = require('express');
var router = express.Router();
const dbConnection = require('./dbConnection');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

app.get('/customer', (req, res) => {
  dbConnection.con()
    .then((connection) => {
      const query = 'select * from customer';
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err);
        }
        else {
          console.log(result, data)
        }
        connection.end()
      })
    })
    .catch((err) => {
      console.log(error)
      res.send('not connected')

    })

}
)

module.exports = router;
