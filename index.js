"use strict"

/*

   Copyright 2017 Andrew S

   Licensed under the Apache License, Version 2.0(the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http: //www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS"
   BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License
   for the specific language governing permissions and
   limitations under the License.

   Copyright 2017 LegitSoulja

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/

const uws = require("uws")

const Client = require("./client.js");

const JSONEncoder = require("./parsers/json.js");

const BinaryEncoder = require("./parsers/binary.js")

const FastBuffers = require("./FastBuffers.js")

module.exports = class SimpleSockets {
    constructor(options) {
        this.socket = new uws.Server(options);
        this.events = {};
        this.encoder = {
            json: JSONEncoder
        };

        this.encoderMap = [JSONEncoder, BinaryEncoder]


        this.fastbuffers = FastBuffers;
        this.open = true;
        this.init();
    }
    init() {
        this.socket.on('connection', (clientSocket) => {
            this.onConnection(clientSocket)
        })
    }
    close() {
        this.socket.shutDown();
        this.socket = null;
        this.open = false;
    }
    onConnection(clientSocket) {
        this.fire("connection", new Client(clientSocket, this))

    }
    on(name, func) {
        this.events[name] = func;
    }
    fire(name, a, b, c, d) {
        if (this.events[name]) this.events[name](a, b, c, d)
    }

    addEncoder(encoder) {


        this.encoder[encoder.name] = encoder;
        this.encoderMap[encoder.id] = encoder;
    }


}
