import express from 'express';

import {
    checkUserAccess,
} from "../middleware/accession.js";


import {
    renderIndex,
    renderLogin,
    submitLogin,
    logout,
    fetchGallery,
    fetchChatHistory,
    renderNotFound
} from "../controller/routeController.js"

const router = express.Router();

router.get("/", checkUserAccess, renderIndex);

router.get('/user/logout/', checkUserAccess, logout);

router.get("/user/login/", renderLogin);

router.post("/user/login/", submitLogin);

router.get("/api/gallery", fetchGallery);

router.get("/api/chatHistory/:startIndex", fetchChatHistory);

router.get('/*', renderNotFound);
router.post('/*', renderNotFound);
router.put('/*', renderNotFound);
router.delete('/*', renderNotFound);


export {
    router,
}