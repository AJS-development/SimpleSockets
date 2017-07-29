"use strict";

/*
   Copyright 2017 Andrew S

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


module.exports = class Client {
    constructor(socket, main) {
        this.socket = socket;
        this.main = main;
        this.events = {};
        this.IPv6 = socket._socket.remoteAddress;

        var idx = this.IPv6.lastIndexOf(':');
        if (~idx && ~this.IPv6.indexOf('.'))
            this.IP = this.IPv6.slice(idx + 1);

        this.init();
    }
    init() {
        this.socket.on("message", (dt) => {
            this.message(dt);
        })
        this.socket.on('close', (a, b) => {
            this.fire("disconnect", a, b)
            this.main.fire("disconnect", this, a, b)
        })
        this.socket.on('error', (e) => {
            this.fire("error", e)
        })



    }
    message(dt) {


        var reader = new this.main.fastbuffers.reader(Buffer.from(dt));


        var encoding = reader.readUInt8();

        if (this.main.parserMap[encoding]) {

            try {
                var decoded = this.main.parserMap[encoding].decoder(reader, this, this.main)

                this.fire(decoded.name, decoded.data)
            } catch (e) {
                this.main.fire("error", e);
            }
        }
    }
    close(reason, desc) {
        this.socket.close(reason, desc);
    }
    disconnect(r, d) {
        this.socket.close(reason, desc);
    }
    drop(reason, desc) {
        this.socket.drop(reason, desc);
    }

    emit(name, dt) {
        this.send(name, "json", dt);
    }

    sendBinary(name, dt) {
        this.send(name, "binary", dt);
    }

    send(name, parserName, dt) {
        var encoded = this.main.parser[parserName].encoder(name, dt, this, this.main, this.main.fastbuffers);
        this.socket.send(encoded, {
            binary: true
        });
    }

    on(name, func) {
        this.events[name] = func;
    }

    fire(name, a, b, c, d) {
        if (this.events[name]) this.events[name](a, b, c, d)
    }
}
