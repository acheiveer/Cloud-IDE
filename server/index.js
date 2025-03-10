import os from "os";
import http from "http";
import express from "express";
import {Server as SocketServer} from "socket.io";
import pty from "node-pty";
var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.INIT_CWD,
    env: process.env
  });

const app = express();
const server = http.createServer(app);
const io = new SocketServer({
    cors: '*'
})

io.attach(server);

ptyProcess.onData((data) => {
    io.emit('terminal:data',data);
  });

io.on('connection',(socket)=>{
    console.log(`Socket Connected`, socket.id);

    socket.on('terminal:write',(data)=>{
        ptyProcess.write(data);
    })
})

server.listen(9000,()=>{
    console.log(`🐋Docker server is running on port ${9000}`);
})