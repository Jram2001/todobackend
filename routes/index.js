require('dotenv').config();
var express = require('express');
var router = express.Router();
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken') 
const bodyParser = require('body-parser');
const GenerativeModel = require('@google/generative-ai');
const generativeModel = new GenerativeModel.GoogleGenerativeAI(process.env.GeminiApi);

/* Connect to Database */
app.use(express.json())
const dbConnection = require('../dbconnection');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
app.use(bodyParser.json());

function verifyJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  try {
    const decoded = jwt.verify( token , process.env.ACCESS_TOKEN ); // Replace with your secret key
    req.user = decoded; // Store decoded user info in req.user
    res.send(req.body.user == decoded);
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
}

router.post('/generate-text', async (req, res) => {
  try {
    const Text  = req.body.TaskDescription;
    const Model = generativeModel.getGenerativeModel({model : "gemini-pro" })
    const Promt = `Your job is to categorize the give text which is from a todo list application in single word for a simple task tracking apllication "${Text}"`
    const result = await Model.generateContent(Promt);
    res.json({response : result.response.candidates[0].content.parts[0].text});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
})

/* Deliver Task Data to Frontend */
router.get('/delete/:id', (req, res) => {
  console.log('hello')
  const id = parseInt(req.params.id);
  dbConnection.con()
    .then((connection) => {
      const query1 = `UPDATE todo.taskdeatails SET Deleted = 1 WHERE id = ${id}`;
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
      res.send('Error occurred while connecting to the database.');
    });
});

router.post('/todo', (req, res) => {
  dbConnection.con()
    .then((connection) => {
        const query = `SELECT * FROM taskdeatails WHERE taskdeatails.UserID = '${req.body.userId}' AND taskdeatails.Deleted = 0`
//       const query = `SELECT taskdeatails.id, taskdeatails.TaskName, taskdeatails.AsigneeName, taskdeatails.Descriiption, taskdeatails.Repetable, taskdeatails.CreatedOn, taskdeatails.Deleted, GROUP_CONCAT(tagname.TagId) AS TagIds, GROUP_CONCAT(tagname.Tag) AS Tags FROM taskdeatails LEFT JOIN tagname ON taskdeatails.id = tagname.TaskId WHERE taskdeatails.UserID = '${req.body.userId}' AND taskdeatails.Deleted = 0
// GROUP BY taskdeatails.id, taskdeatails.TaskName, taskdeatails.AsigneeName, taskdeatails.Descriiption, taskdeatails.Repetable, taskdeatails.CreatedOn, taskdeatails.Deleted`;
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
  console.log('create data')
  dbConnection.con()
    .then((connection) => {
      const TaskDetail = req.body[0];
      const TagDetails = req.body[1];
      console.log(req.body,'lollllll')
      const CreateQuery = `INSERT INTO taskdeatails (TaskName, AsigneeName, Descriiption, Repetable, CreatedOn, deleted ,UserID ,Label) VALUES ('${TaskDetail.TaskName}', '${TaskDetail.AsigneName}', '${TaskDetail.Descriiption}', ${TaskDetail.Repetable}, '${TaskDetail.CreatedOn}', 0 , 26 ,'${TaskDetail.Label}' )`;
      connection.query(CreateQuery, (err, result) => {
        const id = TaskDetail.id;
        if (err) {
          console.log(err, " there is an error in query 1 " );
        }
        else {
          // TagDetails.map(data => {
          //   const TagQuerry = `INSERT INTO tagname (Tag,TaskId) values ('${data.Tag}',${id})`
          //   connection.query(TagQuerry, (err, result1) => {
          //     if (err) {
          //       console.log(err, "there is an error in query 1");
          //     }
          //     else {
          //       console.log('result1')
          //     }
          //   })
          // })
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
      const CreateQuery = `UPDATE taskdeatails SET TaskName = '${TaskDetail.TaskName}', AsigneeName = '${TaskDetail.AsigneName}', Descriiption = '${TaskDetail.Descriiption}', Repetable = ${TaskDetail.Repetable}, CreatedOn = '${TaskDetail.CreatedOn}' WHERE id = ${TaskDetail.id};`
      connection.query(CreateQuery, (err, result) => {
      const id = TaskDetail.id;
        if (err) {
          console.log(err, "there is an error in query 1", TaskDetail.CreatedOn);
        }
        else {
          // TagDetails.map((data,index) => {
          //   const TagQuerry = `UPDATE tagname SET Tag = '${data.Tag}' WHERE (TagId = ${TagId[index]})`
          //   connection.query(TagQuerry, (err, result1) => {
          //     if (err) {
          //       console.log(err, "there is an error in query 1");
          //     }
          //     else {
          //       console.log('result1')
          //     }
          //   })
          // })
          // res.send(result)
        }
      })

    })
})


router.post('/CreateUser', (req, res) => {
  dbConnection.con()
    .then((connection) => {
      const UserName = req.body.username;
      bcrypt.hash(req.body.password , Math.random() * 10 ,(err, hash) => {
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
      const hash = await bcrypt.hash(req.body.password , Math.random() * 10);
      const CreateQuery = `INSERT INTO userdetails (username,pass) values ('${UserName}','${hash}') `;
      connection.query(CreateQuery, (err, result) => {
        if (err) {
          console.log(err, "there is an error in query 1");
        }
        else {
          console.log(hash,UserName,req.body.password)
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
            const UserData = result.find((data) => { return req.body.UserName === data.username });
            if(UserData){
            bcrypt.hash(req.body.password , Math.random() * 10 , async (err, hash) => {
              UserData && bcrypt.compare( req.body.password , UserData.pass , (error,match) =>{
              console.log(error,match,'lol')
              if(match){
                const accessToken = jwt.sign(req.body.UserName,process.env.ACCESS_TOKEN );
                res.json({ accessToken : accessToken,user:req.body.UserName,userId:UserData.id });
              }
              else{
                res.status(401).json({ error: 'Username or password is incorrect'});
              }
            })
            }) 
          }
          else{
                res.status(401).json({ error: 'Username or password is incorrect'});
          }
            }
          connection.end(); // Release the database connection
        });
      })
      .catch((err) => {
        res.status(500).send('Error establishing database connection');
      });
  });

router.post('/ValidateToken',(req,res) =>{
  verifyJWT(req,res)
})
module.exports = router;