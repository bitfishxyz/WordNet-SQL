const mysql = require('mysql');
const fs = require('fs');
const readline = require('readline');
const conf = require('./package.json').mysql;

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
    // format like this
    // 00006400 03 n 01 biont 0 001 @ 00004258 n 0000 | a discrete unit of living matter
    let inputArray = input.trimRight().split(' ')
    let word = inputArray[4];
    let class_ = inputArray[2];
    let means = escape(input.split(' | ')[1].trim())
    // 需要转义
    
    if(word.indexOf("'") > -1) return null;
    if(word.indexOf("_") > -1) return null;
    if(word.indexOf("-") > -1) return null;

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