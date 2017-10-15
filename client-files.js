const net = require('net');
const fs = require("fs");
const path = require("path");
const port = 8124;
const client = new net.Socket();
const directories = process.argv.slice(2);

let file = [];
let separator = "\t\v\t\r";

const files = "FILES";
const ack = "ACK";
const dec = "DEC";
const accept = "File received";

client.setEncoding('utf8');

client.connect(port, function () {
    client.write(dec);
    console.log('Connected to the server');
});

client.on('data', function (data) {
    if (data === ack) {
        directories.forEach((value) => {
            ReadFilesInDirectory(value);
    });
        sendFile();
    }
    if (data === dec) {
        console.log("DISCONNECT FROM SERVER BY DEC COMMAND");
        client.destroy();
    }
    if (data === accept && file.length !== 0) {
        sendFile();
    }
    if (file.length === 0) {
        client.end();
    }
});

client.on('close', function () {
    console.log('Connection closed');
});


function ReadFilesInDirectory(dirPath) {
    fs.readdirSync(dirPath).forEach((value) => {
        let filePath = path.normalize(dirPath + path.sep + value);
    if (fs.statSync(filePath).isFile()) {
        file.push(path.normalize(dirPath + path.sep + value));
    }
    else {
        ReadFilesInDirectory(filePath);
    }
})
}


function sendFile() {
    let filePath = file.pop();
    client.write(fs.readFileSync(filePath));
    client.write(separator + path.basename(filePath));
    client.write(separator + "FIN");
}