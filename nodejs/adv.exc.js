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
adv_exc(comparative varchar(30) NOT NULL, 
        normal varchar(30) NOT NULL, 
        UNIQUE KEY (comparative, normal));`

connection.query(createTable, function(error, results, fields){
  if (error) throw error;

  const rs = fs.createReadStream('../dict/adv.exc')
  const rl = readline.createInterface({
    input: rs
  });

  rl.on('line', (input) => {
    let comparative = input.split(' ')[0];
    let normal = input.split(' ')[1];
    if (!normal || !comparative) return null;

    let sql = `insert into adv_exc(comparative, normal) values ('${comparative}', '${normal}')`
    connection.query(sql, function (error, results, fields) {
      if (error) throw error;
    });
  });
  
  rl.on('close', ()=>{
    console.log('Files were written to MySQL successfully!')
  
    // if you don't call this method, repl will not quit.
    connection.end();
  })
})