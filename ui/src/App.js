import { useState } from 'react';
import './App.css';
import RulesScreen from './rulesScreen';
import GameScreen from './gameScreen';
import Scoreboard from './scoreboard';

function App() {
  const [showing, setShowing] = useState('rules')

  if (showing === 'rules') {
    return (
    <RulesScreen setShowing={setShowing} />
    );
  } else if (showing === 'game') {
    return (
    <GameScreen setShowing={setShowing} />
    );
  } else if (showing === 'scoreboard') {
    return (
      <Scoreboard setShowing={setShowing} />
    )
  }
}

export default App;
