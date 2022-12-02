const gameController = require("../controllers/game");
const express = require("express");

const gameRouter = express.Router();

gameRouter
    .post('/createGame', gameController.createGame)
    .post('/game/:gamePasscode', gameController.joinGame_post)          // join game to register in game room
    .get('/game/:gamePasscode', gameController.joinGame_get)            // join game to obtain game informations
    .get('/pollGame/:gamePasscode', gameController.pollGame)
    .post('/applyMove/:gamePasscode', gameController.applyMove)

module.exports = gameRouter;