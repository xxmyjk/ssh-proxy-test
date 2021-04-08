// ssh -o ProxyCommand="/opt/bin/ncat --proxy-type http --proxy 192.168.1.101:32321 %h %p" root@10.42.1.171
// VLVYJOLo
const NC = require("netcat/client");
const SSH = require("ssh2");
const http = require("http");

function remote(nc) {
    let conn = new SSH.Client();

    return new Promise((resolve, reject) => {
        conn.on("ready", () => {
            console.log("Client :: ready");
            conn.shell((err, stream) => {
                err && reject(err);
                stream
                    .on("close", () => {
                        console.log("Stream :: close");
                        resolve(null);
                    })
                    .on("data", (data) => {
                        console.log("Output: ", data);
                        resolve(null);
                    });
            });
        }).connect({
            host: "10.42.1.171",
            port: "22",
            username: "root",
            password: "VLVYJOLo",
            sock: nc,
            debug: console.log,
        });
    });
}

function proxy() {
    return new Promise((resolve, reject) => {
        let nc = new NC();
        nc.addr("192.168.1.101").port(32321);
        nc.on("connect", () => {
            resolve(nc.stream());
        });

        nc.on("error", (err) => {
            reject(err);
        });
    }).catch((err) => {
        console.log(err);
    });
}

function main() {
    // let nc = new NC();
    // sock = nc.addr("192.168.1.101").port(32321).connect().stream();

    let p = new Promise((resolve, reject) => {
        const req = http.request({
            port: 32321,
            host: "192.168.1.101",
            method: "CONNECT",
            path: "10.42.1.171:22",
        });
        // req.end();
        req.on("connect", (res, socket, head) => {
            console.log(res.statusCode);

            resolve(socket);
        });
        req.end();
    });

    p.then((sock) => {
        let conn = new SSH.Client();
        conn.on("error", () => {
            console.log("error");
            console.log(arguments);
        })
            .on("end", () => {
                console.log("end");
            })
            .on("close", () => {
                console.log("close");
            })
            .on("ready", () => {
                console.log("Client :: ready");
                conn.shell((err, stream) => {
                    if (err) throw err;
                    stream
                        .on("close", () => {
                            console.log("Stream :: close");
                            conn.end();
                        })
                        .on("data", (data) => {
                            console.log("OUTPUT: " + data);
                        });
                    stream.end("ls -alh \n exit \n");
                });
            })
            .connect({
                host: "10.42.1.171",
                port: "22",
                username: "root",
                password: "VLVYJOLo",
                sock,
                debug: function (str) {
                    // console.log(str);
                },
            });
    });
}

main();
