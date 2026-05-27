import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

export default function Board({ game, setGame, playerColor, hintMove, onPlayerMove, isThinking, boardWidth }) {
  function onDrop({ piece, sourceSquare, targetSquare }) {
    if (isThinking) return false;

    // Only allow the player to move their own pieces
    const movingColor = piece?.pieceType?.[0] === 'w' ? 'white' : 'black';
    if (movingColor !== playerColor) return false;

    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    if (!move) return false;

    setGame(gameCopy);
    onPlayerMove(gameCopy.fen(), gameCopy);
    return true;
  }

  const arrows = hintMove
    ? [{ startSquare: hintMove.from, endSquare: hintMove.to, color: 'rgba(0,200,100,0.8)' }]
    : [];

  return (
    <Chessboard options={{
      position: game.fen(),
      onPieceDrop: onDrop,
      boardOrientation: playerColor,
      arrows,
      animationDurationInMs: 200,
      allowDrawingArrows: false,
      boardStyle: { width: boardWidth, height: boardWidth },
    }} />
  );
}
