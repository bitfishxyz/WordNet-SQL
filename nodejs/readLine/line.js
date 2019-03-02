const readline = require('readline')
const fs = require('fs')

let rl = readline.createInterface({
  input: fs.createReadStream('./txt')
})

rl.on('line', (input) => {
  console.log(input)
})

rl.on('close', () => {
  console.log('end read line')
})
