// import logo from './logo.svg';
// import './App.css';

import Game from './components/Game'
// import Landing from './components/Landing'
// import Stats from './components/Stats'

function App() {
  return (
    <div className="App">
      <Game rows="2" cols="3" boardId="uniqueId1"/>
      <Game boardId="uniqueId2"/>
    </div>
  );
}

export default App;
