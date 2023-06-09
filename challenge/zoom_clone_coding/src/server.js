import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (_,res) => res.redirect("/"));



const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms(){
  const {sockets: {
          adapter: {sids, rooms},
        },
      } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if(sids.get(key) === undefined){
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName){
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection",socket => {
  socket["nickname"] = "Anonymous";
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });
  // only one function is allowed at the end
  socket.on("enter_room", (nickName, roomName, done) => {
    socket.join(roomName);
    socket["nickname"] = nickName;
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => 
      socket.to(room).emit("bye", socket.nickname, countRoom(room))
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});




const handleListen = () => console.log(`Listening on http://localhost:3000`);

httpServer.listen(3000, handleListen);

// const wss = new WebSocket.Server({ server });

// const sockets = [];

// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anonymous";
//     console.log("Connected to the Browser");
//     socket.on("close", () => console.log("disconnected from the browser"));
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);
//         switch (message.type) {
//           case "new_message":
//             sockets.forEach((aSocket) =>
//               aSocket.send(`${socket.nickname}: ${message.payload}`)
//             );
//             break;
//           case "nickname":
//             socket["nickname"] = message.payload;
//             break;
//         }
//     });
// });
