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
          res.send(result1);
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
      const query = 'SELECT taskdetails.id, taskdetails.TaskName, taskdetails.AsigneeName, taskdetails.Descriptions, taskdetails.Repetable, taskdetails.CreatedOn, taskdetails.deleted, GROUP_CONCAT(tagnames.TagId) AS TagIds, GROUP_CONCAT(tagnames.Tag) AS Tags FROM taskdetails LEFT JOIN tagnames ON taskdetails.id = tagnames.TaskId GROUP BY taskdetails.id, taskdetails.TaskName, taskdetails.AsigneeName, taskdetails.Descriptions, taskdetails.Repetable, taskdetails.CreatedOn, taskdetails.deleted';
      const query2 = 'select * from tagnames'
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err, "there is an error in query 1");
        }
        else {
              res.send(result)
        }
        connection.end()
      })
    })
    .catch((err) => {
      res.send('not connected to backend')
    })
});

module.exports = router;
