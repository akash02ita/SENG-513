// import React from 'react';

import { useState } from "react";
import leftArrow from "../assets/icons8-double-left-96.png"
import rightArrow from "../assets/icons8-double-right-96.png"

/*
    Idea:
    - show welcome message
    - prompt user for size of board
    - 
*/

function Landing(props) {
    const [username, setUsername] = useState(null);
    const [rows, setRows] = useState(4);
    const [cols, setColumns] = useState(4);
    const [playerCount, setPlayerCount] = useState(3);

    const [gamePasscode, setGamePasscode] = useState(null);

    const handleCreateGame = () => {
        if (!username) {
            alert("Invalid username");
            return;
        }
        // ensure all fields are valid
        // console.log("handleStartGame: see data input");
        // console.log("rows: " + rows);
        // console.log("cols: " + cols);
        // console.log("playerCount: " + playerCount);
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
        props.handleCreateGame(username, rows, cols, playerCount);

    }
    const handleJoinGame = () => {
        if (!username) {
            alert("Invalid username");
            return;
        }
        console.log("Landing: handleJoinGame: gamePasccode is " + gamePasscode);
        // passcode should be numeric digits only
        if (!gamePasscode || gamePasscode.match(/^[0-9]+$/) === null) {
            alert("Invalid gamePasscode. Only digits allowed.");
            return;
        }

        props.handleJoinGame(username, gamePasscode);
    }

    const [cardNum, setCardNum] = useState(0);
    const totCards = 6;
    const renderCard = () => {
        {/* https://www.w3schools.com/charsets/ref_emoji_smileys.asp */ }
        if (cardNum === 0) {
            return (<div className="input-instructions">
                {/* ADD INSTRUCTIONS OVER HERE: how inputs are valid */}
                <h1>Welcome to the Game!</h1>
                <h1>&#128527;</h1>
            </div>);
        }
        if (cardNum === 1) {
            return (<div className="input-instructions">
                <h3>Here is how you can CREATE a game room</h3>
                <p>Minimum size is 2x2</p>
                <p>At most 7 players allowed</p>
                <p>At most 10 rows and columns allowed</p>
                <p>Click the CREATE button</p>
            </div>);
        }
        if (cardNum === 2) {
            return (<div className="input-instructions">
                <h3>Here is how you can JOIN a game room</h3>
                <p>Enter the game room passcode</p>
                <p>Click the JOIN button</p>
            </div>);
        }
        if (cardNum === 3) {
            return (<div className="game-instructions">
                {/* ADD INSTRUCTIONS OVER HERE: how inputs are valid */}
                <h3>Here is how play</h3>
                <p>Just click a line at a time!</p>
                <p>If you fill a box you get another turn!</p>
            </div>);
        }
        if (cardNum === 4) {
            return (<div className="game-instructions">
                {/* ADD INSTRUCTIONS OVER HERE: how inputs are valid */}
                <h1>Don't cheat</h1>
                <h2>My server won't let you do that &#129315;</h2>
            </div>);
        }
        if (cardNum === 5) {
            return (<div className="game-instructions">
                {/* ADD INSTRUCTIONS OVER HERE: how inputs are valid */}
                <h1>Good luck!</h1>
                <h2>I hope you enjoy the game &#128526;</h2>
            </div>);
        }

        // default answer
        return (<div className="game-instructions">
            {/* ADD INSTRUCTIONS OVER HERE: how inputs are valid */}
            <h1>Good luck!</h1>
            <h2>I hope you enjoy the game &#128526;</h2>
        </div>);
    }
    return (
        // idea: maybe also make the input as a list of options to choose
        // idea2: maybe use arrow keys to let user increment decrement rows or cols count with taps, beside just typing
        // if more time allows, one of the ideas above can be implemented
        <div className="Landing">
            <input className="input-field username" name="username" placeholder="Enter username ..." onChange={(event) => setUsername(event.target.value)} />
            <div className="create-game">
                <input className="input-field" name="numRows" placeholder="Enter # of rows: 4" onChange={(event) => setRows(event.target.value)} />
                <input className="input-field" name="numCols" placeholder="Enter # of columns: 4" onChange={(event) => setColumns(event.target.value)} />
                <input className="input-field" name="numPlayers" placeholder="Enter # of players: 3" onChange={(event) => setPlayerCount(event.target.value)} />
                <button className="input-button" onClick={handleCreateGame}>Create game</button>
            </div>

            <div className="join-game">
                <input className="input-field" name="gamePasscode" placeholder="...enter room #" onChange={(event) => setGamePasscode(event.target.value)} />
                <button className="input-button" onClick={handleJoinGame}>Join game</button>
            </div>
            <div className="swipe">
                {/* https://icons8.com/icon/set/double-left/ios */}
                <img className="swipe-button" src={leftArrow} alt="left swipe button" onClick={() => setCardNum((cardNum - 1) % totCards)} />
                <div className="swipe-card">
                    {renderCard()}
                </div>
                {/* https://icons8.com/icon/37225/double-right */}
                <img className="swipe-button" src={rightArrow} alt="right swipe button" onClick={() => setCardNum((cardNum + 1) % totCards)} />
            </div>
        </div>
    );
}

export default Landing;
