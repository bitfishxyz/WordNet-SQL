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
    // frisch n 3 1 @ 3 0 10983172 10983007 10982870
    let inputArray = input.trimRight().split(' ')
    let word = inputArray[0];
    let class_ = inputArray[1];
    let count = Number(inputArray[2]);
    let means_index = inputArray.slice(
        inputArray.length - count,inputArray.length).join(' ')
    
    // some word may have ', conflict with SQL and useless
    if(word.indexOf("'") > -1) return null
    // 这个不严谨、、、
    // return console.log(inputArray)
    // return console.log(word, class_, means_index)

    let sql = `INSERT INTO word_index(word, class, means_index) 
               VALUES ('${word}', '${class_}', '${means_index}');`
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

let createTable = `CREATE TABLE IF NOT EXISTS word_index (
  word VARCHAR(300) NOT NULL,
  class CHAR(1) NOT NULL,
  means_index VARCHAR(3000) NOT NULL,
  UNIQUE KEY (word, class));`;

connection.query(createTable, function(error, results, fields){
  if (error) throw error;

  readWordToIndexTable('../dict/index.noun', conf);
  readWordToIndexTable('../dict/index.adj', conf);
  readWordToIndexTable('../dict/index.adv', conf);
  readWordToIndexTable('../dict/index.verb', conf);

  connection.end();
})