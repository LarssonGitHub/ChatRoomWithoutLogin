import {
    Users,
} from "./usersSchema.js"

import {
    usersInTempMemory
} from "../controller/authentication.js"


async function resetDatabaseStatus() {
    try {
        const updateUsers = await Users.deleteMany({})
        return updateUsers;
    } catch (err) {
        console.log(err, "22");
        return Promise.reject(err);
    }
}

async function getAllUsers() {
    try {
        const arrayOfAllUsers = await Users.find({});
        return arrayOfAllUsers;
    } catch (err) {
        console.log(err, "23");
        return Promise.reject(err);
    }
}

async function resetDatabaseUsers() {
    try {
        await resetDatabaseStatus()
        console.log("All old users deleted!");
    } catch (err) {
        console.log(err, "24");
        console.log("Something Went wrong when resetting database!");
    }
}

async function addNewUser(userName) {
    try {
        const newUser = new Users({
            userName: userName,
            userStatus: "online",
            tempWebsocketId: false
        });
        return await newUser.save();
    } catch (err) {
        console.log(err, "25");
        return Promise.reject(err);
    }
}

async function checkForUser(userName, userPassword) {
    try {
        const userExist = await Users.findOne({
            userName: userName,
            userPassword: userPassword,
        });
        if (!userExist) {
            throw "Your password or username is incorrect";
        }
        return userExist;
    } catch (err) {
        console.log(err, "26");
        return Promise.reject(err);
    }
}

async function getUser(wsID) {
    try {
        const userObject = await Users.find({
            tempWebsocketId: wsID
        });
        if (userObject.length === 0) {
            throw "couldn't find user..";
        }
        return userObject;
    } catch (err) {
        console.log(err, "27");
        return Promise.reject(err);
    }
}

async function setIdAndStatusForWebsocket(wsID) {
    try {
        const userIdFromArray = usersInTempMemory[0];
        usersInTempMemory.shift();
        const updateUser = await Users.findByIdAndUpdate(userIdFromArray, {
            userStatus: "online",
            tempWebsocketId: wsID,
        }, {
            new: true
        });
        if (!updateUser) {
            throw "Something went wrong";
        }
        return updateUser;
    } catch (err) {
        console.log(err, "28");
        return Promise.reject("userDidntUpdate");
    }
}

async function removeIdAndStatusForWebsocket(wsId) {
    try {
        const currentUserObject = await getUser(wsId);
        if (!currentUserObject.length === 0 || !currentUserObject[0]._id) {
            throw "something went wrong when searching for user id!";
        }
        const deleteUser = await Users.findByIdAndDelete(currentUserObject[0]._id).lean();
        console.log(deleteUser)
        if (deleteUser === null) {
            throw "update user is undefined or null";
        }
        return deleteUser;
    } catch (err) {
        console.log(err, "29");
        return Promise.reject("One user wasn't correctly logged out so the list of users online may not bee accurate. However, the app should still work, so chat away!");
    }
}

async function getUsersOnline() {
    try {
        const arrayOfUsersOnline = await Users.find({
            userStatus: "online"
        });
        if (!arrayOfUsersOnline) {
            throw "couldn't get users online";
        }
        return arrayOfUsersOnline;
    } catch (err) {
        console.log(err, "30");
        return Promise.reject(err);
    }
}

export {
    resetDatabaseUsers,
    getAllUsers,
    addNewUser,
    checkForUser,
    getUser,
    setIdAndStatusForWebsocket,
    removeIdAndStatusForWebsocket,
    getUsersOnline
}