/*
i think theres a memory leak somwhere in here
*/

window.settings = {};

window.channelSendingMsgIn = "test1";
window.serverSendingMsgIn = "test";
window.msgs = [];
console.log("test");

var currentAvaliableChannels = ["h"];

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function pow(difficulty) {
    console.log("doing POW...");
    var date = Date.now();
    var token = window.localStorage.getItem("token")
    var hash = "";
    var zeros = "0";
    var nonce = 0;
    for (i = 0; i < difficulty; i++) {
        zeros += "0";
    }
    while(hash.indexOf(zeros) == -1) {
        nonce++;
        //console.log("not zeros");
        //hash = CryptoJS.SHA256(token + nonce + date).toString();
        hash = forge_sha256(token + nonce + date);
    }
    console.log("hash: " + hash);
    console.log("nonce: " + nonce);
    return {
        hash: hash,
        nonce: nonce,
        time: date
    }
}

function login(Signup) {
    var time = Date.now();

    var username = document.getElementById("username").innerText;
    var password = document.getElementById("password").innerText;

    console.log(username, password);

    if((username == undefined || username == null || username == "") || (password == undefined || password == null || password == "")) {
        alert("error logging in, cannot find username or password")
        return;
    }

    var hash = String(CryptoJS.SHA512(password));

    var loginDataToServer;

    if(Signup == true) {

        loginDataToServer = {
            type: "signup",
            username: username,
            token: hash,
            signup: Signup,
            time: time
        };
    } else {

        loginDataToServer = {
            type: "login",
            token: hash,
            signup: Signup,
            time: time
        };
        Signup = false;
    }

    window.localStorage.setItem("token", hash);
    window.localStorage.setItem("username", username);

    window.socket.send(JSON.stringify(loginDataToServer));
}
function changeServer(server) {
    removeChannels();
    currentAvaliableChannels = [];
    window.serverSendingMsgIn = server;
    checkChannels();
    //changeChannel(currentAvaliableChannels[0].name);
}
function fetchMsgs() {
    window.socket.send(JSON.stringify({type:"fetch-msgs",server:window.serverSendingMsgIn, channel:window.channelSendingMsgIn ,token:localStorage.getItem("token")}));
}
function addMsgs(msgs) {
    window.msgs = msgs;
    console.log(msgs);
}


var servers = []

function fetchServers() {
    var token = localStorage.getItem("token");
    window.socket.send(JSON.stringify({
        type: "fetch-servers",
        token: token,
        time: Date.now()
    }))
}
var changed = 0;
function checkServers() {
    if(changed == 0) {
        window.socket.send(JSON.stringify({type:"fetch-servers",token:localStorage.getItem("token")}));
        changed = 1;
    } else {
        var elem = document.getElementById(window.serverSendingMsgIn);
        elem.style = `
        background-color: #424242;
        margin-top:3px;
        margin-bottom:3px;
        padding:6px;
        border-radius: 5px;
        `;
        for(i = 0; i < document.getElementById("group-list").childNodes.length; i++) {
            if(document.getElementById("group-list").childNodes[i].id != window.serverSendingMsgIn){
            document.getElementById("group-list").childNodes[i].style = `
            background-color: #363636;
            margin-top:3px;
            margin-bottom:3px;
            padding:6px;
            border-radius: 5px;
            `;
            }
        }
    }
}

window.oldElem = "";
function addServers(data) {
    var servers = data;

    /*
        INSERT ADD SERVERS CODE HERE PLS
    */

    //console.log(servers);
    currentAvaliableChannels = [];
    console.log("calling addServers");
    for(i = 0; i < servers.length; i++) {
        //currentAvaliableChannels.push(channels[i]);
        var container = document.getElementById("group-list");
        var server = document.createElement("div");
        server.innerHTML = servers[i];
        server.style = `
        background-color: #363636;
        margin-top:3px;
        margin-bottom:3px;
        padding:6px;
        border-radius: 5px;
        `;
        server.id = servers[i];
        server.onclick = function () {
            var name = this.id;
            if(name != window.serverSendingMsgIn) {
                changeServer(name);
            }
            var elem = document.getElementById(name);
            if(window.oldElem != elem) {
                elem.style = `
                background-color: #424242;
                margin-top:3px;
                margin-bottom:3px;
                padding:6px;
                border-radius: 5px;
                `;
                try{
                    window.oldElem.style = `
                    background-color: #363636;
                    margin-top:3px;
                    margin-bottom:3px;
                    padding:6px;
                    border-radius: 5px;
                    `;
                } catch {
                    
                }
                window.oldElem = elem;
            }
        };
        //server.onmouseover="var name = this.id;name.style.cursor='pointer'"
        container.appendChild(server);
    }
    //changeChannel(currentAvaliableChannels[0].name);

}
var prevChannel = ""

function changeChannel(channel) {
    try {
    window.channelSendingMsgIn = channel;
    var channelElem = document.getElementById(channel);
    channelElem.style = `
    background-color: #424242;
    margin-top:3px;
    margin-bottom:3px;
    padding:6px;
    border-radius: 5px;
    `;
    } catch {
        console.warn("error changing channel style");
    }
    try {
        var prevChannelElem = document.getElementById(prevChannel);
        prevChannelElem.style = `
        background-color: #363636;
        margin-top:3px;
        margin-bottom:3px;
        padding:6px;
        border-radius: 5px;
        `;
    } catch {
        console.warn("cannot find channel, maybe switched server?");
    }
    prevChannel = channel;
}
function makeServer (name) {
    window.socket.send(JSON.stringify({
        type: "create-server",
        token: localStorage.getItem("token"),
        name: name
    }));
}
var prevServ = "";
function checkChannels() {
    if (prevServ != serverSendingMsgIn) {
        prevServ = serverSendingMsgIn;
        addedChannels = 0;
        window.socket.send(JSON.stringify({type:"fetch-channels", server:window.serverSendingMsgIn, token: localStorage.getItem("token")}));
    }
}
window.channels;
function addChannels(channels) {
    channels = channels.channels;
    window.channels = channels;
    console.log(channels);
    currentAvaliableChannels = [];
    console.log("calling addChannels");
    for(i = 0; i < channels.length; i++) {
        currentAvaliableChannels.push(channels[i]);
        var container = document.getElementById("channels");
        var channel = document.createElement("div");
        channel.innerHTML = channels[i].name;
        channel.style = `
        background-color: #363636;
        margin-top:3px;
        margin-bottom:3px;
        padding:6px;
        border-radius: 5px;
        `;
        channel.id = channels[i].name;
        channel.onclick = function () {
            var name = this.id;
            changeChannel(name);
            document.getElementById(name).style = `
            background-color: #424242;
            margin-top:3px;
            margin-bottom:3px;
            padding:6px;
            border-radius: 5px;
            `;
        };
        channel.onmouseover="var name = this.id;name.style.cursor='pointer'"
        container.appendChild(channel);
    }
    //changeChannel(currentAvaliableChannels[0].name);
}

function removeChannels() {
    var parent = document.getElementById("channels");
    removeAllChildNodes(parent);
}

var sent = 0;
function handleWsPacket(packet) {
    var token = window.localStorage.getItem("token");
    if (packet.type == "heartbeat") {
        checkChannels();
        checkServers();
        fetchMsgs();
        //console.log("heartbeat packet recived, sending response");
        window.socket.send(JSON.stringify({
            type: "heartbeat-response",
            token: token
        }));
    } else if (packet.type == "channels") {
        addChannels(packet.data);
    } else if (packet.type == "servers") {
        addServers(packet.data);
    } else if (packet.type == "msgs") {
        addMsgs(packet.data);
    }
}

/*
why did i even put this in a function
*/
function makews(server) {
    var token = window.localStorage.getItem("token");
    var username = window.localStorage.getItem("username");
    console.log("making websocket");

    if(server == undefined) {
        server = "ws://localhost:8080";
    }

    window.socket = new WebSocket(server);



    window.socket.onopen = function(e) {
        window.socket.send(JSON.stringify({
            type: "open-connection",
            token: token,
            username: username,
            pow: pow(5)
        }));
    };
      
    window.socket.onmessage = function(event) {
        //console.log(`[message] Data received from server: ` + event.data);
        handleWsPacket(JSON.parse(event.data));
    };
      
    window.socket.onclose = function(event) {
        console.log(`[close] Connection closed, code=` + event.code + ` reason=` + event.reason);
    };
      
    socket.onerror = function(error) {
        alert(`[WS error] ` + error.message);
    };
}


/*
adds keylistener to messagebox 
*/


function messageBox() {
    var token = window.localStorage.getItem("token");
    try {

        var msgBox = document.getElementById("msg-box-txt");

        msgBox.addEventListener("keydown", e => {
            var time = Date.now();

            var msg = msgBox.innerText;

            if(e.keyCode === 13 && e.shiftKey == false) {
                var msgToServer = {
                    type: "msg",
                    msg: msg,
                    token: token,
                    server: serverSendingMsgIn,
                    channel: window.channelSendingMsgIn,
                    time: time
                };
                window.socket.send(JSON.stringify(msgToServer));
                msgBox.innerText = "";
            } else if (e.keyCode === 13 && e.shiftKey == true) {
                window.msgBox.innerText += "\n";
            }
        });
    } catch {
        console.log("could not make message box, user probably not on a page with a message box")
    }
}


/*
Settings functions
*/


function loadSettings() {
    window.settings.lightMode = window.localStorage.getItem("lightMode");
    var stylesheet = document.getElementById("style");

    if (window.settings.lightMode == "true"){
        stylesheet.href = "light.css";
    } else {
        stylesheet.href = "main.css";
    }
}
function addSetting (key, data) {
    window.localStorage.setItem(key, data);
}


makews();
loadSettings();
messageBox();
