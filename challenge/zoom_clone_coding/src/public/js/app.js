const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector("form");
const room = document.getElementById("room");
room.hidden = true;

let roomName, nickName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

function handleNicknameChangeSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name_change input");
    addMessage(`$Your nickname(${nickName}) has changed to==> ${input.value}`);
    socket.emit("nickname", input.value);
    const span = room.querySelector("span");
    span.innerText = `My nickname: ${input.value}`;
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const span = room.querySelector("span");
    span.innerText = `My nickname: ${nickName}`;
    const msgForm = room.querySelector("#msg");
    const nameChangeForm = room.querySelector("#name_change");
    nameChangeForm.addEventListener("submit", handleNicknameChangeSubmit);
    msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event){
    event.preventDefault();
    // const input = form.querySelector('input');
    // socket.emit("enter_room", input.value, showRoom);
    // roomName = input.value;
    // input.value = "";
    const nickNameInput = form.querySelector("#nickname_input");
    const roomNameInput = form.querySelector("#roomname_input");

    nickName = nickNameInput.value;
    roomName = roomNameInput.value;

    socket.emit("enter_room", nickName, roomName, showRoom);
    nickNameInput.value = "";
    roomNameInput.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} has joined!`);
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} has left`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) =>{
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0){
        return;
    }
    rooms.forEach(room =>{
        const li = document.createElement("li");
        li.innerText = room;
        roomList.appendChild(li);
    });
});
// const messageList = document.querySelector("ul");
// const messageForm = document.querySelector("#message");
// const nickForm = document.querySelector("#nick");
// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload) {
//     const msg = { type, payload };
//     return JSON.stringify(msg);
// }

// socket.addEventListener("open", () => {
//     console.log("Connected to Server");
// });

// socket.addEventListener("message",(message) => {
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);
// });

// socket.addEventListener("close", () => {
//     console.log("Disconnected from Server");
// });

// // setTimeout(() => {
// //     socket.send("hello from the browser");
// // }, 3000);

// function handleSubmit(event) {
//     event.preventDefault();
//     const input = messageForm.querySelector("input");
//     socket.send(makeMessage("new_message", input.value));
//     input.value = "";
// }

// function handleNickSubmit(event) {
//     event.preventDefault();
//     const input = nickForm.querySelector("input");
//     socket.send(makeMessage("nickname", input.value));
//     input.value = "";
// }

// messageForm.addEventListener("submit", handleSubmit);
// nickForm.addEventListener("submit", handleNickSubmit);
