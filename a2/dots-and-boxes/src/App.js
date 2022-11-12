// import logo from './logo.svg';
// import './App.css';
// probably use index.css as the global css file: assignment requires exactly one css styles sheet to be used


import Landing from './components/Landing'
import Game from './components/Game'
import Stats from './components/Stats'
import { useState } from 'react'
// import Landing from './components/Landing'
// import Stats from './components/Stats'

function App() {

  // state: 0-> landing, 1-> game, 2-> stats
  const [state, setState] = useState(0);
  const [args, setArgs] = useState(null);
  const [history, setHistory] = useState({});

  const handleStartGame = (rows, cols, playerCount) => {
    setArgs({
      rows: rows,
      cols: cols,
      playerCount: playerCount,
    })
    setState(1);
  }

  // const handleEndGame = (history) => {
  //   // TODO: not fully implemented yet
  //   setArgs({
  //     history: history,
  //   })
  //   setState(2);
  // }
  
  // const handleRestartGame = () => {
  //   // TODO: not fully implemented yet
  //   setState(0);
  // }

  if (state === 0) {
    return (
      <div className="App">
        <Landing handleStartGame={handleStartGame} maxPlayerCount={6}/>
      </div>
    );
  }
  if (state === 1) {
    console.log("again");
    return (
      <div className="App">
        <Game boardId="uniqueBoard1" rows={args.rows} cols={args.cols} playerCount={args.playerCount} />
      </div>
    );
  }
  if (state === 2) {
    return (
      <div className="App">
        <Stats />
      </div>
    );
  }

  return (
    <div className="App">
      Invalid state {state}
    </div>
  );

}

export default App;
