"use strict"
import WebSocket, {
    WebSocketServer
} from 'ws';
import session, {
    MemoryStore
} from 'express-session';
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import {
    v4 as uuidv4
} from 'uuid';

import {
    router
} from './routes/routes.js';

import {
    botWelcomeMsg,
    botErrorPrivateMsg,
    handleOutgoingDataToClient,
    botErrorPublicMsg,
    clientSize,
    clientList,
    botGoodbyeMsg
} from './controller/messageHandling.js';

import {
    validateTypeOfIncomingMsg
} from "./controller/messageValidations.js"

import {
    resetDatabaseUsers,
    removeIdAndStatusForWebsocket,
    setIdAndStatusForWebsocket
} from "./models/userModel.js";
import {
    Console
} from 'console';


// Safe measure if server crashes and restarts!
resetDatabaseUsers();

const app = express();
const server = http.createServer(app);

dotenv.config();
const {
    PORT,
    connectionStream,
} = process.env;

mongoose.connect(connectionStream, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connection to DB chat Successfully!');
}).catch(err => {
    console.log('Connection to DB Failed', err);
    console.log(err, "38");
    process.exit()
})

// const wss = new WebSocketServer({
//     server
// });

// https://github.com/websockets/ws/blob/master/examples/express-session-parse/index.js
// Create a no server, then call the verfication, then call a server on, then call the protcol to connect
const wss = new WebSocketServer({
    clientTracking: true,
    noServer: true
});

app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());
app.use(express.static("public"));
var sessionParser = session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
});
app.use(sessionParser);
app.use(router);
app.set('view engine', 'ejs');

server.on('upgrade', function (request, socket, head) {
    sessionParser(request, {}, () => {
        wss.handleUpgrade(request, socket, head, function (ws) {
            wss.emit('connection', ws, request);
        });
    });
});

wss.on('connection', async (ws, req) => {
    try {
        console.log(`Client connected from IP ${ws._socket.remoteAddress}`);
        ws.id = uuidv4();
        const addedUser = await setIdAndStatusForWebsocket(ws.id, req.session.user._id);
        console.log(addedUser.userName ? `Added ${addedUser.userName} to database` : `${addedUser.userName} couldn't be added!`)
        broadcast(await botWelcomeMsg(ws.id))
        broadcast(await clientSize())
        broadcast(await clientList(ws.id))
    } catch (err) {
        if (err === "userDidntUpdate") {
            ws.terminate("User has been terminated because there is a major error, and as to not break the server, user is removed", 500);
        }
        broadcast(await botErrorPublicMsg(err));
    }
    ws.on("close", async () => {
        try {
            broadcast(await botGoodbyeMsg(ws.id))
            const removedUser = await removeIdAndStatusForWebsocket(ws.id);
            console.log(removedUser.userName ? `Deleted ${removedUser.userName} from database` : `${removedUser.userName} couldn't be deleted!`)
            broadcast(await clientSize())
            broadcast(await clientList(ws.id))
        } catch (err) {
            console.log(err, "1");
            broadcast(await botErrorPublicMsg(err));
        }
    });
    ws.on("message", async (incomingData) => {
        try {
            const validatedData = await validateTypeOfIncomingMsg(incomingData);
            // Quick but not good way to difference between the client and everyone else.
            broadcastToSingleClient(await handleOutgoingDataToClient(validatedData, ws.id, true), ws.id);
            broadcastButExclude(await handleOutgoingDataToClient(validatedData, ws.id), ws.id);
        } catch (err) {
            console.log(err, "2");
            try {
                broadcastToSingleClient(await botErrorPrivateMsg(ws.id, err), ws.id);
            } catch (err) {
                console.log(err, "37");;
                ws.terminate("User has been terminated for reasons related to his postings, because a massive error has occurred", 500);
            }
        }
    })
});

function broadcastButExclude(data, specificUserId) {

    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            if (client.id !== specificUserId) {
                client.send(data);
            }
        }
    });
}

// Remove when heroku stops closing my websocket
// setInterval(() => {
//     wss.clients.forEach((client) => {
//         console.log("I clocked so that heroku will not kill the websocket")
//         client.send("clocked");
//     });
// }, 20000);

function broadcastToSingleClient(data, specificUserId) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            if (client.id === specificUserId) {
                client.send(data);
            }
        }
    });
}

// Problem with wss because it's its own server.. PROBLEM HERE!!!
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data)
        }
    })
}

server.listen(process.env.PORT || PORT, () => {
    console.log(`Server started on`, process.env.PORT);
});