const mysql = require('mysql');
const fs = require('fs');
const readline = require('readline');
const conf = require('./package.json').mysql;

const connection = mysql.createConnection({
  host     : conf.host,
  user     : conf.user,
  password : conf.password,
  database : conf.database
});
connection.connect();

// create table if it not exists
let createTable = `CREATE TABLE if NOT EXISTS 
noun_exc(plural varchar(30) NOT NULL, 
         singular varchar(30) NOT NULL, 
         UNIQUE KEY (plural, singular));`

connection.query(createTable, function(error, results, fields){
  if (error) throw error;

  const rs = fs.createReadStream('../dict/noun.exc')
  const rl = readline.createInterface({
    input: rs
  });

  rl.on('line', (input) => {
    let plural = input.split(' ')[0];
    let singular = input.split(' ')[1];
    if (!singular || !plural) return null;
    if (singular.indexOf("'") > -1 || plural.indexOf("'") > -1) return null;

    let sql = `insert into noun_exc(plural, singular) values ('${plural}', '${singular}')`
    connection.query(sql, function (error, results, fields) {
      if (error) {
        console.log(error)
      };
    });
  });
  
  rl.on('close', ()=>{
    console.log('Files were written to MySQL successfully!')
  
    // if you don't call this method, repl will not quit.
    connection.end();
  })
})



