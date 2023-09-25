const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const cors = require("cors");

app.use(cors({
    origin: 'https://chatapp-1fms.onrender.com/'
}));

const rooms = {};

io.on("connection", socket => { // when user connects to server, socket.io generates a socket
    socket.on("join-room", roomID => { // 'socket' event listener on 'join-room', pulling roomID
        if (rooms[roomID]) { // if room already exists in 'rooms'
            console.log("someone already in room")
            rooms[roomID].push(socket.id); // push socket.id to specified room at roomID
        } else {
            console.log("im first to roomID:", roomID)
            console.log("adding my socket:", socket.id);
            rooms[roomID] = [socket.id];
        }
        console.log(rooms);
        const otherUser = rooms[roomID].find(id => id !== socket.id); // get socket.id of user in room of roomID that is not current user's socket.id
        if (otherUser) {
            console.log("other user found!!!:", otherUser)
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
        console.log("user left")
    })
});

server.listen(8000, () => console.log('server is running on port 8000'));