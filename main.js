window.settings = {};

window.channelSendingMsgIn = "test1";
window.serverSendingMsgIn = "test";

console.log("test");
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
        hash = CryptoJS.SHA256(token + nonce + date).toString();
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
function changeChannel(channel) {
    window.channelSendingMsgIn = channel;
}

var prevServ = "";
function checkChannels() {
    if (prevServ != serverSendingMsgIn) {
        prevServ = serverSendingMsgIn;
        addedChannels = 0;
        window.socket.send(JSON.stringify({type:"fetch-channels", server:window.serverSendingMsgIn, token: localStorage.getItem("token")}));
        
    }
}

function addChannels(channels) {
    channels = channels.channels;
    console.log(channels);
    console.log("calling addChannels");
    for(i = 0; i < channels.length; i++) {
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
            console.log('clicked ' + name);
            changeChannel(name);
        };
        container.appendChild(channel);
    }
}

var sent = 0;
function handleWsPacket(packet) {
    var token = window.localStorage.getItem("token");
    if (packet.type == "heartbeat") {
        checkChannels();
        //console.log("heartbeat packet recived, sending response");
        window.socket.send(JSON.stringify({
            type: "heartbeat-response",
            token: token
        }));
    } else if (packet.type == "channels") {
        addChannels(packet.data);
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
            pow: pow(4)
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