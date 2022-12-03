// probably use index.css as the global css file: assignment requires exactly one css styles sheet to be used

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PROXY from './Global'

import Landing from './components/Landing'
import Game from './components/Game'
import Stats from './components/Stats'
import { useState } from 'react'
// import Landing from './components/Landing'
// import Stats from './components/Stats'
function App() {
  const navigate = useNavigate();

  // state: 0-> landing, 1-> game, 2-> stats
  const [state, setState] = useState(0);
  const [statArgs, setStatArgs] = useState(null);
  const [gameArgs, setGameArgs] = useState(null);

  const handleStartGame = (rows, cols, playerCount) => {
    setGameArgs({
      rows: rows,
      cols: cols,
      playerCount: playerCount,
    })
    setState(1);
  }

  const handleEndGame = (history) => {
    // console.log("App received history");
    // console.log(history);
    // set the args without loosing the previous ones (this will allow user to restart game with same args)
    setStatArgs({ history: history });
    setState(2);
  }

  const handleRestartGame = () => {
    setState(1);
  }

  const handleGoToLanding = () => {
    setState(0);
  }

  // if (state === 0) {
  //   return (
  //     <div className="App">
  //       <Landing handleStartGame={handleStartGame} maxPlayerCount={colors.length} />
  //     </div>
  //   );
  // }
  // if (state === 1) {
  //   // console.log("again");
  //   return (
  //     <div className="App">
  //       <Game boardId="uniqueBoard1" rows={gameArgs.rows} cols={gameArgs.cols} playerCount={gameArgs.playerCount} colors={colors} handleEndGame={handleEndGame} handleGoToLanding={handleGoToLanding} />
  //     </div>
  //   );
  // }
  // if (state === 2) {
  //   return (
  //     <div className="App">
  //       <Stats historyGame={statArgs.history} handleRestartGame={handleRestartGame} handleGoToLanding={handleGoToLanding} colors={colors} />
  //     </div>
  //   );
  // }

  const handleCreateGame = (username, rows, cols, playerCount) => {
    console.log(`App:handleCreateGame: received username: ${username}, rows: ${rows}, cols: ${cols}, playerCount: ${playerCount}`);
    // do a  POST request to create game
    // success: move forward
    // fail: do not go anywhere
    let json_response = null;
    const requestOptions = {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "username": username,
        "rows": rows,
        "cols": cols,
        "numPlayers": playerCount
      })
    };
    fetch(PROXY+'/createGame', requestOptions)
      .then(response => response.json())
      .then(data => { console.log("App:handleCreateGame: data is ", data); json_response = data; })
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

          const gamePasscode = json_response["shared"]["gamePasscode"];
          handleJoinGame(username, gamePasscode);
        }
      );
  }
  const handleJoinGame = (username, gamePasscode) => {
    console.log(`App:handleJoinGame: received  username: ${username}, gamePasscode: ${gamePasscode}`);
    // do a POST request to game passcode link
    // if successful then call parent function, otherwise prompt to enter again a valid existing game passcode
    let json_response = null;
    const requestOptions = {
      method: 'POST',
      credentials: "include", // CORS cookie issues
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "username": username
      })
    };
    fetch(PROXY+'/game/' + gamePasscode, requestOptions)
      .then(response => response.json())
      .then(data => { console.log("App:handleJoinGame: data is ", data); json_response = data; })
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

          const gamePasscode = json_response["shared"]["gamePasscode"];
          navigate("joingame/" + gamePasscode);
        }
      );
  }




  return (
    <Routes>
      <Route path="/" element={<Landing handleCreateGame={handleCreateGame} handleJoinGame={handleJoinGame} maxPlayerCount={colors.length} />} />
      {/* avoid confliting name with server: so joingame instead of just game */}
      <Route path="joingame/:gamePasscode" element={<Game />} />
      <Route path="stats/:gamePasscode" element={<Stats />} />
      {/* redirect to home page for any invalid link */}
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );

}

export default App;
const colors = ["red", "green", "blue", "yellow", "orange", "pink", "purple"];