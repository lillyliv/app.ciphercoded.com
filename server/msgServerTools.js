function createServer() {
    try{
        return {server:{channels:[{name:"test1",msgs:[]},{name:"test2",msgs:[]}]}, name:name};
    } catch {
        return false;
    }
}

module.exports = {
    createServer
}