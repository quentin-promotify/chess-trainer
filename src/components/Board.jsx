import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

export default function Board({ game, setGame, playerColor, hintMove, onPlayerMove, isThinking, boardWidth }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalSquares, setLegalSquares] = useState([]);

  function onDrop({ piece, sourceSquare, targetSquare }) {
    if (isThinking) return false;

    // Only allow the player to move their own pieces
    const movingColor = piece?.pieceType?.[0] === 'w' ? 'white' : 'black';
    if (movingColor !== playerColor) return false;

    const gameCopy = new Chess();
    const pgn = game.pgn();
    if (pgn) gameCopy.loadPgn(pgn);
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    if (!move) return false;

    setGame(gameCopy);
    onPlayerMove(gameCopy.fen(), gameCopy);
    setSelectedSquare(null);
    setLegalSquares([]);
    return true;
  }

  function onSquareClick(square) {
    if (isThinking) return;

    if (selectedSquare && legalSquares.includes(square)) {
      const gameCopy = new Chess();
      const pgn = game.pgn();
      if (pgn) gameCopy.loadPgn(pgn);

      const move = gameCopy.move({ from: selectedSquare, to: square, promotion: 'q' });
      if (move) {
        setGame(gameCopy);
        onPlayerMove(gameCopy.fen(), gameCopy);
      }
      setSelectedSquare(null);
      setLegalSquares([]);
      return;
    }

    const piece = game.get(square);
    const isPlayerPiece = piece && (
      (playerColor === 'white' && piece.color === 'w') ||
      (playerColor === 'black' && piece.color === 'b')
    );

    if (isPlayerPiece) {
      const moves = game.moves({ square, verbose: true });
      setSelectedSquare(square);
      setLegalSquares(moves.map(m => m.to));
    } else {
      setSelectedSquare(null);
      setLegalSquares([]);
    }
  }

  const customSquareStyles = {};
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.5)' };
  }
  legalSquares.forEach(sq => {
    customSquareStyles[sq] = { backgroundColor: 'rgba(0, 200, 100, 0.4)' };
  });

  const arrows = hintMove
    ? [{ startSquare: hintMove.from, endSquare: hintMove.to, color: 'rgba(0,200,100,0.8)' }]
    : [];

  return (
    <Chessboard options={{
      position: game.fen(),
      onPieceDrop: onDrop,
      onSquareClick,
      customSquareStyles,
      boardOrientation: playerColor,
      arrows,
      animationDurationInMs: 200,
      allowDrawingArrows: false,
      boardStyle: { width: boardWidth, height: boardWidth },
    }} />
  );
}
