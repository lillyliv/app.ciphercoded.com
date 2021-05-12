const WebSocket = require('ws');
const fs = require("fs");
const msgServerTools = require("./msgServerTools");
const dbTools = require("./dbTools");
const powVerify = require("./powVerifier");
//const { waitForDebugger } = require('node:inspector');
console.log(msgServerTools.createServer("test"));
/*
const CryptoJS = require("crypto-js");
const AES = require("crypto-js/aes");
const SHA256 = require("crypto-js/sha256");
const crypto = require('crypto');
const { SHA512 } = require('crypto-js');

/*
server response codes

47 : closed for missing 3 heartbeats in a row
*/



function makeString(length) {
    var result = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
   }
   return result.join('');
}


const wss = new WebSocket.Server({ port: 8080 });


/*

encryption stuff

*/
/*
const ENC_KEY = "bf3c199c2470cb477d907b1e0917c17b"; 
const IV = makeString(16);

const phrase = "text";

let encrypt = ((val) => {
  let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(val, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
});

let decrypt = ((encrypted) => {
  let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  return (decrypted + decipher.final('utf8'));
});

var encrypted = encrypt(phrase);
var decrypted = decrypt(encrypted);

console.log(encrypted);
console.log(decrypted);

*/
/*

actual backend start

*/

var sockets = [];
var tempSockets = [];
var sereverData;


var database = JSON.parse(dbTools.readDb());
//var database = {};
/*
function readDb() {
    fs.readFile("serverdb.json", 'utf8', function(err, data){
        database = JSON.parse(data);
    });
}
*//*
function writeDb(key, Jdata) {
    var tempDbData;

    fs.readFile("serverdb.json", 'utf8', function(err, data){
        tempDbData = JSON.parse(data);
        tempDbData[key] = Jdata;
        fs.writeFile("serverdb.json", JSON.stringify(tempDbData), function (err) {
        });
    });
}
function writeDbObj() {
    //console.log(database)
    fs.writeFile("serverdb.json", JSON.stringify(database), function (err) {
    });
}
*/
/*
var database = {
    server: {
        test: {
                channels: [{
                    name: "test1",
                    msgs: []
                },  
                {
                    name: "test2",
                    msgs: []
            }]
        }
    },
    account: {

    }
};
*/
function dcUser(token) {
    console.log("disconnecting user" + token.substring(0, 1000))
    var tempDcSockets = [];
    for(var i = 0; i < sockets.length; i++) {
        try{
            if(sockets[i].token == token) {
                sockets[i].ws.close(47, "missed 3 heartbeats in a row");
            } else {
                tempDcSockets.push(sockets[i]);
            }
        } catch {
            console.log("error disconnecting user" + token.substring(0, 1000))
        }
    }
    sockets = tempDcSockets;
}
function main () {
    /*
    var keyString = makeString(20);
    var key = SHA256(key)
    console.log("key : " + key);
    console.log("keyhash : " + keyHash);
    */
    for (var i = 0; i < tempSockets.length; i++) {
        sockets.push(tempSockets[i]);
    }
    tempSockets = [];
    //console.log(sockets);
    for(var i = 0; i < sockets.length; i++) {
            if(sockets[i].heartbeatsMissed >= 3) {
                dcUser(sockets[i].token);
            }
            if(sockets[i].heartbeatResponded == false) {
                sockets[i].heartbeatsMissed += 1;
            }
            sockets[i].ws.send(JSON.stringify({
                type: "heartbeat"
            }));
            sockets[i].heartbeatResponded = false;
    }
}
function sendMsgsToClients() {

}

function sendWsMsg (token, msg) {
    try {
        console.log("attempting to send ws msg to " +token.substring(0, 1000));
    } catch {
        console.error("error lol");
    }
    for(var i = 0; i < sockets.length; i++){
        if (sockets[i].token == token) {
            sockets[i].ws.send(msg);
        }
    }
}

function checkWsMsg (msg) {
    //msg = JSON.parse(msg);
    //console.log(msg);
    if (msg.type == "heartbeat-response") {
        console.log("heartbeat response");
        for(var i = 0; i < sockets.length; i++) {
            if(sockets[i].token == msg.token) {
                sockets[i].heartbeatsMissed = 0;
                sockets[i].heartbeatResponded = true;
            }
        }
    } else if (msg.type == "msg") {
        for(i = 0; i < database.server.test.channels.length; i++) {
            if(database.server[msg.server].channels[i].name == msg.channel) {
                database.server[msg.server].channels[i].msgs.unshift(msg.msg);
            }
        }
        console.log(database.server.test);
    } else if (msg.type == "fetch-servers") {
        /*var server = msg.server;
        var serverData = database.server[server];
        console.log(database.server[server]);
        sendWsMsg(msg.token, JSON.stringify({
            type: "channels",
            data: serverData,
            time: Date.now
        }));*/
    } else if (msg.type == "fetch-channels") {
        var server = msg.server;
        var serverData = database.server[server];
        console.log(database.server[server]);
        sendWsMsg(msg.token, JSON.stringify({
            type: "channels",
            data: serverData,
            time: Date.now
        }));
        //console.log(database.server.test)
    } else if (msg.type == "signup") {
        if(typeof database.account[msg.token] !== 'undefined'){
            database.account[msg.token] = {
                username: msg.username,
                token: msg.token,
                time: msg.time
            }
            //sendWsMsg(msg.token, 200);
        } else {
            //sendWsMsg(msg.token, 400);
        }
    } else if (msg.type == "create-server") {
        database.server[msg.name] = msgServerTools.createServer(msg.token, msg.name);
    }
}

wss.on('connection', (ws, req) => {
    ws.on('message', message => {
        console.log(`Received message => ${message}`);
        message = JSON.parse(message);
        if(message.type == "open-connection") {
            //console.log("open-connection packet recived");
            if(powVerify.verify(message)) {
                tempSockets.push({
                    ws:ws,
                    token: message.token,
                    username: message.username,
                    heartbeatsMissed: 0,
                    heartbeatResponded: false
                });
            }
        } else {
            //console.log(message.type.substring(0, 1000))
        }
        checkWsMsg(message);
    });
});
function wDb(){
    dbTools.writeDbObj(database);
}
setInterval(main, 1000);
setInterval(wDb, 1000);
//setInterval(readDb, 1000);
