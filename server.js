const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://chatapp-1fms.onrender.com",
    }
});

app.use(cors());


const rooms = {};
const socketToRoom = {}

io.on("connection", socket => { // when user connects to server, socket.io generates a socket
    socket.on("join-room", roomID => { // 'socket' event listener on 'join-room', pulling roomID
        if (rooms[roomID]) { // if room already exists in 'rooms'
            console.log("someone already in room")
            rooms[roomID].push(socket.id); // push socket.id to specified room at roomID
            socketToRoom[socket.id] = roomID
        } else {
            console.log("im first to roomID:", roomID)
            console.log("adding my socket:", socket.id);
            rooms[roomID] = [socket.id];
            socketToRoom[socket.id] = roomID
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
        console.log("user left", socket.id);
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

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
})

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT }`)
});