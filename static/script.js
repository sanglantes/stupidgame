function getRandomInt(digits) {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomUsername() {
    const randomDigits = 4;
    return `user${getRandomInt(randomDigits)}`;
}

function setUsernameCookie(username) {
    document.cookie = `username=${username}`;
}

function getUsernameFromCookie() {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === 'username') {
            return value;
        }
    }
    return null;
}

let username = getUsernameFromCookie();
if (!username) {
    username = generateRandomUsername();
    setUsernameCookie(username);
}

const ws = new WebSocket("ws://localhost:5050", "protocolOne");

const sendButton = document.getElementById("send-button");
const messageTextArea = document.getElementById("message");
const chatContent = document.querySelector('.chat-content');
const chatBox = document.querySelector('.chat-box');
const changeUsernameButton = document.getElementById("change-username-button");
const newUsernameInput = document.getElementById("new-username");

messageTextArea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(messageTextArea.value);
    }
});

changeUsernameButton.addEventListener("click", () => {
    const newUsername = newUsernameInput.value.trim();
    if (newUsername !== "") {
        const oldUsername = username;
        setUsernameCookie(newUsername);
        username = newUsername;
        sendMessage(`(${oldUsername} is now called ${newUsername})`);
    }
    newUsernameInput.value = "";
});

ws.onopen = (event) => {
    ws.send(`${username} has joined`);
};

sendButton.addEventListener("click", () => {
    sendMessage(messageTextArea.value);
});


function sendMessage(message = "") {
    if (message.trim() !== "") {
        if (message.startsWith("/")) {
            handleLocalCommand(message);
        } else {
            ws.send(message);
        }
        messageTextArea.value = '';
    }
}

function handleLocalCommand(command) {
    if (command === "/clear") {
        chatContent.innerHTML = "";
    } else if (command === "/hide") {
        chatBox.style.display = "none";
    }
}

ws.onmessage = (event) => {
    let message = event.data;

    if (message.startsWith("(") && message.endsWith(")")) {
        // A name change message
        const nameChangeElement = document.createElement("p");
        nameChangeElement.classList.add("name-change");
        nameChangeElement.textContent = message;
        chatContent.appendChild(nameChangeElement);
    } else if (message.endsWith("has joined")) {
        const joinMessageElement = document.createElement("p");
        const usernameSpan = document.createElement("span");
        usernameSpan.classList.add("username");
        usernameSpan.textContent = message.split(" ")[0];
        joinMessageElement.appendChild(usernameSpan);
        joinMessageElement.innerHTML += message.substring(usernameSpan.textContent.length);
        chatContent.appendChild(joinMessageElement);
    } else {
        const newParagraph = document.createElement("p");
        newParagraph.innerHTML = `<span class="username">${username}:</span> <span class="message">${message}</span>`;
        chatContent.appendChild(newParagraph);
    }

    chatContent.scrollTop = chatContent.scrollHeight;
};

const hideBoxButton = document.getElementById("hide-box-button");
const unhideBoxButton = document.getElementById("unhide-box-button");

hideBoxButton.addEventListener("click", () => {
chatBox.style.display = "none";
hideBoxButton.style.display = "none";
unhideBoxButton.style.display = "block";
});

unhideBoxButton.addEventListener("click", () => {
chatBox.style.display = "flex"; // Weird bodge, but seems to work.
hideBoxButton.style.display = "inline-block";
unhideBoxButton.style.display = "none";
});

// Second WS client

const ws_serv = new WebSocket("ws://localhost:5051", "protocolOne");