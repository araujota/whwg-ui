import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function Scoreboard(props) {
    const [scoreData, setScoreData] = useState([])

    const getScores = () => {
        axios.get('http://44.223.184.1:8080/scores').then((response) => {
            setScoreData(response.data)
        })
    }

    useEffect(() => {
        getScores()
    }, [])

  return (
    <div className="scoreScreenContainer">
        <div style={{paddingTop: '3%', paddingBottom: '5%'}}>
          <text className='topper'>High Scores</text>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-around', width: '70vw'}}>
          <text className='timeScoreText' >Name</text>
          <text className='timeScoreText' >Score</text>
        </div>
        <div style={{ height: '50%', width: '60vw', overflowY: 'scroll', display: 'inline-flex', flexDirection: 'column', marginBottom: '10px'}}>
            {scoreData?.map((score) => (
                <div key={score.id} style={{display: 'inline-flex', justifyContent: 'space-between'}}>
                    <text>{score?.username}</text>
                    <text style={{marginRight: '30px'}}>{score?.score}</text>
                </div>
            ))}
        </div>
        <div>
          <button className='startButton' onClick={() => props.setShowing('game')}>Play</button>
          <button className='startButton' onClick={() => props.setShowing('rules')}>Rules</button>
        </div>
    </div>
  );
}

export default Scoreboard;