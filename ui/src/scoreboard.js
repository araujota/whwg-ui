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
    <div className="container">
      <span className='topper'>WHWG</span>
        <div style={{paddingTop: '3%', paddingBottom: '2%'}}>
          <text style={{fontSize: '2em'}} >Scoreboard</text>
        </div>
        <div style={{paddingBottom: '1%'}}>
          <text style={{fontSize: '2em', paddingRight: '5%'}} >Name</text>
          <text style={{fontSize: '2em', paddingLeft: '5%'}} >Score</text>
        </div>
        <div style={{ height: '60%', width: '30%', overflowY: 'scroll', display: 'inline-flex', flexDirection: 'column', marginBottom: '30px'}}>
            {scoreData?.map((score) => (
                <div key={score.id} style={{display: 'inline-flex', justifyContent: 'space-between'}}>
                    <text>{score?.username}</text>
                    <text style={{marginRight: '30px'}}>{score?.score}</text>
                </div>
            ))}
        </div>
        <text style={{position: 'absolute', bottom: 0, right: '30%'}}>Support the creator! Email me at araujota97@gmail.com or venmo me @Tyler-Araujo</text>
    </div>
  );
}

export default Scoreboard;