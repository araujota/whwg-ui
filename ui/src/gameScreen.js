import { useEffect, useRef, useState } from 'react';
import './App.css';
import axios from 'axios';

function GameScreen(props) {
    const [gameTime, setGameTime] = useState(20);
    const [gameScore, setGameScore] = useState(0);
    const [prompt, setPrompt] = useState('');
    const [answer, setAnswer] = useState('');
    const [inputError, setInputError] = useState(false);
    const [inputErrorMessage, setInputErrorMessage] = useState('');
    const [promptPool, setPromptPool] = useState([]);
    const [validateUrl, setValidateUrl] = useState('');
    const [isGameOver, setIsGameOver] = useState(false);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');

    const answerr = useRef(answer);
    const promptt = useRef(prompt);
    const promptPoool = useRef(promptPool);

    const loadPrompt = () => {
        const isAlpha = (str) => /^[A-Za-z]+$/.test(str);

        let newPrompt = "";
        while (!isAlpha(newPrompt)) {
            let index = Math.floor(Math.random() * 500);
            let indexWord = promptPoool.current[index].word;
            if (isAlpha(indexWord)) {
                let sliceStart = Math.floor(Math.random() * 3) + 1;
                newPrompt = indexWord.substring(sliceStart, sliceStart + 3);
            }
        }
        setPrompt(newPrompt);
    };

    const resetGame = () => {
        setIsGameOver(false);
        setGameTime(20);
        setGameScore(0);
        setInputError(false);
        setInputErrorMessage('');
        loadPrompt();
    };

    const answerSuccess = () => {
        setGameScore((prevScore) => prevScore + 1);
        setInputError(false);
        setInputErrorMessage('');
        setAnswer('');
        setGameTime(20);
        loadPrompt();
    };

    const getPromptPool = async () => {
        try {
            const response = await fetch("https://api.datamuse.com/words?sp=???????&max=500");
            const data = await response.json();
            setPromptPool(data);
        } catch (error) {
            console.error('Error fetching prompt pool:', error);
        }
    };

    const setVals = (e) => {
        setAnswer(e.target.value);
        setValidateUrl(`https://api.dictionaryapi.dev/api/v2/entries/en/${e.target.value}`);
    };

    const gameOver = () => {
        setIsGameOver(true);
        setInputError(true);
        setInputErrorMessage("Game Over!");
    };

    const decrement = () => {
        setGameTime((prevTime) => prevTime - 1);
    };

    useEffect(() => {
        if (gameTime > 0 && !isGameOver) {
            const timerId = setTimeout(decrement, 1000);
            return () => clearTimeout(timerId);
        } else if (gameTime === 0) {
            gameOver();
        }
    }, [gameTime, isGameOver]);

    useEffect(() => {
        answerr.current = answer;
    }, [answer]);

    useEffect(() => {
        promptt.current = prompt;
    }, [prompt]);

    useEffect(() => {
        promptPoool.current = promptPool;
    }, [promptPool]);

    useEffect(() => {
        getPromptPool();
    }, []);

    useEffect(() => {
        if (promptPool.length > 0) {
            loadPrompt();
        }
    }, [promptPool]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.keyCode === 13) {
                validate();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const validate = async () => {
        const start = answerr.current.slice(0, 3);
        const end = answerr.current.slice(-3);

        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${answerr.current}`);
            if (response.status === 200 && start !== promptt.current && end !== promptt.current && answerr.current.includes(promptt.current)) {
                answerSuccess();
            } else {
                handleValidationError(response.status, start, end);
            }
        } catch (error) {
            console.error('Error validating answer:', error);
        }
    };

    const handleValidationError = (status, start, end) => {
        if (status === 404) {
            setInputErrorMessage('Not a Word!');
        } else if (start === promptt.current) {
            setInputErrorMessage('Answer cannot start with the prompt!');
        } else if (end === promptt.current) {
            setInputErrorMessage('Answer cannot end with the prompt!');
        } else if (!answerr.current.includes(promptt.current)) {
            setInputErrorMessage('Answer must contain the prompt!');
        }
        setInputError(true);
        setAnswer('');
    };

    const saveAndSubmit = () => {
        if (username.trim() === '') {
            setUsernameError('Username cannot be empty');
            return;
        }

        const payload = {
            username,
            score: gameScore
        };
        axios.post('http://44.223.184.1:8080/score', payload)
            .then((response) => {
                if (response.status === 200) {
                    props.setShowing('scoreboard');
                }
            });
    };

    return (
        <div className="container">
            <span className='topper'>WHWG</span>
            <div className='gameBox'>
                <div className='attributesContainer'>
                    <div className='featureBox'>
                        <span className='timeScoreText'>TIME</span>
                        <span className='timeText'>{gameTime}</span>
                    </div>
                    <div className='featureBoxPrompt'>
                        <span className='promptText'>[{prompt}]</span>
                    </div>
                    <div className='featureBox'>
                        <span className='timeScoreText'>SCORE</span>
                        <span className='timeText'>{gameScore}</span>
                    </div>
                </div>
                <div className='inputContainer'>
                    <input disabled={isGameOver} className='answerInput' onChange={setVals} value={answer} />
                    {inputError && (
                        <>
                            <div className='inputError'>
                                <span className='inputErrorText'>{inputErrorMessage}</span>
                            </div>
                            {inputErrorMessage === 'Game Over!' && (
                                <div className='playOrSave'>
                                    <span onClick={resetGame} style={{ fontSize: '2em', textDecoration: 'underline' }}>Play Again</span>
                                    <span style={{ fontSize: '2em' }}> or </span>
                                    <span onClick={() => setShowScoreModal(true)} style={{ fontSize: '2em', textDecoration: 'underline' }}>Save</span>
                                </div>
                            )}
                        </>
                    )}
                    {showScoreModal && (
                        <div className='enterScoreModal'>
                            <span className='timeText'>You scored {gameScore}</span>
                            <span className='timeText'>Enter a name to save your score</span>
                            <input
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setUsernameError('');
                                }}
                                className='nameInput'
                                value={username}
                            />
                            {usernameError && <div className='inputError'>{usernameError}</div>}
                            <span onClick={saveAndSubmit} style={{ fontSize: '2em', textDecoration: 'underline' }}>Save</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GameScreen;

