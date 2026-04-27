const fs = require('fs');
const buffer = fs.readFileSync('e:\\website\\Wings-Fly-Public-Site\\Wings-Fly-Public-Site\\assets\\nsda-logo.png');
console.log(buffer.toString('hex').substring(0, 50));
