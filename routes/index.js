var express = require('express');
var router = express.Router();

const dbConnection = require('../dbconnection');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/todo', (req, res) => {
    console.log('hello');
  dbConnection.con()
    .then((connection) => {
      const query = 'select * from taskdetail';
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err);
        }
        else {
          console.log(result)
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
