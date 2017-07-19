"use strict";
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
*/

(function () {

    var FastBuffers = {
        reader: class Reader {
            constructor(buf) {
                this.index = 0;
                this.buffer = new DataView(buf);
            }
            readString8() {
                var data = "";
                while (this.index <= this.buffer.byteLength) {
                    var d = this.readUInt8();
                    if (!d) break;
                    data += String.fromCharCode(d);
                }
                return data;
            }
            readString16() {
                var data = "";
                while (this.index <= this.buffer.byteLength) {
                    var d = this.readUInt16BE();
                    if (!d) break;
                    data += String.fromCharCode(d);
                }
                return data;
            }
            readString32() {
                var data = "";
                while (this.index <= this.buffer.byteLength) {
                    var d = this.readUInt32BE();
                    if (!d) break;
                    data += String.fromCharCode(d);
                }
                return data;
            }
            readInt8() {
                return this.buffer.getInt8(this.index++);
            }
            readUInt8() {
                return this.buffer.getUint8(this.index++);
            }
            readInt16BE() {
                var data = this.buffer.getInt16(this.index);
                this.index += 2;
                return data;
            }
            readInt16LE() {
                var data = this.buffer.getInt16(this.index, true);
                this.index += 2;
                return data;
            }
            readUInt16BE() {
                var data = this.buffer.getUint16(this.index);
                this.index += 2;
                return data;
            }
            readUInt16LE() {
                var data = this.buffer.getUint16(this.index, true);
                this.index += 2;
                return data;
            }
            readInt32BE() {
                var data = this.buffer.getInt32(this.index);
                this.index += 4;
                return data;
            }
            readInt32LE() {
                var data = this.buffer.getInt32(this.index, true);
                this.index += 4;
                return data;
            }
            readUInt32BE() {
                var data = this.buffer.getUint32(this.index);
                this.index += 4;
                return data;
            }
            readUInt32LE() {
                var data = this.buffer.getUint32(this.index, true);
                this.index += 4;
                return data;
            }
        },
        writer: class Writer {
            constructor(size) {
                this.buf = new ArrayBuffer(size);
                this.buffer = new DataView(this.buf);
                this.index = 0;
            }
            writeString8(string) {
                for (var i = 0; i < string.length; i++) {
                    this.writeUInt8(string.charCodeAt(i))
                }
                this.writeUInt8(0)
            }
            writeString16(string) {
                for (var i = 0; i < string.length; i++) {
                    this.writeUInt16BE(string.charCodeAt(i))
                }
                this.writeUInt16BE(0)
            }
            writeString32(string) {
                for (var i = 0; i < string.length; i++) {
                    this.writeUInt32BE(string.charCodeAt(i))
                }
                this.writeUInt32BE(0)
            }
            writeInt8(n) {
                this.buffer.setInt8(this.index++, n)
            }
            writeInt16BE(n) {
                this.buffer.setInt16(this.index, n)
                this.index += 2;
            }
            writeInt16LE(n) {
                this.buffer.setInt16(this.index, n, true)
                this.index += 2;
            }
            writeInt32BE(n) {
                this.buffer.setInt32(this.index, n)
                this.index += 4;
            }
            writeInt32LE(n) {
                this.buffer.setInt32(this.index, n, true)
                this.index += 4;
            }
            writeUInt8(n) {
                this.buffer.setUint8(this.index++, n)
            }
            writeUInt16BE(n) {
                this.buffer.setUint16(this.index, n)
                this.index += 2;
            }
            writeUInt16LE(n) {
                this.buffer.setUint16(this.index, n, true)
                this.index += 2;
            }
            writeUInt32BE(n) {
                this.buffer.setUint32(this.index, n)
                this.index += 4;
            }
            writeUInt32LE(n) {
                this.buffer.setUint32(this.index, n, true)
                this.index += 4;
            }
            toBuffer() {
                return this.buf;
            }
        }
    }



    var Parsers = {
        json: {
            id: 0,
            name: "json",
            encoder: function (name, data, main) {
                if (data === undefined) data = null;
                var stringified = JSON.stringify(data);
                var writer = new FastBuffers.writer(name.length + stringified.length + 3);
                writer.writeUInt8(0);
                writer.writeString8(name);
                writer.writeString8(stringified);
                return writer.toBuffer();
            },
            decoder: function (dt, main) {
                var name = dt.readString8();
                var data = JSON.parse(dt.readString8());
                return {
                    name: name,
                    data: data
                }
            }
        },
        binary: {
            id: 1,
            name: "binary",
            encoder: function (name, data, main) {
                var writer = new FastBuffers.writer(1 + name.length + data.byteLength);
                var reader = new FastBuffers.reader(data)
                writer.writeUInt8(1);
                writer.writeString8(name);
                for (var i = 0; i < data.byteLength; ++i) writer.writeUInt8(reader.readUInt8());
                return writer.toBuffer();
            },
            decoder: function (reader, main) {
                var name = reader.readString8();
                var data = reader.buffer.slice(reader.index);
                return {
                    name: name,
                    data: data
                }
            }
        }
    }

    window.SimpleSocket = class SimpleSocket {
        constructor(connect, opt) {
            this.socket = new WebSocket(connect, opt);
            this.events = {};
            this.parser = {};
            this.parserMap = [];
            this.init();
        }
        init() {

            for (var i in Parsers) {
                var obj = Parsers[i];
                this.parser[obj.name] = obj;
                this.parserMap[obj.id] = obj;
            }

            this.socket.binaryType = "arraybuffer";

            this.socket.onmessage = (msg) => {
                this.onMessage(msg)
            }

            this.socket.onopen = () => {
                this.fire("connection")
            }
            this.socket.onclose = () => {
                this.fire("disconnect")
            }
            this.socket.onerror = (e) => {
                this.fire("error", e)
            }

        }
        close(a, b) {
            this.socket.close(a, b);
        }
        onMessage(msg) {

            var reader = new FastBuffers.reader(msg.data)

            var encoding = reader.readUInt8();
            if (this.parserMap[encoding]) {
                var a = this.parserMap[encoding].decoder(reader, this);
                this.fire(a.name, a.data)
            }
        }

        emit(name, dt) {
            this.send(name, "json", dt);
        }

        sendBinary(name, dt) {
            this.send(name, "binary", dt);
        }

        send(name, parserName, dt) {
            var encoded = this.parser[parserName].encoder(name, dt, this);
            this.socket.send(encoded);
        }

        on(name, func) {
            this.events[name] = func;
        }

        fire(name, a, b, c, d) {
            if (this.events[name]) this.events[name](a, b, c, d)
        }
    }




})();
