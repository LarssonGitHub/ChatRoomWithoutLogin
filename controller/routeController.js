import {
    errHasSensitiveInfo
} from "./errorHandling.js"

import {
    getCollectionOfGallery,
    getChatPagination
} from "../models/chatModel.js"

import {
    checkIfUserAlreadyExist
} from "../controller/authentication.js";

import dotenv from 'dotenv';

dotenv.config();

const {
    SESSION_NAME,
} = process.env;

async function renderIndex(req, res, next) {
    console.log("render index")
    try {
        res.status(200).render('pages/index');
    } catch (err) {
        //console.log(err, "14");
        const errMessage = errHasSensitiveInfo(err);
        res.status(404).json({
            err: errMessage,
        })
    }
}

function renderLogin(req, res, next) {
    res.status(200).render('pages/login');
}

function renderNotFound(req, res, next) {
    console.log('404. Opps, someone tried to access a route which does not exist.');
    res.status(200).render('pages/notfound');
}

function logout(req, res, next) {
    req.session.destroy((err) => {
        if (err) {
            console.log(err, "from route controller");
            res.status(404).redirect("/")
            return
        }
        console.log('cookie destroyed');
        res.status(200).redirect("/user/login")
    });
}

async function submitLogin(req, res, next) {
    console.log("submit login")
    try {
        const isUsernameUsed = await checkIfUserAlreadyExist(req.body.userName);
        if (isUsernameUsed) {
            req.session.userHasAccess = true;
            req.session.userName = req.body.userName;
            res.status(200).json({
                redirectTo: '/',
                message: "user exist and is validated, logging in!"
            })
            return
        }
        throw "Sorry, user already exist. Pick another name";
    } catch (err) {
        //console.log(err, "16");
        const errMessage = errHasSensitiveInfo(err);
        res.status(404).json({
            err: errMessage,
        })
    }
}

async function fetchGallery(req, res, next) {
    try {
        const collectionExist = await getCollectionOfGallery();
        if (collectionExist || collectionExist.length > 0) {
            res.json({
                message: collectionExist
            });
            return;
        }
        throw "Something went wrong on our end when fetching for gallery";
    } catch (err) {
        //console.log(err, "17");
        const errMessage = errHasSensitiveInfo(err);
        res.status(404).json({
            err: errMessage,
        })
    }
}

async function fetchChatHistory(req, res) {
    try {
        const {
            startIndex
        } = req.params;
        const chatPagination = await getChatPagination(startIndex);
        //console.log("chat pagination", chatPagination);
        if (chatPagination || chatPagination.length > 0) {
            res.json({
                message: chatPagination
            });
            return;
        }
        throw "Something went wrong on our end when fetching for chats";
    } catch (err) {
        //console.log(err, "18");
        const errMessage = errHasSensitiveInfo(err);
        res.status(404).json({
            err: errMessage,
        })
    }
}

export {
    renderIndex,
    renderLogin,
    submitLogin,
    logout,
    fetchGallery,
    fetchChatHistory,
    renderNotFound
}