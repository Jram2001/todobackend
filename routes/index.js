var express = require('express');
var router = express.Router();
const app = express();
const cors = require('cors');
app.use(cors({
  origin: "http://localhost:4200",
}));

/* Connect to Database */
const dbConnection = require('../dbconnection');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Deliver Task Data to Frontend */ 
router.get('/todo', (req, res) => {
  dbConnection.con()
    .then((connection) => {
      const query = 'select * from taskdetail';
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err,"there is an error");
        }
        else {
          res.send(result)
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
