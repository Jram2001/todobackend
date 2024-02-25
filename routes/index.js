var express = require('express');
var router = express.Router();
const app = express();
// const cors = require('cors');
// app.use( cors({
//     origin: 'http://localhost:4200'
// }));



// Your routes here
/* Connect to Database */
const dbConnection = require('../dbconnection');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Deliver Task Data to Frontend */
router.get('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  dbConnection.con()
    .then((connection) => {
      const query1 = `UPDATE taskdetails SET deleted = 1 WHERE id = ${id}`;
      connection.query(query1, (err, result1) => {
        if (err) {
          res.send('Error occurred while deleting taskdetails with id: ' + id);
        } else {
          res.send('Task with id ' + id + ' has been deleted');
        }
        connection.end(); // Ending connection inside callback
      });
    })
    .catch((err) => {
      console.log(err);
      res.send('Error occurred while connecting to the database.');
    });
});

router.get('/todo', (req, res) => {
  dbConnection.con()
    .then((connection) => {
      const query = 'select * from taskdetails';
      const query2 = 'select * from tagnames'
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err, "there is an error in query 1");
        }
        else {
          connection.query(query2, (err, result2) => {
            if (err) {
              console.log(err, "there is an error in query 2");
            }
            else {
              res.send({ 'taskDeatils': result, 'TagDetail': result2 })
            }
          })
        }
        connection.end()
      })
    })
    .catch((err) => {
      res.send('not connected to backend')
    })
});

module.exports = router;
