const mysql = require('mysql');
const fs = require('fs');
const readline = require('readline');

// You should rewrite this config will youself database information
const conf = require('./package.json').mysql;

// create a connection
const connection = mysql.createConnection({
  host     : conf.host,
  user     : conf.user,
  password : conf.password,
  database : conf.database
});
connection.connect();

// create a table if it not exists
let createTable = `CREATE TABLE if NOT EXISTS 
adj_exc(deformation varchar(30) NOT NULL, 
        normal varchar(30) NOT NULL, 
        UNIQUE KEY (deformation, normal));`

connection.query(createTable, function(error, results, fields){
  if (error) throw error;

  // read text file line by line
  const rs = fs.createReadStream('../dict/adj.exc')
  const rl = readline.createInterface({
    input: rs
  });

  rl.on('line', (input) => {
    // each line may looks like this: 
    // airiest airy

    let deformation = input.split(' ')[0]; // get deformation word
    let normal = input.split(' ')[1]; // get nornal world
    
    // checkout if it is pure word
    let isPureWord = /^[a-zA-Z]+$/

    // if one of them isn't, just return, so it will not insert into database
    if (!isPureWord.test(deformation) || !isPureWord.test(normal)) return null

    // insert to database
    let sql = `insert into adj_exc(deformation, normal) values ('${deformation}', '${normal}')`
    connection.query(sql, function (error, results, fields) {
      if (error){
        console.log(error)
      }
    });
  });
  
  rl.on('close', ()=>{
    // close connection, or repl will not quit.
    connection.end();
  })
})



