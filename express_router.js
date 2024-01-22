import express from "express";
import roomController from "./DB/controllers/room.js";
import wordController from "./DB/controllers/word.js";

const router = express.Router();

router.get('/api/', (req, res) => { res.send('hello world'); });

router.post('/api/createroom', roomController.createRoom);

router.post('/api/joinroom', roomController.joinRoom);

router.post('/api/addword', wordController.addWord);

router.post('/api/randomwords', wordController.randomWords);

export default router;
