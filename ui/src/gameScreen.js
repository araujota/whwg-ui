import { useEffect, useRef, useState  } from 'react';
import './App.css';
import axios from 'axios';

function GameScreen(props) {
    const [gameTime, setGameTime] = useState(10)
    const [gameScore, setGameScore] = useState(0)
    const [prompt, setPrompt] = useState('')
    const [answer, setAnswer] = useState('')
    const [inputError, setInputError] = useState(false)
    const [inputErrorMessage, setInputErrorMessage] = useState('')
    const [promptPool, setPromptPool] = useState([])
    const [validateUrl, setValidateUrl] = useState('')
    const [isGameOver, setIsGameOver] = useState(false)
    const [showScoreModal, setShowScoreModal] = useState(false)
    const [username, setUsername] = useState('')

    const answerr = useRef(answer)
    const promptt = useRef(prompt)
    const promptPoool = useRef(promptPool)

    
    const loadPrompt = () => {
        let index = Math.floor(Math.random()*500)
        let indexWord = promptPoool.current[index].word
        if (!indexWord.includes('-') || !indexWord.includes(' ')) {
            let sliceStart = Math.floor(Math.random() * 3) + 1
            let thisPrompt = indexWord.substring(sliceStart, sliceStart+3)
            setPrompt(thisPrompt)
        } else {
            loadPrompt()
        }
    }

    const resetGame = () => {
        setIsGameOver(false)
        setGameTime(10)
        setGameScore(gameScore => (0))
        setInputError(false)
        setInputErrorMessage('')
        loadPrompt()
    }

    const answerSuccess = () => {
        setGameScore((gameScore) => (gameScore+1))
        setInputError(false)
        setInputErrorMessage('')
        setAnswer('')
        loadPrompt()
    }

    async function getPromptPool() {
        await (fetch("https://api.datamuse.com/words?sp=???????&max=500"))
        .then(response => {return response.json()}
        ).then(response => {
            setPromptPool(response)
        })
    }

    const setVals = (e) => {
        setAnswer(e)
        setValidateUrl('https://api.dictionaryapi.dev/api/v2/entries/en/'+e)
    }

    const gameOver = () => {
        setIsGameOver(true)
        setInputError(true)
        setInputErrorMessage("Game Over!")
    }

    const decrement = () => {
        let newTime = gameTime-1
        setGameTime(newTime)
    }

    useEffect(() => {
        if (gameTime > 0) {
            setTimeout(decrement, 1000)
        } else {
            gameOver()
        }
    }, [gameTime])

    useEffect(() => {
        console.log(username)
    }, [username])

    useEffect(() => {
        answerr.current = answer
    }, [answer])

    useEffect(() => {
        promptt.current = prompt
    }, [prompt])

    useEffect(() => {
        promptPoool.current = promptPool
    }, [promptPool])

    useEffect(() => {
        getPromptPool()
    }, [])

    useEffect(() => {
        if(promptPool.length > 0) {
            loadPrompt()
        }
    }, [promptPool])

    const handleValidate = () => {
        validate()
    }

    const handleKeyDown = (e) => {
            if(e.keyCode === 13) {
                handleValidate()
            }
      }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
      }, []);

    async function validate() {
        let start = answerr.current.slice(0,3)
        let end = answerr.current.slice(answerr.current.length-3, answerr.current.length)
        console.log(promptt.current)
        console.log(answerr.current)

        await (fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+answerr.current)
            .then(response => {
                return response;
            })
            .then(response => {
                if ((response.status == 200) && (start !== promptt.current) && (end !== promptt.current) && answerr.current.includes(promptt.current)) {
                    answerSuccess()
                } else {
                    if(response.status == 404) {
                        setInputErrorMessage('Not a Word!')
                        setInputError(true)
                        setAnswer('')
                    } else if (start === promptt.current) {
                        setInputErrorMessage('Answer cannot start with the prompt!')
                        setInputError(true)
                        setAnswer('')
                    } else if (end === promptt.current) {
                        setInputErrorMessage('Answer cannot end with the prompt!')
                        setInputError(true)
                        setAnswer('')
                    } else if (!answerr.current.includes(promptt.current)){
                        setInputErrorMessage('Answer must contain the prompt!')
                        setInputError(true)
                        setAnswer('')
                    }
                }
            }))
    }

    const saveAndSubmit = () => {
        const payload = {
            username: username,
            score: gameScore
        }
        axios.post('http://localhost:8080/score', payload).then((response) => {
            if (response.status == 200) {
                props.setShowing('scoreboard')
            }
        })
    }

    function ShowInputError({bool, errorMessage}) {
        if (bool == true) {
            if (errorMessage == 'Game Over!') {
                return (
                    <>
                        <div className='inputError'>
                            <text style={{fontSize: '2em'}}>{errorMessage}</text>
                        </div>
                        <div className='playOrSave'>
                            <text onClick={() => resetGame()} style={{fontSize: '2em', textDecoration: 'underline'}}>Play Again</text>
                            <text style={{fontSize: '2em'}}> or </text>
                            <text onClick={() => setShowScoreModal(true)} style={{fontSize: '2em', textDecoration: 'underline'}} >Save</text>
                        </div>
                    </>
                )
            } else {
                return (
                    <div className='inputError'>
                        <text style={{fontSize: '2em'}}>{errorMessage}</text>
                    </div>
                )
            }
        }
    }

    function ShowEnterScoreModal({bool, score}) {
        if (bool == true) {
            return (
                <>
                    <div className='enterScoreModal'>
                        <text style={{fontSize: '3em'}}>You scored {score}</text>
                        <text style={{fontSize: '3em'}}>Enter a name to save your score</text>
                        <input onChange={(e) => setUsername(e.target.value)} className='nameInput' value={username}></input>
                        <text onClick={() => saveAndSubmit()} style={{fontSize: '2em', textDecoration: 'underline'}} >Save</text>
                    </div>
                </>
            )
        }
    }

  return (
    <div className="container">
      <span className='topper'>WHWG</span>
        <div className='gameBox'>
            <div className='attributesContainer'>
                <div className='featureBox'>
                    <text className='timeScoreText'>TIME</text>
                    <text className='timeText'>{gameTime}</text>
                </div>
                <div className='featureBoxPrompt'>
                    <text className='promptText'>[{prompt}]</text>
                </div>
                <div className='featureBox'>
                    <text className='timeScoreText'>SCORE</text>
                    <text className='timeText'>{gameScore}</text>
                </div>
            </div>
            <div className='inputContainer'>
                <div>
                    <span style={{fontSize: '6em'}}>[</span>
                    <input disabled={isGameOver} className='answerInput' onChange={e => setVals(e.target.value)} value={answer}></input>
                    <span style={{fontSize: '6em'}}>]</span>
                </div>
                <ShowInputError bool={inputError} errorMessage={inputErrorMessage}/>
                {ShowEnterScoreModal ({bool: showScoreModal}, {score: gameScore})}
            </div>
        </div>
    </div>
  );
}

export default GameScreen;