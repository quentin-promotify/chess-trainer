import { useEffect, useRef, useCallback } from 'react';

export function useStockfish() {
  const workerRef = useRef(null);
  const pendingRef = useRef(null); // track in-flight request so we can cancel it

  useEffect(() => {
    workerRef.current = new Worker('/stockfish.js');
    workerRef.current.postMessage('uci');
    workerRef.current.postMessage('setoption name Skill Level value 10');
    return () => workerRef.current?.terminate();
  }, []);

  const getBestMove = useCallback((fen, depth = 15) => {
    const worker = workerRef.current;

    // Cancel any in-flight search: reject its promise and stop the engine
    if (pendingRef.current) {
      const { handler, reject } = pendingRef.current;
      worker.removeEventListener('message', handler);
      worker.postMessage('stop');
      reject(new Error('cancelled'));
      pendingRef.current = null;
    }

    return new Promise((resolve, reject) => {
      let bestMove = null;
      let evaluation = null;

      const handler = (e) => {
        const msg = e.data;
        if (msg.startsWith('info') && msg.includes('score cp')) {
          const match = msg.match(/score cp (-?\d+)/);
          if (match) evaluation = parseInt(match[1], 10) / 100;
        }
        if (msg.startsWith('info') && msg.includes('score mate')) {
          const match = msg.match(/score mate (-?\d+)/);
          if (match) evaluation = parseInt(match[1], 10) > 0 ? Infinity : -Infinity;
        }
        if (msg.startsWith('bestmove')) {
          bestMove = msg.split(' ')[1];
          worker.removeEventListener('message', handler);
          pendingRef.current = null;
          resolve({ bestMove, evaluation });
        }
      };

      pendingRef.current = { handler, reject };
      worker.addEventListener('message', handler);
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${depth}`);
    });
  }, []);

  const setSkillLevel = useCallback((level) => {
    workerRef.current?.postMessage(`setoption name Skill Level value ${level}`);
  }, []);

  return { getBestMove, setSkillLevel };
}
