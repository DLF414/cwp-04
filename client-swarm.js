let { exec } = require('child_process');

let num = process.argv[2];

for (let i = 0; i < num; i++)
{
    exec('node client-files.js "D:/dir"');
}