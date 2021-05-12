const SHA256 = require("crypto-js/sha256");

function verify (req) {
    console.log("verifying pow...")
    var hash = String(SHA256(req.token + req.pow.nonce + req.pow.time));
    console.log("hash: " + hash)
    console.log(req.pow.time, Date.now())
    if((hash.indexOf("00000") != -1) && (req.pow.time < Date.now() && Date.now() - req.pow.time < 30000)) {
        console.log("pow verified!");
        return true;
    } else {
        console.log("fake pow detected")
        return false;
    }
}

module.exports ={
    verify
}