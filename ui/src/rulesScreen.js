import { useState } from 'react';
import './App.css';

function RulesScreen(props) {
  return (
    <div className="container">
      <span className='topper'>WHWG</span>
      <div className='rulesBlock'>
        <div style={{paddingBottom: '5%'}}>
          <text className='rulesText'>Welcome to the World's Hardest Word Game</text>
        </div>
        <div style={{paddingBottom: '5%'}}>
          <text className='rulesText'>You will receive 3-letter prompts picked from a random word in the dictionary</text>
        </div>
        <div style={{paddingBottom: '5%'}}>
          <text className='rulesText'>You will have 100 seconds to type as many words that contain the prompts as possible</text>
        </div>
        <div style={{paddingBottom: '5%'}}>
          <text className='rulesText'>But NOT at the very beginning or very end</text>
        </div>
        <div style={{paddingBottom: '5%'}}>
          <text className='rulesText'>For example, for the prompt "ice":</text>
        </div>
        <div style={{paddingBottom: '5%'}}>
          <text className='rulesText'><span style={{color: 'red'}}>ice</span>berg tr<span style={{color: 'green'}}>ice</span>p pract<span span style={{color: 'red'}}>ice</span></text>
        </div>
        <button className='startButton' onClick={() => props.setShowing('game')}>Begin</button>
      </div>
      <text style={{position: 'absolute', bottom: 0, right: '30%'}}>Support the creator! Email me at araujota97@gmail.com or venmo me @Tyler-Araujo</text>
    </div>
  );
}

export default RulesScreen;