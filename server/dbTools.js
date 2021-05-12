const fs = require("fs");

function writeDb(key, Jdata) {
    var tempDbData;

    fs.readFileSync("serverdb.json", 'utf8', function(err, data){
        tempDbData = JSON.parse(data);
        tempDbData[key] = Jdata;
        fs.writeFile("serverdb.json", JSON.stringify(tempDbData), function (err) {
        });
    });
}
function writeDbObj(database) {
    //console.log(database)
    fs.writeFile("serverdb.json", JSON.stringify(database), function (err) {
    });
}
function readDb() {
    return fs.readFileSync("serverdb.json", 'utf8', function(err, data){
    });
    //return dataR;
}
function checkAccount(token) {
    var tempDb = JSON.parse(readDb());
    var tempDb = tempDb.accounts;
    var found = 0;
    for (i = 0; i < tempDb.length; i++) {
        if(tempDb.token == token) {
            found = i;
            break;
        }
    }
    return tempDb[found];
}
module.exports = {
    writeDb, writeDbObj, readDb, checkAccount
}