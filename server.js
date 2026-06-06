const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};

// 金幣
let coin = {
    x: Math.random() * 560,
    y: Math.random() * 360
};

io.on("connection", (socket) => {
    console.log("玩家加入:", socket.id);

    // 建立玩家
    players[socket.id] = {
        x: 100,
        y: 100,
        color: "red",
        score: 0
    };

    // 傳送目前玩家資料
    io.emit("playersUpdate", players);

    // 傳送金幣資料
    socket.emit("coinUpdate", coin);

    // 接收移動
    socket.on("move", (data) => {

        if (players[socket.id]) {

            players[socket.id].x = data.x;
            players[socket.id].y = data.y;

            // ===== 碰撞檢查 =====

            const dx =
                players[socket.id].x - coin.x;

            const dy =
                players[socket.id].y - coin.y;

            const distance =
                Math.sqrt(dx * dx + dy * dy);

            if (distance < 20) {

                // 加分
                players[socket.id].score++;

                // 重生金幣
                coin.x = Math.random() * 560;
                coin.y = Math.random() * 360;

                io.emit("coinUpdate", coin);

                console.log(
                    socket.id,
                    "獲得1分"
                );
            }
        }

        io.emit("playersUpdate", players);
    });

    socket.on("disconnect", () => {

        console.log("玩家離開:", socket.id);

        delete players[socket.id];

        io.emit("playersUpdate", players);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(
        "Server running on port " + PORT
    );
});