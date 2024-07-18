import { useEffect, useRef, useState } from 'react';
import './App.css';
import axios from 'axios';
import ClipLoader from 'react-spinners/CircleLoader';
import Chime_01 from './assets/Chime_01.mp3'

function GameScreen(props) {
    const [gameTime, setGameTime] = useState(20);
    const [loadingValidation, setLoadingValidaton] = useState(false);
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
    const [couldAnswer, setCouldAnswer] = useState('')
    const [couldAnswerDef, setCouldAnswerDef] = useState('')
    const [saveLoading, setSaveLoading] = useState(false);

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
                setCouldAnswer(indexWord);
                getDef(indexWord);
            }
        }
        setPrompt(newPrompt);
    };

    const resetGame = () => {
        setGameTime(20);
        setGameScore(0);
        setInputError(false);
        setInputErrorMessage('');
        loadPrompt();
        setIsGameOver(false);
    };

    const playAudio = () => {
        new Audio(Chime_01).play()
      };

    const answerSuccess = () => {
        setGameScore((prevScore) => prevScore + 1);
        setInputError(true);
        setInputErrorMessage('+1');
        setTimeout(clearInputMsg, 1500)
        setAnswer('');
        setGameTime(20);
        loadPrompt();
        setLoadingValidaton(false);
    };

    const getPromptPool = async () => {
        try {
            const response = await fetch("https://api.datamuse.com/words?sp=????????&max=500");
            const data = await response.json();
            setPromptPool(data);
        } catch (error) {
            console.error('Error fetching prompt pool:', error);
        }
    };

    const setVals = (e) => {
        setAnswer(e.target.value.toLowerCase());
        setValidateUrl(`https://api.dictionaryapi.dev/api/v2/entries/en/${e.target.value}`);
    };

    const getDef = async (word) => {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (response.status === 200) {
                const data = await response.json()
                setCouldAnswerDef(data[0].meanings[0].definitions[0].definition);
            } else {
                console.error('Error getting definition');
                setCouldAnswerDef('--')
            }
    };

    const gameOver = () => {
        setIsGameOver(true);
        setInputError(true);
        setInputErrorMessage("Game Over!");
    };

    const decrement = () => {
        setGameTime((prevTime) => prevTime - 1);
    };

    const clearInputMsg = () => {
        if (inputErrorMessage !== "Game Over") {
            setInputErrorMessage('')
            setInputError(false)
        }
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
        setLoadingValidaton(true)
        const start = answerr.current.slice(0, 3);
        const end = answerr.current.slice(-3);

        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${answerr.current}`);
            if (response.status === 200 && start !== promptt.current && end !== promptt.current && answerr.current.includes(promptt.current)) {
                playAudio()
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
            setLoadingValidaton(false);
            setTimeout(clearInputMsg, 1500)
        } else if (start === promptt.current) {
            setInputErrorMessage('Answer cannot start with the prompt!');
            setLoadingValidaton(false);
            setTimeout(clearInputMsg, 1500)
        } else if (end === promptt.current) {
            setInputErrorMessage('Answer cannot end with the prompt!');
            setLoadingValidaton(false);
            setTimeout(clearInputMsg, 1500)
        } else if (!answerr.current.includes(promptt.current)) {
            setInputErrorMessage('Answer must contain the prompt!');
            setLoadingValidaton(false);
            setTimeout(clearInputMsg, 1500)
        }
        setInputError(true);
        setAnswer('');
    };

    const saveAndSubmit = () => {
        if (username.trim() === '') {
            setUsernameError('Username cannot be empty');
            return;
        }

        setSaveLoading(true);

        const payload = {
            username,
            score: gameScore
        };
        axios.post('http://44.223.184.1:8080/score', payload)
            .then((response) => {
                if (response.status === 200) {
                    setSaveLoading(false);
                    props.setShowing('scoreboard');
                }
            });
    };

    return (
        <div className="container">
            <div className='gameBox'>
            <span className='topper'>Speedle</span>
                <div className='attributesContainer'>
                    {isGameOver ? (
                            <div className='couldHave'>
                                <span className='timeScoreText'>You could have answered "{couldAnswer}"</span>
                                <span className='timeTextItalic'>"{couldAnswerDef}"</span>
                            </div>
                        ) : (
                            <>
                                <div className='featureBox'>
                                    <span className='timeScoreText'>TIME</span>
                                    <span className='timeScoreText'>{gameTime}</span>
                                </div>
                                <div className='featureBoxPrompt'>
                                    <span className='promptText'>[{prompt}]</span>
                                </div>
                                <div className='featureBox'>
                                    <span className='timeScoreText'>SCORE</span>
                                    <span className='timeScoreText'>{gameScore}</span>
                                </div>
                            </>
                        )}
                </div>
                <div className='inputContainer'>
                    <p style={{position: 'relative', top: '5px'}}>'Enter' to Submit</p>
                    <input disabled={isGameOver} autoComplete="off" className='answerInput' onChange={setVals} value={answer} />   
                        {loadingValidation ? (
                                        <div className='inputError'>
                                            <ClipLoader size={20} style={{position: 'absolute', right: '10px'}}/>
                                        </div>
                                    ) : (null)}
                    {inputError && (
                            <div className={ inputErrorMessage === '+1' ? 'inputErrorSuccess' : 'inputError' }>
                                <span className='inputErrorText'>{inputErrorMessage}</span>
                            </div>
                    )}
                    {inputErrorMessage === 'Game Over!' && (
                                <div className='playOrSave'>
                                    <button disabled={showScoreModal} onClick={resetGame} className='startButton'>Play Again</button>
                                    {/* <button disabled={showScoreModal} onClick={() => setShowScoreModal(true)}className='startButton'>Save</button> */}
                                    <button disabled={showScoreModal} onClick={() => props.setShowing('rules')}className='startButton'>Rules</button>
                                </div>
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
                            {usernameError && <div className='saveInputError'>{usernameError}</div>}
                            {saveLoading ? (
                                        <div className='inputError'>
                                            <ClipLoader size={20} style={{position: 'absolute', top: '20px', right: '10px'}}/>
                                        </div>
                                    ) : (null)}
                            <div>
                                <button onClick={saveAndSubmit} className='startButton'>Save</button>
                                <button onClick={() => setShowScoreModal(false)} className='startButton'>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GameScreen;

