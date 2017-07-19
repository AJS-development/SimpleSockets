var Server = require("../index.js")

var server = new Server({
    port: 8080
});

server.on("connection", (socket) => {


    console.log(socket.IP)


    socket.on("hello", function (dt) {
        console.log(dt)
        socket.emit("world", {
            msg: "hello again"
        })
    })
})
server.on("error", (e) => {
    console.log(e)
})
server.on("disconnect", (socket) => {

})
