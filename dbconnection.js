let mysql = require('mysql2')

function con() {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '1001',
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