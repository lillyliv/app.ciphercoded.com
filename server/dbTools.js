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
module.exports = {
    writeDb, writeDbObj, readDb
}