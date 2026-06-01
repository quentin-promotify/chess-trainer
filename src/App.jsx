import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import Board from './components/Board';
import EvalBar from './components/EvalBar';
import Controls from './components/Controls';
import MoveHistory from './components/MoveHistory';
import { useStockfish } from './hooks/useStockfish';
import './App.css';

function useBoardWidth() {
  const compute = () =>
    Math.min(480, Math.max(280, window.innerWidth - 180 - 20 - 32 - 48));
  const [w, setW] = useState(compute);
  useEffect(() => {
    const onResize = () => setW(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

export default function App() {
  const boardWidth = useBoardWidth();
  const [game, setGame] = useState(new Chess());
  const [evaluation, setEvaluation] = useState(0);
  const [showEvalBar, setShowEvalBar] = useState(true);
  const [hintMove, setHintMove] = useState(null);
  const [playerColor, setPlayerColor] = useState('white');
  const [isThinking, setIsThinking] = useState(false);
  const [gameOver, setGameOver] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const { getBestMove, setSkillLevel } = useStockfish();

  const playerColorRef = useRef(playerColor);
  useEffect(() => { playerColorRef.current = playerColor; }, [playerColor]);

  const checkGameOver = useCallback((g) => {
    if (g.isCheckmate()) {
      setGameOver(`Checkmate! ${g.turn() === 'w' ? 'Black' : 'White'} wins.`);
    } else if (g.isStalemate()) {
      setGameOver('Stalemate — draw!');
    } else if (g.isDraw()) {
      setGameOver('Draw!');
    }
  }, []);

  // makeBotMove accepts a Chess instance to preserve full move history
  const makeBotMove = useCallback(async (currentGame) => {
    setIsThinking(true);
    const fen = currentGame.fen();
    try {
      const { bestMove, evaluation: ev } = await getBestMove(fen, 15);
      if (bestMove && bestMove !== '(none)') {
        // Copy via PGN to preserve history
        const gameCopy = new Chess();
        const pgn = currentGame.pgn();
        if (pgn) gameCopy.loadPgn(pgn);
        gameCopy.move({ from: bestMove.slice(0, 2), to: bestMove.slice(2, 4), promotion: 'q' });
        setGame(gameCopy);
        setMoveHistory(gameCopy.history({ verbose: true }));
        setEvaluation(currentGame.turn() === 'b' ? -(ev ?? 0) : (ev ?? 0));
        checkGameOver(gameCopy);
      }
    } finally {
      setIsThinking(false);
    }
  }, [getBestMove, checkGameOver]);

  const handlePlayerMove = useCallback(async (fen, gameCopy) => {
    setIsThinking(true); // disable hint/moves immediately while we evaluate + bot responds
    checkGameOver(gameCopy);
    setMoveHistory(gameCopy.history({ verbose: true }));
    if (gameCopy.isGameOver()) {
      setIsThinking(false);
      return;
    }
    try {
      const { evaluation: ev } = await getBestMove(fen, 10);
      setEvaluation(gameCopy.turn() === 'b' ? -(ev ?? 0) : (ev ?? 0));
    } catch { /* cancelled if makeBotMove starts first */ }
    makeBotMove(gameCopy); // makeBotMove manages isThinking(true/false) internally
  }, [getBestMove, makeBotMove, checkGameOver]);

  // When player chooses black, bot opens as white
  useEffect(() => {
    if (playerColor === 'black' && game.turn() === 'w' && game.history().length === 0) {
      makeBotMove(game);
    }
  }, [playerColor]); // eslint-disable-line react-hooks/exhaustive-deps

  const requestHint = useCallback(async () => {
    try {
      const { bestMove } = await getBestMove(game.fen(), 15);
      if (bestMove && bestMove !== '(none)') {
        setHintMove({ from: bestMove.slice(0, 2), to: bestMove.slice(2, 4) });
        setTimeout(() => setHintMove(null), 3000);
      }
    } catch { /* cancelled */ }
  }, [getBestMove, game]);

  const handleUndo = useCallback(() => {
    const gameCopy = new Chess();
    const pgn = game.pgn();
    if (pgn) gameCopy.loadPgn(pgn);

    const movesToUndo = gameCopy.history().length >= 2 ? 2 : 1;
    for (let i = 0; i < movesToUndo; i++) gameCopy.undo();

    setGame(gameCopy);
    setMoveHistory(gameCopy.history({ verbose: true }));
    setHintMove(null);
    setGameOver(null);
    setEvaluation(0);
  }, [game]);

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setEvaluation(0);
    setHintMove(null);
    setGameOver(null);
    setMoveHistory([]);
    if (playerColorRef.current === 'black') {
      makeBotMove(newGame);
    }
  }, [makeBotMove]);

  const handleColorChange = useCallback((color) => {
    setPlayerColor(color);
    const newGame = new Chess();
    setGame(newGame);
    setEvaluation(0);
    setHintMove(null);
    setGameOver(null);
    setMoveHistory([]);
    if (color === 'black') {
      setTimeout(() => makeBotMove(newGame), 0);
    }
  }, [makeBotMove]);

  return (
    <div className="app-layout">
      {showEvalBar && (
        <EvalBar evaluation={evaluation} playerColor={playerColor} height={boardWidth} />
      )}
      <div className="board-area" style={{ width: boardWidth }}>
        {gameOver && (
          <div className="game-over-banner">
            <span>{gameOver}</span>
            <button onClick={resetGame}>New Game</button>
          </div>
        )}
        <Board
          game={game}
          setGame={setGame}
          playerColor={playerColor}
          isThinking={isThinking}
          hintMove={hintMove}
          onPlayerMove={handlePlayerMove}
          boardWidth={boardWidth}
        />
      </div>
      <div className="sidebar">
        <Controls
          onHint={requestHint}
          onReset={resetGame}
          onToggleEval={() => setShowEvalBar((v) => !v)}
          showEvalBar={showEvalBar}
          onSkillChange={setSkillLevel}
          isThinking={isThinking}
          playerColor={playerColor}
          onColorChange={handleColorChange}
          onUndo={handleUndo}
          canUndo={moveHistory.length > 0}
        />
        <MoveHistory history={moveHistory} />
      </div>
    </div>
  );
}
