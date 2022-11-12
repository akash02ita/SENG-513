// import React from 'react';

import { useState } from "react";

/*
    Idea:
    - show welcome message
    - prompt user for size of board
    - 
*/

function Landing(props) {

    const [rows, setRows] = useState(null);
    const [cols, setColumns] = useState(null);
    const [playerCount, setPlayerCount] = useState(null);

    const handleStartGame = () => {
        // ensure all fields are valid
        console.log("handleStartGame: see data input");
        console.log("rows: " + rows);
        console.log("cols: " + cols);
        console.log("playerCount: " + playerCount);
        // if not do not start game and put alert message
        const checkRows = rows ? rows : 4;
        const checkCols = cols ? cols : 4;
        const checkPlayerCount = playerCount ? playerCount : 3;

        if (checkRows < 2 || checkCols < 2) {
            alert("Invalid rows and/or columns value");
            return;
        }
        if (checkRows > 10 || checkCols > 10) {            
            alert("At most 10 rows and columns are allowed.");
            return;
        }
        // max player count is either what passed otherwise number of total lines
        const maxPlayerCount = props.maxPlayerCount ? props.maxPlayerCount : (checkRows) * (checkCols - 1) + (checkRows - 1) * (checkCols);
        if (checkPlayerCount < 2) {
            alert("At least 2 players");
            return;
        }
        if (checkPlayerCount > maxPlayerCount) {
            alert("At most " + maxPlayerCount + " players are allowed");
            return;
        }

        // by this point everything is valid so let the parent component handle the start of the game
        props.handleStartGame(rows, cols, playerCount);

    }
    return (
        // idea: maybe also make the input as a list of options to choose
        // idea2: maybe use arrow keys to let user increment decrement rows or cols count with taps, beside just typing
        // if more time allows, one of the ideas above can be implemented
        <div className="Landing">
            <input className="input-field" name="numRows" placeholder="Enter # of rows ..." onChange={(event) => setRows(event.target.value)} />
            <input className="input-field" name="numCols" placeholder="Enter # of columns ..." onChange={(event) => setColumns(event.target.value)} />
            <input className="input-field" name="numPlayers" placeholder="Enter # of players .." onChange={(event) => setPlayerCount(event.target.value)} />
            <button className="input-button" onClick={handleStartGame}>Start game</button>
            <div className="input-instructions">
                {/* ADD INSTRUCTIONS OVER HERE: how inputs are valid */}
            </div>
            <div className="game-instructions">
                {/* ADD INSTRUCTIONS OVER HERE: how inputs are valid */}
            </div>
        </div>
    );
}

export default Landing;