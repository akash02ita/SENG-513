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
    const [rows, setRows] = useState(null);
    const [cols, setColumns] = useState(null);
    const [playerCount, setPlayerCount] = useState(null);

    const [gamePasscode, setGamePasscode] = useState(null);

    const handleCreateGame = () => {

    }
    const handleJoinGame = () => {

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
            <div className="create-game">
                <input className="input-field" name="numRows" placeholder="Enter # of rows ..." onChange={(event) => setRows(event.target.value)} />
                <input className="input-field" name="numCols" placeholder="Enter # of columns ..." onChange={(event) => setColumns(event.target.value)} />
                <input className="input-field" name="numPlayers" placeholder="Enter # of players .." onChange={(event) => setPlayerCount(event.target.value)} />
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
