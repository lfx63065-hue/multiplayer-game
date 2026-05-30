const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
    console.log("玩家加入:", socket.id);

    players[socket.id] = {
        x: 100,
        y: 100,
        color: "red"
    };

    io.emit("playersUpdate", players);

    // 👉 接收移動
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
        }

        io.emit("playersUpdate", players);
    });

    socket.on("disconnect", () => {
        console.log("玩家離開:", socket.id);
        delete players[socket.id];
        io.emit("playersUpdate", players);
    });
});

server.listen(3000, () => {
    console.log("Server running");
});