const mysql = require('mysql');
const fs = require('fs');
const readline = require('readline');
const conf = require('./package.json').mysql;

// receive path of sourceFile
// and we need database config to create connection with db 
function readWordToIndexTable(sourceFile, dbConf){
  const connection = mysql.createConnection({
    host     : dbConf.host,
    user     : dbConf.user,
    password : dbConf.password,
    database : dbConf.database
  });
  connection.connect();
  const rs = fs.createReadStream(sourceFile)
  const rl = readline.createInterface({
    input: rs
  });
  
  rl.on('line', (input) => {
    // format of each line like this
    // 00006400 03 n 01 biont 0 001 @ 00004258 n 0000 | a discrete unit of living matter
    
    let inputArray = input.trim().split(' ') // get fields array
    let word = inputArray[4];
    let class_ = inputArray[2];

    // the sentence may contain this symbol ", 
    // it conflict with SQL, we need excape it
    let means = escape(input.split(' | ')[1].trim())
    
    let isPureWord = /^[a-zA-Z]+$/
    if(!isPureWord.test(word)) return null;

    let sql = `INSERT INTO word(word, class, means) 
               VALUES ('${word}', '${class_}', '${means}');`
    connection.query(sql, function (error, results, fields) {
      if (error) {
        console.log(error)
      };
    });
  });
    
  rl.on('close', ()=>{
    console.log(`Files from ${sourceFile} were written to MySQL successfully!`)
    connection.end();
  })
}

const connection = mysql.createConnection({
  host     : conf.host,
  user     : conf.user,
  password : conf.password,
  database : conf.database
});
connection.connect();

// create table if it not exist,
// it will make our program more Stability
let createTable = `CREATE TABLE IF NOT EXISTS word (
  word VARCHAR(300) NOT NULL,
  class CHAR(1) NOT NULL,
  means VARCHAR(6000) NOT NULL);`;
connection.query(createTable, function(error, results, fields){
  if (error) throw error;

  readWordToIndexTable('../dict/data.noun', conf);
  readWordToIndexTable('../dict/data.adj', conf);
  readWordToIndexTable('../dict/data.adv', conf);
  readWordToIndexTable('../dict/data.verb', conf);

  connection.end();
})