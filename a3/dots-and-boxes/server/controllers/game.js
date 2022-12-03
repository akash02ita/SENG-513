const { handleMove } = require("./gameUtility");
const { generateToken, generatePlayersZeroScore } = require("./playerUtility");

const games = {};
let id_counter = 1000;


/**
 * Create a game room
 * @param {*} req 
 * @param {*} res 
 * @returns Newly generated game state of the the created game room.
 */
exports.createGame = (req, res) => {
    console.log(`\tPOST createGame from user: ${req.body["username"]}`);

    // ensure required parameters exist
    /*
    if (!req.body["username"]) {
        return res.status(400).json({
            "status": "failed",
            "description": `invalid username ${req.body["username"]}`
        });
    }
    */
    if (!req.body["rows"]) {
        return res.status(400).json({
            "status": "failed",
            "description": `invalid rows ${req.body["rows"]}`
        });
    }
    if (!req.body["cols"]) {
        return res.status(400).json({
            "status": "failed",
            "description": `invalid cols ${req.body["cols"]}`
        });
    }
    if (!req.body["numPlayers"]) {
        return res.status(400).json({
            "status": "failed",
            "description": `invalid numPlayers ${req.body["numPlayers"]}`
        });
    }

    // validate number of rows/cols and players
    const rows = parseInt(req.body["rows"]);
    const cols = parseInt(req.body["cols"]);
    const numPlayers = parseInt(req.body["numPlayers"]);

    if (!(rows >= 0 && rows <= 10)) {
        return res.status(400).json({
            "status": "failed",
            "description": `invalid range rows ${req.body["rows"]}`
        });
    }

    if (!(cols >= 0 && cols <= 10)) {
        return res.status(400).json({
            "status": "failed",
            "description": `invalid range cols ${req.body["cols"]}`
        });
    }

    if (!(numPlayers >= 2 && numPlayers <= 7)) {
        return res.status(400).json({
            "status": "failed",
            "description": `invalid range numPlayers ${req.body["numPlayers"]}`
        });
    }

    // generate game room passcode and create new room in 'games' variable
    const key = id_counter;

    games[key] = {
        "shared": {
            "isLobbyFull": false,
            "rows": rows,
            "cols": cols,
            "numPlayers": numPlayers,
            // "users": [req.body["username"]],
            "users": [],
            "history": [{
                "clickedLines": {},
                "completedBoxes": {},
                "playersScore": generatePlayersZeroScore(req.body["numPlayers"]),
                "turn": 0
            }],
            "scores": [],
            "gamePasscode": id_counter,
        },
        "private": {
            "playersToken": [], // each player has their token as cookie
        }
    }

    id_counter++; // update counter for next create_game operation

    // return successful response and history to user
    return res.status(200).json({
        "status": "success",
        "shared": games[key]["shared"]
    })
}

/**
 * Join in the game and receive game state.
 * This is also to help user to join the same game room in case tab was closed and reopened.
 * @param {*} req 
 * @param {*} res 
 * @returns Current game state of desired game room.
 */
exports.joinGame_get = (req, res) => {
    console.log("GET joinGame");
    // cookies must exist: token verification (only existing players can enter or receive game updates)
    key = req.params["gamePasscode"];

    if (!(key in games)) {
        return res.status(400).json({
            "status": "failed",
            "description": `There is no game room with passcode ${key}`
        })
    }

    // verify there is token in cookies
    if (!req.cookies[key]) {
        return res.status(400).json({
            "status": "failed",
            "description": "Please enable cookies. Cookies are requires for player identification"
        })
    }

    if (!games[key]["private"]["playersToken"].includes(req.cookies[key])) {
        return res.status(400).json({
            "status": "failed",
            "description": "Invalid token. Only registered users in the game room are allowed."
        })
    }

    // const isLobbyFull = games[key]["shared"]["numPlayers"] == games[key]["shared"]["users"].length;
    const isLobbyFull = games[key]["shared"]["isLobbyFull"];
    console.log(`\tisLobbyFull: ${isLobbyFull}`);
    if (!isLobbyFull) {
        return res.status(200).json({
            "status": "success",
            "description": "still in lobby",
            "shared": games[key]["shared"]
        });
    }

    const token = req.cookies[key];
    const indexToken = games[key]["private"]["playersToken"].indexOf(token);
    const history = games[key]["shared"]["history"];
    const isMyTurn = indexToken === history[history.length - 1]["turn"];

    return res.status(200).json({
        "status": "success",
        "shared": games[key]["shared"],
        "isMyTurn": isMyTurn
    });
}

/**
 * Allows player to be registered in the game room.
 * This is to be called **exactly once** by a specific user.
 * @param {*} req parameter **username** and **cookies** are required.
 * @param {*} res 
 * @returns Status of whether user was successfully registered.
 */
exports.joinGame_post = (req, res) => {
    // ensure username exists
    if (!req.body["username"]) {
        return res.status(400).json({
            "status": "failed",
            "description": `invalid username ${req.body["username"]}`
        });
    }

    const key = req.params["gamePasscode"];

    console.log("POST joinGame");
    console.log(`\tgamePasscode: ${key}`);

    if (!(key in games)) {
        return res.status(400).json({
            "status": "failed",
            "description": `There is no game room with passcode ${key}`
        });
    }

    // check if lobby is full
    // const isLobbyFull = games[key]["shared"]["numPlayers"] === games[key]["shared"]["users"].length;
    const isLobbyFull = games[key]["shared"]["isLobbyFull"];
    // handle new users when lobby is not full
    if (isLobbyFull) {
        return res.status(200).json({
            "status": "failed",
            "description": "Game room lobby is full."
        });
    }

    console.log(`\tCookies[${key}] is ${req.cookies[key]}`);
    // console.log([req.cookies[key]]);
    // console.log(games[key]["private"]["playersToken"]);
    // console.log(req.cookies[key] in games[key]["private"]["playersToken"]); // bug-cause
    // console.log(games[key]["private"]["playersToken"].includes(req.cookies[key])); // bug-fixed
    if (req.cookies[key] && games[key]["private"]["playersToken"].includes(req.cookies[key])) {
        return res.status(200).json({
            "status": "failed",
            "description": "You already joined the lobby."
        })
    }


    // set cookies for user token of passcode
    const token = generateToken();
    // setting sameSite to none for CORS fix
    res.cookie(key, token, { sameSite: 'none', secure: true });

    // update game room as well
    games[key]["shared"]["users"].push(req.body["username"]);
    games[key]["private"]["playersToken"].push(token);
    // games[key]["shared"]["isLobbyFull"] = games[key]["shared"]["numPlayers"] === games[key]["shared"]["users"].length;
    // games[key]["shared"]["isLobbyFull"] = games[key]["shared"]["numPlayers"] == games[key]["shared"]["users"].length;
    games[key]["shared"]["isLobbyFull"] = parseInt(games[key]["shared"]["numPlayers"]) === games[key]["shared"]["users"].length;

    return res.status(200).json({
        "status": "success",
        "shared": games[key]["shared"]
    });


}

/**
 * Poll game status and know whether it is user's turn or not.
 * @param {*} req 
 * @param {*} res 
 * @returns Game state and if it's user's turn or not.
 */
exports.pollGame = (req, res) => {
    console.log("GET pollGame");
    // the process is to nothing other than return the game status

    // joinGame_get can be REUSED here for this specific purpose at the moment
    return this.joinGame_get(req, res);
}

/**
 * Allows user, who has his turn, to send the move he wishes to apply
 * @param {*} req 
 * @param {*} res 
 * @returns a status whether the move was successfully applied or not
 */
exports.applyMove = (req, res) => {
    console.log("POST applyMove");
    // note that users[i] corresponds to playersToken[i]: this is how verification will be done
    // turn = i
    // thus user applying the move must have the corresponding cookie token to playersToken[turn]
    // ^^this is first validation step

    // the next validation is to obviously ensure the user move to apply is valid on the current game state

    key = req.params["gamePasscode"];

    if (!(key in games)) {
        return res.status(400).json({
            "status": "failed",
            "description": `There is no game room with passcode ${key}`
        })
    }

    if (!req.body["points"]) {
        return res.status(400).json({
            "status": "failed",
            "description": `invalid points ${req.body["points"]}`
        });
    }
    if (req.body["points"].length !== 4) {
        return res.status(400).json({
            "status": "failed",
            "description": `invalid points ${req.body["points"]}. Exactly 4 points need to be passed`
        });
    }

    // verify lobby is full: only an ongoing game can have moves being applied
    const isLobbyFull = games[key]["shared"]["isLobbyFull"];
    if (!isLobbyFull) {
        return res.status(200).json({
            "status": "failed",
            "description": "lobby not full yet"
        });
    }

    // verify token match
    if (!req.cookies[key]) {
        return res.status(400).json({
            "status": "failed",
            "description": "Please enable cookies. Cookies are requires for player identification"
        })
    }

    if (!games[key]["private"]["playersToken"].includes(req.cookies[key])) {
        return res.status(400).json({
            "status": "failed",
            "description": "Invalid token. Only registered users in the game room are allowed."
        })
    }

    const token = req.cookies[key];
    const indexToken = games[key]["private"]["playersToken"].indexOf(token);
    const history = games[key]["shared"]["history"];
    const isPlayerTurn = indexToken === history[history.length - 1]["turn"];
    if (!isPlayerTurn) {
        return res.status(200).json({
            "status": "failed",
            "description": "It's not your turn yet."
        })
    }

    const [x1, y1, x2, y2] = req.body["points"];
    let return_code = "failed";
    const cGS = games[key]["shared"]; // (c)urrent (G)ame (S)hared
    return_code = handleMove(cGS, [x1, y1, x2, y2]);

    if (return_code === 'success') { // inform user if move success
        return res.status(200).json({
            "status": "success",
            "description": "move applied successfully"
        });
    }
    else { // inform user fail move
        return res.status(200).json({
            "status": "failed",
            "description": return_code
        });
    }

}
