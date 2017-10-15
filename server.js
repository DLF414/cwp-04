const path = require('path');
const net = require('net');
const fs = require('fs');
const crypto = require('crypto');
const port = 8124;

let clientModes = [];
let seed = 0;

let separator = "||";

const server = net.createServer((client) => {
    console.log("New client connected");

    client.on('data', ClientHandler);
    client.on('data', ClientRemoteDialog);

    function ClientHandler(data, error) {
        if (!error) {
            if (client.id === undefined && (data.toString() === "REMOTE")) {
                client.id = Date.now().toString() + seed++;
                clientModes[client.id] = data.toString();
                client.write("ACK");
            }
            if (client.id === undefined && data.toString() !== "REMOTE") {
                client.write("DEC");
            }
        }
        else {
            console.error("ClientHandler error : " + error);
        }
    }

    function ClientRemoteDialog(data, error) {
        if (!error) {
            if (clientModes[client.id] === "REMOTE" && data.toString() !== "REMOTE") {
                if (data.toString().startsWith("COPY")) {
                    let dataParts = data.toString().split(separator);
                    CreateCopy(dataParts[1], dataParts[2], client);
                }
                if (data.toString().startsWith("ENCODE")) {
                    let dataParts = data.toString().split(separator);
                    EncodeFile(dataParts[1], dataParts[2], dataParts[3], client);
                }
                if (data.toString().startsWith("DECODE")) {
                    let dataParts = data.toString().split(separator);
                    DecodeFile(dataParts[1], dataParts[2], dataParts[3], client);
                }
            }
        }
    }
    client.on('end', () => console.log(`Client ${client.id} disconnected`));

});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});

function CreateCopy(original, copy, client) {
    let rs = fs.createReadStream(original);
    let ws = fs.createWriteStream(copy);
    rs.pipe(ws);

    ws.on('finish', () => {
        client.write("COPY DONE");
    })
}
function EncodeFile(original, encoded, key, client) {
    let rs = fs.createReadStream(original);
    let ws = fs.createWriteStream(encoded);
    let cypher = crypto.createCipher("aes-256-ctr", key);
    rs.pipe(cypher).pipe(ws);

    ws.on('finish', () => {
        client.write("ENCODE DONE");
    })

}
function DecodeFile(original, decoded, key, client) {
    let rs = fs.createReadStream(original);
    let ws = fs.createWriteStream(decoded);
    let decypher = crypto.createDecipher("aes-256-ctr", key);
    rs.pipe(decypher).pipe(ws);

    ws.on('finish', () => {
        client.write("DECODE DONE");
    })
}