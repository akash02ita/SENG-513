// import React from 'react';

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Stats(props) {
    const navigate = useNavigate();
    const { gamePasscode } = useParams();
    const [gameData, setGameData] = useState(null);

    useEffect(() => {
        let json_response = null;
        fetch('/game/' + gamePasscode)
            .then(response => response.json())
            .then(data => { console.log("Stats:getData: data is ", data); json_response = data; })
            .then(
                () => {
                    if (!json_response) {
                        alert("No response received");
                        return;
                    }
                    const status = json_response["status"];
                    if (status !== 'success') {
                        alert(json_response["description"]);
                        return;
                    }

                    setGameData(json_response["shared"]);
                }
            );
    }, []);

    const playerColors = props.colors ? props.colors : ["red", "green", "blue", "yellow", "orange", "pink", "purple"];

    const renderGameStatus = () => {
        if (!gameData) {
            return (<div></div>);
        }
        const historyGame = gameData["history"];
        const lastStatus = historyGame[historyGame.length - 1];

        const playersScore = { ...lastStatus.playersScore };
        const maxScore = Math.max(...Object.values(playersScore));
        const winnerEntries = Object.entries(playersScore).filter(([key, value]) => value === maxScore);
        
        const winner_s = winnerEntries.length === 1 ? "winner" : "winners";
        const is_are = winnerEntries.length === 1 ? "is" : "are";
        const divWinners = winnerEntries.map(([playerName, _playerScore]) => {
            const userIndex = parseInt(playerName.split('player')[1]);
            const username = gameData["users"][userIndex];

            return (<div key={playerName} className="player-winner">
                {username}
            </div>);
        })
        return (<div className="player-winner-list">
            Ladies and Gentlemen, we would like to show you that the {winner_s} {is_are}:
            {divWinners}
            <div className="max-score">
                Highest Score achieved by the {winner_s}: {maxScore}
            </div>
        </div>);
    }
    
    const renderPlayersSCore = () => {
        if (!gameData) {
            return (<div></div>);
        }
        const historyGame = gameData["history"];
        const lastStatus = historyGame[historyGame.length - 1];

        
        const playersScore = lastStatus.playersScore;
        const divPlayersScore = Object.entries(playersScore).map(([playerName, playersScore]) => {
            const userIndex = parseInt(playerName.split('player')[1]);
            const username = gameData["users"][userIndex];

            const playerClr = playerColors[userIndex];
            return (
                <div key={playerName} className="player-score" style={{ color: playerClr }}>
                    {username} : {playersScore}
                </div>
            );
        });
        return (<div className="players-score-list">
            Here the score of all the players:
            {divPlayersScore}
        </div>);
    }

    return (
        <div className="Stats">
            {renderGameStatus()}
            {renderPlayersSCore()}
            <button onClick={() => navigate("/")}>Home</button>
            {/* <button onClick={() => props.handleRestartGame()}>Restart Game</button> */}
        </div>
    );
}

export default Stats;