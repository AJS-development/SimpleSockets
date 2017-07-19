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
module.exports = {
    id: 1,
    name: "binary",
    encoder: function (name, data, client, main, fastbuffers) {

        var writer = new fastbuffers.writer(1 + name.length + data.length);

        writer.writeUInt8(1);

        writer.writeString8(name);


        for (var i = 0; i < data.length; ++i) writer.buffer[writer.index++] = data[i];

        return writer.toBuffer();
    },
    decoder: function (reader, client, main) {

        var name = reader.readString8();

        var data = reader.buffer.slice(reader.index);

        return {
            name: name,
            data: data
        }
    }
}
