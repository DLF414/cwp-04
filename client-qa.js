const net = require('net');
const fs = require('fs');
const port = 8124;

const client = new net.Socket();
let questions = [];
let ind = 0;

const dec = "DEC";
const ack = "ACK";
const qa = "QA";
const unknown = "UNKNOWN";
const dir = "Direct";
const client_name = "Client";
const server_name = "Server";

client.setEncoding('utf8');


client.connect(port, function() {
    fs.readFile("qa.json", (err, data) =>
    {
        if (err)
        {
            console.error("Error with JSON file");
        }
        else
            {
                questions = JSON.parse(data);
    questions = shuffle(questions);
    client.write(dec);
    console.log('Connected to the server');
}
});
});

client.on('data', function (data) {

    if (data === ack)
    {
        client.write(questions[0].question);
    }
    if (data === dec)
    {
        client.destroy();
        process.terminate();
    }
    if (data !== ack)
    {
        console.log("Question: " + questions[ind].question);
        console.log("Answer: " + data);
        console.log("Is right: " + (data === questions[ind].ans ? "Yes" : "No"));
        if (ind + 1 === questions.length)
        {
            console.log("Questions are over");
            client.destroy();
        }
        else
        {
            ++ind;
            client.write(questions[ind].question);
        }
    }
})

client.on('close', function() {
    console.log('Connection closed');
});

function shuffle(array)
{
    let size = array.length;
    while (size > 0)
    {
        let index = Math.floor(Math.random() * size);
        size--;
        let temp = array[size];
        array[size] = array[index];
        array[index] = temp;
    }
    return array;
}