// import React from 'react';

function Stats(props) {
    const historyGame = props.historyGame;
    const lastStatus = historyGame[historyGame.length - 1];
    const playerColors = props.colors ? props.colors : ["red", "green", "blue", "yellow", "orange", "pink", "purple"];

    const renderGameStatus = () => {
        const playersScore = { ...lastStatus.playersScore };
        const maxScore = Math.max(...Object.values(playersScore));
        const winnerEntries = Object.entries(playersScore).filter(([key, value]) => value === maxScore);

        const winner_s = winnerEntries.length === 1 ? "winner" : "winners";
        const is_are = winnerEntries.length === 1 ? "is" : "are";
        const divWinners = winnerEntries.map(([playerName, _playerScore]) => {
            return (<div key={playerName} className="player-winner">
                {playerName}
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
        const playersScore = lastStatus.playersScore;
        const divPlayersScore = Object.entries(playersScore).map(([playerName, playersScore]) => {
            const playerClr = playerColors[parseInt(playerName.split('player')[1])];
            return (
                <div key={playerName} className="player-score" style={{color: playerClr}}>
                    {playerName} : {playersScore}
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
            <button onClick={() => props.handleGoToLanding()}>Home</button>
            <button onClick={() => props.handleRestartGame()}>Restart Game</button>
        </div>
    );
}

export default Stats;