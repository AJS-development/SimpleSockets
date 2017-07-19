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
    id: 0,
    name: "json",
    encoder: function (name, data, client, main, fastbuffers) {
        if (data === undefined) data = null;
        var stringified = JSON.stringify(data);

        var writer = new fastbuffers.writer(name.length + stringified.length + 3);

        writer.writeUInt8(0);

        writer.writeString8(name);

        writer.writeString8(stringified);

        return writer.toBuffer();
    },
    decoder: function (dt, client, main) {

        var name = dt.readString8();
        var data = JSON.parse(dt.readString8());

        return {
            name: name,
            data: data
        }
    }

}
