const net = require('net');
const fs = require("fs");
const path = require("path");
const port = 8124;
const client = new net.Socket();

let separator = "||";

client.setEncoding('utf8');

client.connect(port, function () {
    client.write("REMOTE");
    console.log('Connected to the server');
});


client.on('data', function (data) {
    if (data === "ACK") {
        client.write("COPY" + separator+"from.txt" + separator + "copyfile.txt");
    }
    if(data === "COPY DONE"){
        client.write("ENCODE"+separator+"from.txt"+separator+"enccopyfile.enc"+separator+"6");
    }
    if(data === "ENCODE DONE") {
        client.write("DECODE" + separator + "enccopyfile.enc" + separator + "deccopyfile.txt" + separator + "6");
    }
    if(data === "DECODE DONE"){
        client.end();
    }
    if (data === "DEC") {
        console.log("DISCONNECT FROM SERVER BY DEC COMMAND");
        client.destroy();
    }
});

client.on('close', function () {
    console.log('Connection closed');
});