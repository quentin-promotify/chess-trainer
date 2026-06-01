import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

export default function Board({ game, setGame, playerColor, hintMove, onPlayerMove, isThinking, boardWidth }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoveSquares, setLegalMoveSquares] = useState({});

  function makeMove(from, to) {
    const gameCopy = new Chess();
    const pgn = game.pgn();
    if (pgn) gameCopy.loadPgn(pgn);
    const move = gameCopy.move({ from, to, promotion: 'q' });
    if (!move) return false;
    setGame(gameCopy);
    onPlayerMove(gameCopy.fen(), gameCopy);
    return true;
  }

  function onDrop({ piece, sourceSquare, targetSquare }) {
    if (isThinking) return false;
    const movingColor = piece?.pieceType?.[0] === 'w' ? 'white' : 'black';
    if (movingColor !== playerColor) return false;
    const result = makeMove(sourceSquare, targetSquare);
    if (result) { setSelectedSquare(null); setLegalMoveSquares({}); }
    return result;
  }

  function onSquareClick({ square }) {
    if (isThinking) return;
    if (game.turn() !== playerColor[0]) return;

    const piece = game.get(square);

    if (piece && piece.color === playerColor[0]) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      const highlights = {};
      moves.forEach((move) => {
        highlights[move.to] = {
          background: game.get(move.to)
            ? 'radial-gradient(circle, rgba(255,0,0,0.4) 75%, transparent 75%)'
            : 'radial-gradient(circle, rgba(0,0,0,0.2) 25%, transparent 25%)',
          borderRadius: '50%',
        };
      });
      highlights[square] = { background: 'rgba(255, 255, 0, 0.4)' };
      setLegalMoveSquares(highlights);
      return;
    }

    if (selectedSquare && legalMoveSquares[square]) {
      setSelectedSquare(null);
      setLegalMoveSquares({});
      makeMove(selectedSquare, square);
      return;
    }

    setSelectedSquare(null);
    setLegalMoveSquares({});
  }

  const arrows = hintMove
    ? [{ startSquare: hintMove.from, endSquare: hintMove.to, color: 'rgba(0,200,100,0.8)' }]
    : [];

  return (
    <Chessboard options={{
      position: game.fen(),
      onPieceDrop: onDrop,
      onSquareClick,
      squareStyles: legalMoveSquares,
      boardOrientation: playerColor,
      arrows,
      animationDurationInMs: 200,
      allowDrawingArrows: false,
      boardStyle: { width: boardWidth, height: boardWidth },
    }} />
  );
}
