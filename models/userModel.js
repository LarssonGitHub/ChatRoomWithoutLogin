import {
    Users,
} from "./usersSchema.js"

async function resetDatabaseStatus() {
    try {
        const updateUsers = await Users.deleteMany({})
        return updateUsers;
    } catch (err) {
        //console.log(err, "22");
        return Promise.reject(err);
    }
}

async function getAllUsers() {
    try {
        const arrayOfAllUsers = await Users.find({});
        return arrayOfAllUsers;
    } catch (err) {
        //console.log(err, "23");
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
        });
        return await Users.create(newUser);
    } catch (err) {
        //console.log(err, "25");
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
        //console.log(err, "26");
        return Promise.reject(err);
    }
}

async function getUser(wsID) {
    try {
        const user = await await Users.findById(wsID).lean();
        if (!user) {
            throw "couldn't find user..";
        }
        return user;
    } catch (err) {
        //console.log(err, "27");
        return Promise.reject(err);
    }
}

async function setIdAndStatusForWebsocket(userId) {
    try {
        const user = await Users.findByIdAndUpdate(userId, {
            userStatus: "online",
        }, {
            new: true
        }).lean();
        if (!user) {
            throw "Something went wrong";
        }
        return  console.log(user.userName ? `Added ${user.userName} to database` : `${user.userName} couldn't be added!`)
    } catch (err) {
        //console.log(err, "28");
        return Promise.reject("userDidntUpdate");
    }
}

async function removeIdAndStatusForWebsocket(wsId) {
    // todo hehehrhrhehrheerh
    try {
        const user = await getUser(wsId);
        if (!user || Object.keys(user).length === 0) {
            throw "something went wrong when searching for user id, can't delete user!";
        }
        const deleteUser = await Users.findByIdAndDelete(user._id).lean();
        if (deleteUser === null) {
            throw "update user is undefined or null";
        }
        return console.log(user.userName ? `Deleted ${user.userName} from database` : `${user.userName} couldn't be deleted!`)
    } catch (err) {
        //console.log(err, "29");
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
        //console.log(err, "30");
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