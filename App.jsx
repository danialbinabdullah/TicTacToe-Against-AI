import React, { useState } from 'react';
import axios from 'axios';

const API_KEY = "Enter your api key here"; // secure -> environment variable          'Authorization': `Bearer + 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}`,

const App = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);
  const [xIsNext, setXIsNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [log, setLog] = useState('');

  // Function to handle square click
  const handleClick = async (i) => {
    if (gameOver || board[i]) return;

    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);

    const winner = calculateWinner(newBoard);
    if (winner) {
      setWinner(winner);
      setGameOver(true);
      return;
    }

    setXIsNext(!xIsNext);

    // Make GPT-3 play
    const gptMove = await getGPTMove(newBoard);
    if (gptMove !== -1) {
      newBoard[gptMove] = 'O';
      setBoard(newBoard);

      const winner = calculateWinner(newBoard);
      if (winner) {
        setWinner(winner);
        setGameOver(true);
      }
      setXIsNext(true);
    }
  };

  function extractIntegers(text) {
    const regex = /\b\d+\b/g;
    const integers = text.match(regex);
    return integers ? integers.map(Number) : [];
  }

/*
const getGPTMove = async (currentBoard) => {
  const prompt = `We are playing Tic Tac Toe and its your move now. The current board is ${currentBoard.map(square => square ? square : '-').join('')}. First index is 0 and last is 9. Give your move as player O, strictly give a single character output so just give the index, so your response would be just one integer character between 0 and 8 which does not overwrite any currently taken index`;
  setLog(prompt);

  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: prompt,
        max_tokens: 100,
        n: 1,
        temperature: 0.7,
      })
    });

 
    if (!response.ok) {
      setLog("stuck");
      throw new Error('Failed to fetch GPT-3 move');
    }
    
    const responseData = await response.json();
    setLog(responseData.choices[0]);
    const cleaned = extractIntegers(responseData.choices[0].text);

    const gptMove = parseInt(cleaned);

    setLog("GPT Raw Output: " + responseData.choices[0].text + "\n GPT PareInt Output : " + gptMove + "\n on prompt : "+ prompt);
    return gptMove;
  } catch (error) {
    console.error('Error fetching GPT-3 move:', error);
    return getRandomMove(currentBoard);
  }
};

*/
const getGPTMove = async (currentBoard) => {
  let gptMove = -1; // Initialize gptMove to an invalid value

  while (gptMove === -1) { // Loop until a valid move is obtained
    const prompt = `Tic Tac Toe. The board is ${currentBoard.map(square => square ? square : '-').join('')}. Your move as O, give a single character output so just give the index, so your response would be just one character`;
    setLog(prompt);

    try {
      const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo-instruct',
          prompt: prompt,
          max_tokens: 100,
          n: 1,
          temperature: 0.7,
        })
      });
  
   
      if (!response.ok) {
        setLog("stuck");
        throw new Error('Failed to fetch GPT-3 move');
      }
      
      const responseData = await response.json();
      const cleaned = extractIntegers(responseData.choices[0].text);
      gptMove = parseInt(cleaned);
  
      setLog("GPT Move : " + cleaned);
      // Check if gptMove is a valid integer and doesn't overwrite a current index
      if (isNaN(gptMove) || currentBoard[gptMove] !== null) {
        gptMove = -1; // Set gptMove to -1 to retry the loop
      }
    } catch (error) {
      console.error('Error fetching GPT-3 move:', error);
      
    }
  }

  return gptMove;
};


  // Function to calculate winner
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  // Function to render square
  const renderSquare = (i) => (
    <button className="square" onClick={() => handleClick(i)}>
      {board[i]}
    </button>
  );

  // Render the game board
  const renderBoard = () => (
    <div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );

  // Render game status
  const renderStatus = () => {
    if (winner) {
      return `Winner: ${winner}`;
    } else if (board.every((square) => square !== null)) {
      return 'Draw!';
    } else {
      return `Next player: ${xIsNext ? 'X' : 'O'}`;
    }
  };

  return (
    <div className="background">
      <div className="game">
        <div className="card">
          <div className="game-board">
            <div className="status">{renderStatus()}</div>
            {renderBoard()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
