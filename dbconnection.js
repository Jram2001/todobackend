let mysql = require('mysql2')

function con() {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'todo'
    });
    return new Promise((resolve, reject) => {
        connection.connect((err) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(connection)
            }
        })
    })

}

module.exports.con = con