import {
    validateTypeOfOutgoingMsg,
    formatToChatObj,
    formatToStatusObj,
} from './messageValidations.js';

import {
    getUsersOnline,
    getUser
} from "../models/userModel.js"

import {
    errHasSensitiveInfo
} from "./errorHandling.js"

async function getUserName(wsId) {
    try {
        const userObj = await getUser(wsId);
        return userObj[0].userName;
    } catch (err) {
        //console.log(err, "4");
        return Promise.reject(err);
    }
}

// For the bot
async function botWelcomeMsg(wsId) {
    try {
        const userObj = await getUserName(wsId);
        const constructedMessage = formatToChatObj("botMsg", "Mr Announcer", `${userObj} has joined, say hi!`)
        const message = await validateTypeOfOutgoingMsg(constructedMessage);
        return message;
    } catch (err) {
        //console.log(err, "5");
        return Promise.reject(err);
    }
}

async function botGoodbyeMsg(wsId) {
    try {
        const userObj = await getUserName(wsId);
        const constructedMessage = formatToChatObj("botMsg", "Mr Announcer", `${userObj} has left the chat!`)
        const message = await validateTypeOfOutgoingMsg(constructedMessage)
        return message;
    } catch (err) {
        //console.log(err, "6");
        return Promise.reject(err);
    }
}

async function botErrorPrivateMsg(wsId, errorReason) {
    try {
        const removeSensitiveErrors = errHasSensitiveInfo(errorReason)
        const userObj = await getUserName(wsId);
        const constructedMessage = formatToChatObj("errorMsg", "Mr Error", `Your post wasn't approved ${userObj}! Reason: ${removeSensitiveErrors} (only you can see this!)`)
        const message = await validateTypeOfOutgoingMsg(constructedMessage)
        return message;
    } catch (err) {
        //console.log(err, "7");
        const constructedMessage = formatToChatObj("errorMsg", "Mr Error", `An error within an error.. Look at that! Reason: ${err}, (only you can see this)`)
        return JSON.stringify(constructedMessage)
    }
}


async function botErrorPublicMsg(errorReason) {
    try {
        const removeSensitiveErrors = errHasSensitiveInfo(errorReason)
        const constructedMessage = formatToChatObj("errorMsg", "Mr Error", `Oh hu... Something went wrong! Reason: ${removeSensitiveErrors}`)
        const message = await validateTypeOfOutgoingMsg(constructedMessage)
        return message;
    } catch (err) {
        //console.log(err, "8");
        const constructedMessage = formatToChatObj("errorMsg", "Mr Error", `An error within an error.. Look at that! Reason: ${err}`)
        return JSON.stringify(constructedMessage)
    }
}


// For the client

async function handleOutgoingDataToClient(validatedData, wsId, clientsOwnPost) {
    try {
        const {
            type,
            data,
            imgData,
            save
        } = validatedData;
        // Condition to change type so that it's easy for the client to tell its own post from others
        const userObj = await getUserName(wsId);
        const restructureChatObj = clientsOwnPost ? formatToChatObj("clientsPost", userObj, data, imgData, save) : formatToChatObj(type, userObj, data, imgData, save);
        return validateTypeOfOutgoingMsg(restructureChatObj);
    } catch (err) {
        //console.log(err, "9");
        return Promise.reject(err);
    }
}

// For statuses
function mapUsernames(arrayOfUsers) {
    return arrayOfUsers.map(user => user.userName);
}

async function clientList() {
    try {
        const arrayOfUsers = await getUsersOnline();
        const arrayOfUsernames = mapUsernames(arrayOfUsers)
        const constructedMessage = formatToStatusObj("status", "clientArray", arrayOfUsernames);
        const message = await validateTypeOfOutgoingMsg(constructedMessage)
        return message;
    } catch (err) {
        //console.log(err, "10");
        return Promise.reject(err);
    }
}

async function clientSize() {
    try {
        const arrayOfUsers = await getUsersOnline();
        const constructedMessage = formatToStatusObj("status", "clientInteger", arrayOfUsers.length);
        const message = await validateTypeOfOutgoingMsg(constructedMessage);
        return message;
    } catch (err) {
        //console.log(err, "11");
        return Promise.reject(err);
    }
}

export {
    botWelcomeMsg,
    botGoodbyeMsg,
    botErrorPrivateMsg,
    handleOutgoingDataToClient,
    clientSize,
    clientList,
    getUserName,
    botErrorPublicMsg,
}