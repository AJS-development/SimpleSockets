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
        this.ip = socket._socket.remoteAddress;
        this.init();
    }
    init() {
        this.socket.on("message", (dt) => {
            this.message(dt);
        })
    }
    message(dt) {
        var data = dt.binaryData;

        var reader = new this.main.FastBuffers.reader(Buffer.from(data));


        var encoding = reader.readUInt8();

        if (this.main.encoderMap[encoding]) {

            try {
                var decoded = this.main.encoderMap[encoding].decoder(reader, this, this.main)

                this.fire(decoded.name, decoded.data)
            } catch (e) {
                this.main.fire("error", e);
            }
        }
    }
    close(reason, desc) {
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

    send(name, encoder, dt) {
        var encoded = this.main.encoder[encoder].encoder(name, dt, this, this.main, this.main.fastbuffers);
        this.socket.sendBytes(encoded);
    }

    on(name, func) {
        this.events[name] = func;
    }

    fire(name, a, b, c, d) {
        if (this.events[name]) this.events[name](a, b, c, d)
    }
}
