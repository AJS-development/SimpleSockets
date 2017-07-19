# SimpleSockets
Ever got tired of:


1. Handling websockets
2. Dealing with protocols
3. Socket.io's inflexibility
4. Sluggish Performance


Simple Sockets solves all your problems! It is very simple, very customisable, easy, and fast.

## Usage:

Server:


> npm install simplesockets


Browser:

> browser/SimpleSockets.js

> <script src=""></script>

## Setup

Server

```js
const SimpleSockets = require("simplesockets");

var options = { // websocket options
    port: 8080
}

var server = new SimpleSockets(options)

server.on("connection",function(client) {

console.log(`Client (IP: ${client.IP}) connected!`)

client.emit("hello","world");

client.on("hi",function(m) {

client.close(0,"bye")

})
});

```

Client

```js

var socket = new SimpleSocket("ws://localhost:8080");

socket.on("connection",function() {

console.log("Connected!");
})

socket.on("hello",function(a) {
console.log(a) // world

socket.emit("hi");
})

socket.on("disconnect",function(code,reason) {
console.log(reason) // bye
})
```