function createServer(owner, name) {
    return {owner:owner,channels:[{name:"test1",msgs:[]},{name:"test2",msgs:[]}]};
}

module.exports = {
    createServer
}
