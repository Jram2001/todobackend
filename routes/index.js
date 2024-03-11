var express = require('express');
var router = express.Router();
const app = express();
const bcrypt = require('bcrypt');

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

router.post('/create', (req, res) => {
  dbConnection.con()
    .then((connection) => {
      const TaskDetail = req.body[0];
      const TagDetails = req.body[1];
      const CreateQuery = `INSERT INTO taskdetails (id,TaskName,AsigneeName,descriptions,Repetable,CreatedOn,deleted) values (${TaskDetail.id},'${TaskDetail.TaskName}','${TaskDetail.AsigneName}','${TaskDetail.Description}',${TaskDetail.Repetable},'${TaskDetail.CreatedOn}',0) `;
      connection.query(CreateQuery, (err, result) => {
        const id = TaskDetail.id;
        if (err) {
          console.log(err, "there is an error in query 1", TaskDetail.CreatedOn);
        }
        else {
          TagDetails.map(data => {
            const TagQuerry = `INSERT INTO tagnames (Tag,TaskId) values ('${data.Tag}',${id})`
            connection.query(TagQuerry, (err, result1) => {
              if (err) {
                console.log(err, "there is an error in query 1");
              }
              else {
                console.log('result1')
              }
            })
          })
          res.send(result)
        }
      })
      console.log(req.body);
    })
    .catch((err) => {
      res.send('not connected to backend')
    })
});

router.post('/update', (req, res) => {
    dbConnection.con()
    .then((connection) => {
      const TaskDetail = req.body[0];
      const TagDetails = req.body[1];
      const TagId = req.body[2];
      const CreateQuery = `UPDATE taskdetails SET TaskName = '${TaskDetail.TaskName}', AsigneeName = '${TaskDetail.AsigneName}', descriptions = '${TaskDetail.Description}', Repetable = ${TaskDetail.Repetable}, CreatedOn = '${TaskDetail.CreatedOn}' WHERE id = ${TaskDetail.id};`
      connection.query(CreateQuery, (err, result) => {
      const id = TaskDetail.id;
        if (err) {
          console.log(err, "there is an error in query 1", TaskDetail.CreatedOn);
        }
        else {
          TagDetails.map((data,index) => {
            const TagQuerry = `UPDATE tagnames SET Tag = '${data.Tag}' WHERE (TagId = ${TagId[index]})`
            connection.query(TagQuerry, (err, result1) => {
              if (err) {
                console.log(err, "there is an error in query 1");
              }
              else {
                console.log('result1')
              }
            })
          })
          res.send(result)
        }
      })

    })
})


router.post('/CreateUser', (req, res) => {
  dbConnection.con()
    .then((connection) => {
      const UserName = req.body.username;
      bcrypt.hash(req.body.password , Math.ceil( Math.random() * 10),(err, hash) => {
        const CreateQuery = `INSERT INTO userdetails (username,pass) values ('${UserName}','${hash}') `;
        connection.query(CreateQuery, (err, result) => {
        if (err) {
          console.log(err, "there is an error in query 1");
        }
        else {
          res.send(result)
        }
      })        
      });
    })
    .catch((err) => {
      res.send('not connected to backend')
    })
});

router.post('/CreateMyUser', (req, res) => {
  dbConnection.con()
    .then(async(connection) => {
      const UserName = req.body.UserName;
      const hash = await bcrypt.hash(req.body.Password , Math.ceil( Math.random() * 10));
      const CreateQuery = `INSERT INTO userdetails (username,pass) values ('${UserName}','${hash}') `;
      connection.query(CreateQuery, (err, result) => {
        if (err) {
          console.log(err, "there is an error in query 1");
        }
        else {
          res.send(result)
        }
      })        
    })
    .catch((err) => {
      res.send('not connected to backend')
    })
});

router.post('/validate', (req, res) => {
  dbConnection.con()
    .then((connection) => {
      const userDataQuery = 'SELECT * FROM userdetails';
      connection.query(userDataQuery, (err, result) => {
        if (err) {
          res.status(500).send('Error executing SQL query');
        } else {
          const UserData = result.find((data) => { return req.body.username == data.username });
          req.body.username , bcrypt.hash(req.body.pass , Math.ceil( Math.random() * 10) , (err, hash) => {
            console.log(hash)
          }) 
          if(UserData && bcrypt.compare(UserData.pass,UserData.pass)){
            res.send(result);
          }
          else{
            return res.status(401).json({ error: 'Username or password is incorrect'});
          }
            }
        connection.end(); // Release the database connection
      });
    })
    .catch((err) => {
      console.error('Error establishing database connection:', err);
      res.status(500).send('Error establishing database connection');
    });
});


module.exports = router;