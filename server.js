/**
 * Node.js Signaling Server
 * Purpose:
 * - Enables sockets to discover other sockets via record
 */
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
    }
});

app.use(function(req, res, next) {
    const allowedOrigins = [`http://localhost:8001, ${process.env.CLIENT_URL}`];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-credentials", true);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, UPDATE");
    next();
})

const rooms = {};
const socketToRoom = {}

io.on("connection", socket => { // when user connects to server, socket.io generates a socket
    socket.on("join-room", roomID => { // 'socket' event listener on 'join-room', pulling roomID
        if (rooms[roomID]) { // if room already exists in 'rooms'
            rooms[roomID].push(socket.id); // push socket.id to specified room at roomID
            socketToRoom[socket.id] = roomID
        } else {
            rooms[roomID] = [socket.id];
            socketToRoom[socket.id] = roomID
        }
        console.log(rooms);
        const otherUser = rooms[roomID].find(id => id !== socket.id); // get socket.id of user in room of roomID that is not current user's socket.id
        if (otherUser) {
            socket.emit("other-user", otherUser); // emit to 'socket' with otherUser: socket.id
            socket.to(otherUser).emit("user-joined", socket.id); // emit to otherUser: socket.id, 'user-joined' with current user's socket.id
        }
    });

    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload); // send io event to the target(call recipient), emit "offer" with payload(caller info, offer, ...)
    });

    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload); // send io event to caller, emit "answer" with payload
    });

    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    })

    socket.on("disconnect", () => {
        const roomID = socketToRoom[socket.id];
        if (rooms[roomID]) {
            rooms[roomID] = rooms[roomID].filter(userID => userID !== socket.id);
            delete socketToRoom[socket.id];
            if (rooms[roomID].length == 0) {
                delete rooms[roomID];
            }
        }
    })
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT }`)
});